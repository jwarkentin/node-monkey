import fs from 'fs'
import tty from 'tty'
import pty from 'pty.js'
import ssh2 from 'ssh2'
import termkit from 'terminal-kit'
import CmdMan from './command-manager'

function SSHManager(options) {
  this.options = options = Object.assign({
    host: '127.0.0.1',
    port: 50501,
    title: 'Node Monkey',
    prompt: 'Node Monkey:',
    silent: false
  }, options)

  this.clients = {}
  this.clientId = 1

  this.server = ssh2.Server({
    hostKeys: options.hostKeys.map(file => {
      return fs.readFileSync(file)
    })
  }, this.onClient.bind(this))

  let monkey = this.options.monkey
  this.server.listen(options.port, options.host, function() {
    options.silent || monkey.local.log(`SSH listening on ${this.address().port}`)
  })
}

Object.assign(SSHManager.prototype, {
  shutdown() {
    let clients = this.clients
    for (let c of clients) {
      c.write('\nShutting down')
      c.close()
    }
  },

  onClient(client) {
    let clientId = clientId++
    this.clients[clientId] = new SSHClient({
      client,
      cmdManager: this.options.cmdManager,
      userManager: this.options.userManager,
      title: this.options.title,
      prompt: this.options.prompt,
      onClose: () => delete this.clients[clientId]
    })
  }
})


function SSHClient(options) {
  this.options = options
  this.client = options.client
  this.cmdMan = null
  this.userManager = options.userManager
  this.session = null
  this.stream = null
  this.pty = null
  this.term = null
  this.ptyInfo = null

  this.title = options.title
  this.promptTxt = `${options.prompt} `
  this.inputActive = false
  this.cmdHistory = []

  this.username = null

  this.client.on('authentication', this.onAuth.bind(this))
  this.client.on('ready', this.onReady.bind(this))
  this.client.on('end', this.onClose.bind(this))
}

Object.assign(SSHClient.prototype, {
  _initCmdMan() {
    let cmdManOpts = {
      writeLn: null,
      write: (val, opts) => {
        opts || (opts = {})
        val || (val = '')

        if (opts.bold) {
          this.term.bold(val)
        } else {
          this.term(val)
        }

        if (opts.newline) {
          this.term.nextLine()
        }
      },
      error: (val, opts) => {
        opts || (opts = {})

        // TODO: Apparently by sending this to stdout there is a timing issue and anything sent to
        //       stdout appears before this value is sent to stderr for some reason.
        // this.term.red.error(val)
        this.term.red(val)

        if (opts.newline) {
          this.term.nextLine()
        }
      },
      prompt: (promptTxt = '', opts, cb) => {
        if (typeof opts === 'function') {
          cb = opts
          opts = undefined
        }
        opts || (opts = {})

        let inputOpts = {}
        if (opts.hideInput) {
          inputOpts.echo = false
        }

        this.term(promptTxt)
        this.term.inputField(inputOpts, cb)
      }
    }
    cmdManOpts.writeLn = (val, opts) => {
      opts || (opts = {})
      opts.newline = true
      cmdManOpts.write(val, opts)
    }
    this.cmdMan = this.options.cmdManager.bindI(cmdManOpts)
  },

  write(msg, opts) {
    opts || (opts = {})
    if (this.term) {
      if (opts.style) {
        this.term[style](msg)
      } else {
        this.term(msg)
      }
    }
  },

  close() {
    if (this.stream) {
      this.stream.end()
    }
    this.onClose()
  },

  onAuth(ctx) {
    if (ctx.method == 'password') {
      this.userManager.verifyUser(ctx.username, ctx.password).then(result => {
        if (result) {
          this.username = ctx.username
          ctx.accept()
        } else {
          ctx.reject()
        }
      }).catch(err => {
        ctx.reject()
      })
    } else if (ctx.method == 'publickey') {
      ctx.reject()
    } else {
      ctx.reject()
    }
  },

  onReady() {
    this.client.on('session', (accept, reject) => {
      this.session = accept()

      this.session
        .once('pty', (accept, reject, info) => {
          this.ptyInfo = info
          accept && accept()
        })
        .on('window-change', (accept, reject, info) => {
          Object.assign(this.ptyInfo, info)
          this._resize()
          accept && accept()
        })
        .once('shell', (accept, reject) => {
          this.stream = accept()
          this._initCmdMan()
          this._initStream()
          this._initPty()
          this._initTerm()
        })
    })
  },

  onClose() {
    let onClose = this.options.onClose
    onClose && onClose()
  },

  onKey(name, matches, data) {
    if (name === 'CTRL_L') {
      this.clearScreen()
    } else if (name === 'CTRL_D') {
      let input = this.inputField.getInput()
      if (!input.length) {
        this.term.nextLine()
        setTimeout(() => {
          this.close()
        }, 0)
      }
    }
  },

  _resize() {
    let term = this.term
    if (this.term) {
      this.term.stdout.emit('resize')
    }
  },

  _initStream() {
    let stream = this.stream
    stream.name = this.title
    stream.isTTY = true
    stream.setRawMode = () => {}
    stream.on('error', error => {
      console.error('SSH stream error:', error.message)
    })
  },

  _initPty() {
    let newPty = pty.native.open(this.ptyInfo.cols, this.ptyInfo.rows)
    this.pty = {
      master_fd: newPty.master,
      slave_fd: newPty.slave,
      master: new tty.WriteStream(newPty.master),
      slave: new tty.ReadStream(newPty.slave)
    }
    this.pty.slave.getWindowSize = () => {
      return [ this.ptyInfo.cols, this.ptyInfo.rows ]
    }
    this.stream.stdin.pipe(this.pty.master)
    this.pty.master.pipe(this.stream.stdout)
  },

  _initTerm() {
    let stream = this.stream

    let term = this.term = termkit.createTerminal({
      stdin: this.pty.slave,
      stdout: this.pty.slave,
      stderr: this.pty.slave,
      generic: this.ptyInfo.term,
      appName: this.title
    })

    term.on('key', this.onKey.bind(this))
    term.windowTitle(this._interpolate(this.title))
    this.clearScreen()
  },

  _interpolate(str) {
    let varRe = /{@(.+?)}/g
    let vars = {
      username: this.username
    }

    let match
    while(match = varRe.exec(str)) {
      if (vars[match[1]]) {
        str = str.replace(match[0], vars[match[1]])
      }
    }

    return str
  },

  clearScreen() {
    this.term.clear()
    this.prompt()
  },

  prompt() {
    let term = this.term
    term.windowTitle(this._interpolate(this.title))
    term.bold(this._interpolate(this.promptTxt))

    if (!this.inputActive) {
      this.inputActive = true
      this.inputField = term.inputField({
        history: this.cmdHistory,
        autoComplete: Object.keys(this.cmdMan.commands),
        autoCompleteMenu: true
      }, (error, input) => {
        this.inputActive = false
        input[0] !== ' ' && this.cmdHistory.push(input)
        term.nextLine()

        if (input === 'exit') {
          this.close()
        } else if (input === 'clear') {
          this.clearScreen()
        } else if (input) {
          this.cmdMan.runCmd(input, this.username)
            .then(output => {
              if (typeof output !== 'string') {
                output = JSON.stringify(output, null, '  ')
              }
              this.term(output)
              this.term.nextLine()
              this.prompt()
            })
            .catch(err => {
              if (typeof err !== 'string') {
                err = err.message || JSON.stringify(err, null, '  ')
              }
              this.term.red.error(err)
              this.term.nextLine()
              this.prompt()
            })
        } else {
          this.prompt()
        }
      })
    }
  }
})


export default SSHManager