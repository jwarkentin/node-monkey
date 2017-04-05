import os from 'os'
import fs from 'fs'
import path from 'path'
import EventEmitter from 'events'
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
import utils from './utils'

const DEFAULT_PORT = 50500
const CONSOLE = _.mapValues(console)
const ConsoleEvent = new EventEmitter()
const HANDLE_TYPES = [ 'log', 'info', 'warn', 'error', 'dir' ]

let attachedCount = 0

function NodeMonkey(opts) {
  const NODE_ENV = process.NODE_ENV
  let options = this.options = _.merge({
    server: {
      // You can provide your own server and Node Monkey will use it instead of creating its own.
      // However, this MUST be the underlying http server instance, not the express/restify/whatever app.
      server: null,

      host: '0.0.0.0',
      port: DEFAULT_PORT,
      silent: false,
      bufferSize: 50,
      attachOnStart: true,

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
      port: DEFAULT_PORT + 1,
      title: `Node Monkey on ${os.hostname()}`,
      prompt: `[Node Monkey] {@username}@${os.hostname()}:`
    },

    // Needed for storing things like user files and SSH host keys
    dataDir: null
  }, opts)

  this.msgBuffer = []
  this.BUNYAN_STREAM = bunyanStream(this)
  this._attached = false
  this._typeHandlers = {}

  this._createLocal()
  this._createRemote()
  this._setupCmdMan()
  this._setupUserManager()
  this._setupServer()
  this._setupSSH()

  if (options.server.attachOnStart) {
    this.attachConsole()
  }

  // TODO: Deprecated. Remove everything after this line by v1.0.0
  let self = this
  let warned = false
  function warnConsole() {
    if (!warned) {
      warned = true
      let warningMsg = [
        `[Deprecation Warning] Running Node Monkey with 'augmentConsole' enabled.`,
        `This is strongly discouraged and will be removed in the v1.0.0 release.`,
        `See here for more info: https://github.com/jwarkentin/node-monkey/releases/tag/v1.0.0-rc.1`
      ].join(' ')
      self.local.warn(warningMsg)
      self.remote.warn(warningMsg)
    }
  }

  // This is here because webpack renames the function and for whatever reason the stack trace doesn't show the right name,
  // even with proper source maps. This is all just temporary anyway so I'm hacking it.
  Object.defineProperty(warnConsole, 'name', { value: 'warnConsole' })

  console.local = _.mapValues(this.local, (fn, method) => {
    let localFn = function() {
      warnConsole()
      return fn.apply(console, arguments)
    }
    Object.defineProperty(localFn, 'name', { value: method })
    return localFn
  })
  console.remote = _.mapValues(this.remote, (fn, method) => {
    let remoteFn = function() {
      warnConsole()
      return fn.apply({ callerStackDistance: 2 }, arguments)
    }
    Object.defineProperty(remoteFn, 'name', { value: method })
    return remoteFn
  })
}

