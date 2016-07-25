import os from 'os'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import _ from 'lodash'
import keypair from 'keypair'
import cycle from '../lib/cycle'
import bunyanStream from './bunyan-stream'
import setupServer from './setup-server'
import setupSocket from './setup-socket'
import SSHMan from './ssh-manager'
import CmdMan from './command-manager'
import UserManager from './user-manager'

function NodeMonkey(opts) {
  const NODE_ENV = process.NODE_ENV
  let options = this.options = _.merge({
    server: {
      // You can provide your own server and Node Monkey will use it instead of creating its own.
      // However, this MUST be the underlying http server instance, not the express/restify/whatever app.
      server: null,

      host: '0.0.0.0',
      port: 50500,
      silent: false,
      bufferSize: 50,

      // Only takes effect when Node Monkey is attached to the console
      disableLocalOutput: false
    },
    client: {
      showCallerInfo: NODE_ENV === 'production' ? false : true,
      convertStyles: true
    },
    ssh: {
      enabled: false,
      host: '0.0.0.0',
      port: 50501,
      title: `Node Monkey on ${os.hostname()}`,
      prompt: `[Node Monkey] {@username}@${os.hostname()}:`
    },

    // Needed for storing things like user files and SSH host keys
    dataDir: null
  }, opts)

  this.msgBuffer = []
  this.BUNYAN_STREAM = bunyanStream(this)

  this._setupCmdMan()
  this._setupUserManager()
  this._setupServer()
  this._createLocal()
  this._createRemote()
  this._setupSSH()
}

_.assign(NodeMonkey.prototype, {
  _getServerProtocol(server) {
    if (server._events && server._events.tlsClientError) {
      return 'https'
    }
    return 'http'
  },

  _setupUserManager() {
    let dataDir = this.options.dataDir
    let userMan = this.userManager = new UserManager({
      userFile: dataDir ? `${dataDir}/users.json` : undefined,
      silent: this.options.server.silent
    })

    this.cmdMan.addCmd('adduser', (opts, term, done) => {
      let args = opts.args,
          username = args._[0]

      if (!username) {
        term.error(`You must specify a username`)
        return done()
      }

      term.prompt('Password: ', { hideInput: true }, (error, password) => {
        term.writeLn()
        term.prompt('Again: ', { hideInput: true }, (error, passwordAgain) => {
          term.writeLn()
          if (password === passwordAgain) {
            userMan.createUser(username, password)
              .then(() => term.write(`Created user '${username}'`))
              .catch(term.error)
              .then(done)
          } else {
            term.error('Passwords do not match')
            done()
          }
        })
      })
    })

    this.cmdMan.addCmd('deluser', (opts, term, done) => {
      let args = opts.args,
          username = args._[0]

      if (!username) {
        term.error(`You must specify a username`)
        return done()
      }

      userMan.deleteUser(username)
        .then(() => term.write(`Deleted user '${username}'`))
        .catch(term.error)
        .then(done)
    })

    this.cmdMan.addCmd('passwd', (opts, term, done) => {
      let args = opts.args,
          user = opts.username

      term.prompt('Current password: ', { hideInput: true }, (error, curpwd) => {
        term.writeLn()
        userMan.verifyUser(user, curpwd).then(matches => {
          if (matches) {
            term.prompt('Password: ', { hideInput: true }, (error, password) => {
              term.writeLn()
              term.prompt('Again: ', { hideInput: true }, (error, passwordAgain) => {
                term.writeLn()
                if (password === passwordAgain) {
                  userMan.setPassword(user, password)
                    .then(() => term.write(`Updated password for ${user}`))
                    .catch(term.error)
                    .then(done)
                } else {
                  term.error('Passwords do not match')
                  done()
                }
              })
            })
          } else {
            term.error('Incorrect password')
            done()
          }
        })
      })
    })
  },

  _setupCmdMan() {
    let cmdMan = this.cmdMan = new CmdMan({
      write: (val, opts) => {
        console.log(val)
      },
      writeLn: (val, opts) => {
        console.log(val)
      },
      error: (val, opts) => {
        console.error(val)
      },
      prompt: (promptTxt, opts, cb) => {
        if (typeof opts === 'function') {
          cb = opts
          opts = undefined
        }
        opts || (opts = {})

        console.warn('Prompt not implemented')
      }
    })

    this.addCmd = cmdMan.addCmd.bind(cmdMan)
    this.runCmd = cmdMan.runCmd.bind(cmdMan)
  },

  _displayServerWelcome() {
    if (!this.options.server.silent) {
      let server = this.options.server.server
      if (server.listening) {
        let proto = this._getServerProtocol(server)
        let { address, port } = server.address()
        console.log(`Node Monkey listening at ${proto}://${address}:${port}`)
      } else {
        server.on('listening', this._displayServerWelcome.bind(this))
      }
    }
  },

  _setupServer() {
    let options = this.options,
        server = options.server.server

    if (!server) {
      let serverApp = setupServer({
        name: 'Node Monkey'
      })
      server = this.options.server.server = serverApp.server

      let { host, port } = options.server
      serverApp.listen(port, host)
    }

    this._displayServerWelcome()
    this.serverApp = server
    this.remoteClients = setupSocket({
      server: server.server || server,
      userManager: this.userManager,
      onAuth: this._sendMessages.bind(this),
      clientSettings: options.client
    })
  },

  _setupSSH() {
    let sshOpts = this.options.ssh
    if (sshOpts.enabled) {
      let dataDir = this.options.dataDir
      if (!dataDir) {
        throw new Error(`Options 'dataDir' is required to enable SSH`)
      }

      // Get host keys
      let files = fs.readdirSync(dataDir),
          keyRe = /\.key$/,
          hostKeys = []
      for (let file of files) {
        if (keyRe.test(file)) {
          hostKeys.push(`${dataDir}/${file}`)
        }
      }

      if (!hostKeys.length) {
        console.log('No SSH host key found. Generating new host key...')
        let keys = keypair()
        fs.writeFileSync(`${dataDir}/rsa.key`, keys.private)
        fs.writeFileSync(`${dataDir}/rsa.key.pub`, keys.public)
        hostKeys = [ `${dataDir}/rsa.key` ]
      }

      this.SSHMan = new SSHMan({
        userManager: this.userManager,
        silent: this.options.server.silent,
        host: sshOpts.host,
        port: sshOpts.port,
        title: _.result(sshOpts, 'title'),
        prompt: _.result(sshOpts, 'prompt'),
        hostKeys
      })
    }
  },

  _getCallerInfo() {
    if (this.options.client.showCallerInfo) {
      var stack = (new Error()).stack.toString().split('\n'),
          caller = stack.find((el, index, arr) => {
            return index > 0 && /_sendMessage.+node-monkey/.test(arr[index - 2])
          })

      let callerMatch = caller.match(/at (.*) \((.*):(.*):(.*)\)/) || caller.match(/at ()(.*):(.*):(.*)/),
          callerInfo = {
            caller: callerMatch[1],
            file: callerMatch[2],
            line: parseInt(callerMatch[3]),
            column: parseInt(callerMatch[4])
          }

      return callerInfo
    }
  },

  _sendMessage(info) {
    this.msgBuffer.push({
      method: info.method,
      args: info.args,
      callerInfo: info.callerInfo || this._getCallerInfo()
    })
    if (this.msgBuffer.length > this.options.server.bufferSize) {
      this.msgBuffer.shift()
    }
    this._sendMessages()
  },

  _createLocal() {
    console.local = this._console = {}
    _.each(console, (fn, method) => {
      this._console[method] = fn
    })
  },

  _createRemote() {
    if (console.remote) return

    console.remote = {}
    ;[ 'log', 'info', 'warn', 'error', 'dir' ].forEach(method => {
      let self = this

      console.remote[method] = function() {
        self._sendMessage({
          method,
          args: Array.prototype.slice.call(arguments)
        })
      }
    })
  },

  _sendMessages() {
    let remoteClients = this.remoteClients
    if (_.size(remoteClients.adapter.rooms['authed'])) {
      _.each(this.msgBuffer, info => {
        remoteClients.to('authed').emit('console', info)
      })

      this.msgBuffer = []
    }
  },

  getServerPaths() {
    let basePath = path.normalize(`${__dirname}/../dist`)

    return {
      basePath,
      client: 'monkey.js',
      index: 'index.html'
    }
  },

  attachConsole(disableLocalOutput) {
    let serverOptions = this.options.server
    disableLocalOutput = disableLocalOutput || serverOptions.disableLocalOutput

    _.each(console.remote, (fn, method) => {
      console[method] = fn.bind(null, true)

      if (!disableLocalOutput) {
        console.local[method].apply(console, arguments)
      }
    })
  },

  detachConsole() {
    _.each(this._console, (fn, method) => {
      console[method] = fn
    })
  }
})


let inst
module.exports = function createInst(options) {
  if (!inst) {
    inst = new NodeMonkey(options)
  }

  return inst
}