_.assign(NodeMonkey.prototype, {
  _getServerProtocol(server) {
    if (server._events && server._events.tlsClientError) {
      return 'https'
    }
    return 'http'
  },

  getServerPaths() {
    let basePath = path.normalize(`${__dirname}/../dist`)

    return {
      basePath,
      client: 'monkey.js',
      index: 'index.html'
    }
  },

  _displayServerWelcome() {
    if (!this.options.server.silent) {
      let server = this.options.server.server
      if (server.listening) {
        let proto = this._getServerProtocol(server)
        let { address, port } = server.address()
        this.local.log(`Node Monkey listening at ${proto}://${address}:${port}`)
      } else {
        server.on('listening', this._displayServerWelcome.bind(this))
      }
    }
  },

  _setupCmdMan() {
    this._cmdMan = new CmdMan()
    let cmdMan = this.cmdMan = this._cmdMan.bindI({
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

    this.addCmd = cmdMan.addCmd
    this.runCmd = cmdMan.runCmd
  },

  _setupUserManager() {
    let dataDir = this.options.dataDir
    let userMan = this.userManager = new UserManager({
      userFile: dataDir ? `${dataDir}/users.json` : undefined,
      silent: this.options.server.silent
    })

    this.cmdMan.addCmd('showusers', (opts, term, done) => {
      let users = userMan.getUsers().then(users => {
        term.writeLn(Object.keys(users).join('\n'))
        done()
      })
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
        monkey: this,
        cmdManager: this._cmdMan,
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

  // TODO: This whole process of trying to identify the true source of the call is so fucking messy and fragile. Need to think
  //       of a better way to identify the call source and rewrite all this shitty code handling it right now.
  _getCallerInfo(callerStackDistance) {
    if (this.options.client.showCallerInfo) {
      let stack = utils.getStack().map(frame => {
        return {
          functionName: frame.getFunctionName(),
          methodName: frame.getMethodName(),
          fileName: frame.getFileName(),
          lineNumber: frame.getLineNumber(),
          columnNumber: frame.getColumnNumber()
        }
      })

      let caller = stack.find((frame, index, stack) => {
        // We're either looking for a console method call or a bunyan log call. This logic will break down if method names change.
        let twoBack = stack[index - 2]
        let sixBack = stack[index - 4]
        if (twoBack && twoBack.functionName === 'Logger._emit' && /\/bunyan\.js$/.test(twoBack.fileName)) {
          return true
        } else if (twoBack && sixBack && twoBack.methodName === 'emit' && sixBack.methodName === '_sendMessage') {
          return true
        }
      })

      if (!caller && typeof callerStackDistance === 'number') {
        caller = stack[callerStackDistance]
      }

      if (caller) {
        return {
          caller: caller.functionName || caller.methodName,
          file: caller.fileName,
          line: caller.lineNumber,
          column: caller.columnNumber
        }
      }
    }
  },

  _sendMessage(info, callerStackDistance) {
    this.msgBuffer.push({
      method: info.method,
      args: info.args,
      callerInfo: info.callerInfo || this._getCallerInfo(callerStackDistance + 1)
    })
    if (this.msgBuffer.length > this.options.server.bufferSize) {
      this.msgBuffer.shift()
    }
    this._sendMessages()
  },

  _sendMessages() {
    let remoteClients = this.remoteClients
    if (_.size(remoteClients.adapter.rooms['authed'])) {
      _.each(this.msgBuffer, info => {
        remoteClients.to('authed').emit('console', cycle.decycle(info))
      })

      this.msgBuffer = []
    }
  },

  _createLocal() {
    // NOTE: The console functions here should not be wrapped since these values are used to restore the defaults
    //       when `detachConsole()` is called.
    this.local = CONSOLE
  },

  _createRemote() {
    let self = this
    let remote = this.remote = {}
    HANDLE_TYPES.forEach(method => {
      self.remote[method] = function() {
        self._sendMessage({
          method,
          args: Array.prototype.slice.call(arguments)
        }, this.callerStackDistance ? this.callerStackDistance + 1 : 2)
      }
      Object.defineProperty(remote[method], 'name', { value: method })
    })
  },

  attachConsole(disableLocalOutput) {
    if (this._attached) {
      return
    }

    if (!attachedCount) {
      // If this function is in the process of handling the log call we will try and prevent potential infinite recursion
      let handlersActive = 0
      HANDLE_TYPES.forEach(method => {
        console[method] = function() {
          if (handlersActive) {
            return self.local[method].apply(console, arguments)
          }

          ++handlersActive
          ConsoleEvent.emit(method, ...arguments)
          --handlersActive
        }
        Object.defineProperty(console[method], 'name', { value: method })
      })
    }

    ++attachedCount

    let self = this
    let serverOptions = this.options.server
    disableLocalOutput = disableLocalOutput !== undefined ? disableLocalOutput : serverOptions.disableLocalOutput

    _.each(this.remote, (fn, method) => {
      let handler = this._typeHandlers[method] = function() {
        fn.apply({ callerStackDistance: 5 }, arguments)

        if (!disableLocalOutput) {
          self.local[method].apply(console, arguments)
        }
      }
      Object.defineProperty(handler, 'name', { value: method })

      ConsoleEvent.on(method, handler)
    })

    this._attached = true
  },

  detachConsole() {
    Object.assign(console, this.local)
    this._attached = false
    --attachedCount

    HANDLE_TYPES.forEach(method => {
      ConsoleEvent.removeListener(method, this._typeHandlers[method])
      delete this._typeHandlers[method]
    })
  }
})


let instances = {}
let lastPort = DEFAULT_PORT - 1
module.exports = function createInst(options, name = 'default') {
  if (typeof options === 'string') {
    name = options
    options = undefined
  }

  if (!instances[name]) {
    options || (options = {})
    let port = _.get(options, 'server.port')
    if (port) {
      lastPort = +port
    } else {
      _.set(options, 'server.port', ++lastPort)
      _.set(options, 'ssh.port', ++lastPort)
    }
    instances[name] = new NodeMonkey(options)
  }

  return instances[name]
}

// Just exporting in case someone needs to wrap this or access the internals for some reason
module.exports.NodeMonkey = NodeMonkey