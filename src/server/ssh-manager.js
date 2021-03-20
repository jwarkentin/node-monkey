import fs from "fs"
import tty from "tty"
import { native as nativePty } from "node-pty"
import ssh2 from "ssh2"
import termkit from "terminal-kit"
import CommandInterface from "./command-interface"

class SSHManager {
  options = {
    host: "127.0.0.1",
    port: 50501,
    title: "Node Monkey",
    prompt: "Node Monkey:",
    silent: false,
  }
  server
  clients = new Set()

  constructor(options) {
    options = Object.assign(this.options, options)

    this.server = new ssh2.Server(
      {
        hostKeys: options.hostKeys.map((file) => {
          return fs.readFileSync(file)
        }),
      },
      this.onClient.bind(this),
    )

    const monkey = this.options.monkey
    this.server.listen(options.port, options.host, function () {
      options.silent || monkey.local.log(`SSH listening on ${this.address().port}`)
    })
  }

  shutdown() {
    const clients = this.clients
    for (const c of clients) {
      c.write("\nShutting down")
      c.close()
    }
  }

  onClient(client) {
    const { cmdManager, userManager, title, prompt } = this.options

    this.clients.add(
      new SSHClient({
        client,
        cmdManager,
        userManager,
        title,
        prompt,
        onClose: () => this.clients.delete(client),
      }),
    )
  }
}

class SSHClient {
  constructor(options) {
    this.options = options
    this.client = options.client
    this.cmdInterface = null
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

    this.client.on("authentication", this.onAuth.bind(this))
    this.client.on("ready", this.onReady.bind(this))
    this.client.on("end", this.onClose.bind(this))
  }

  _initCmdMan() {
    const writeFn = (val, opts) => {
      opts || (opts = {})
      val || (val = "")

      if (opts.bold) {
        this.term.bold(val)
      } else {
        this.term(val)
      }

      if (opts.newline) {
        this.term.nextLine()
      }
    }

    const writeLnFn = (val, opts) => {
      opts || (opts = {})
      opts.newline = true
      writeFn(val, opts)
    }

    const errorFn = (val, opts) => {
      opts || (opts = {})

      // TODO: Apparently by sending this to stdout there is a timing issue and anything sent to
      //       stdout appears before this value is sent to stderr for some reason.
      // this.term.red.error(val)
      this.term.red(val)

      if (opts.newline) {
        this.term.nextLine()
      }
    }

    const promptFn = (promptTxt = "", opts, cb) => {
      if (typeof opts === "function") {
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

    this.cmdInterface = new CommandInterface(this.options.cmdManager, writeFn, writeLnFn, errorFn, promptFn)
  }

  write(msg, { style = undefined }) {
    if (this.term) {
      if (style) {
        this.term[style](msg)
      } else {
        this.term(msg)
      }
    }
  }

  close() {
    if (this.stream) {
      this.stream.end()
    }
    this.onClose()
  }

  onAuth(ctx) {
    if (ctx.method == "password") {
      this.userManager
        .verifyUser(ctx.username, ctx.password)
        .then((result) => {
          if (result) {
            this.username = ctx.username
            ctx.accept()
          } else {
            ctx.reject()
          }
        })
        .catch((err) => {
          ctx.reject()
        })
    } else if (ctx.method == "publickey") {
      ctx.reject()
    } else {
      ctx.reject()
    }
  }

  onReady() {
    this.client.on("session", (accept, reject) => {
      this.session = accept()

      this.session
        .once("pty", (accept, reject, info) => {
          this.ptyInfo = info
          accept && accept()
        })
        .on("window-change", (accept, reject, info) => {
          Object.assign(this.ptyInfo, info)
          this._resize()
          accept && accept()
        })
        .once("shell", (accept, reject) => {
          this.stream = accept()
          this._initCmdMan()
          this._initStream()
          this._initPty()
          this._initTerm()
        })
    })
  }

  onClose() {
    let onClose = this.options.onClose
    onClose && onClose()
  }

  onKey(name, matches, data) {
    if (name === "CTRL_L") {
      this.clearScreen()
    } else if (name === "CTRL_C") {
      this.inputActive = false
      this.inputField.abort()
      this.term("\n^^C\n")
      this.prompt()
    } else if (name === "CTRL_D") {
      let input = this.inputField.getInput()
      if (!input.length) {
        this.term.nextLine()
        setTimeout(() => {
          this.close()
        }, 0)
      }
    }
  }

  _resize({ term } = this) {
    if (term) {
      term.stdout.emit("resize")
    }
  }

  _initStream() {
    const stream = this.stream
    stream.name = this.title
    stream.isTTY = true
    stream.setRawMode = () => {}
    stream.on("error", (error) => {
      console.error("SSH stream error:", error.message)
    })
  }

  _initPty() {
    const newPty = nativePty.open(this.ptyInfo.cols, this.ptyInfo.rows)
    this.pty = {
      master_fd: newPty.master,
      slave_fd: newPty.slave,
      master: new tty.WriteStream(newPty.master),
      slave: new tty.ReadStream(newPty.slave),
    }

    Object.defineProperty(this.pty.slave, "columns", {
      enumerable: true,
      get: () => this.ptyInfo.cols,
    })
    Object.defineProperty(this.pty.slave, "rows", {
      enumerable: true,
      get: () => this.ptyInfo.rows,
    })

    this.stream.stdin.pipe(this.pty.master)
    this.pty.master.pipe(this.stream.stdout)
  }

  _initTerm() {
    const term = (this.term = termkit.createTerminal({
      stdin: this.pty.slave,
      stdout: this.pty.slave,
      stderr: this.pty.slave,
      generic: this.ptyInfo.term,
      appName: this.title,
      isSSH: true,
      isTTY: true,
    }))

    term.on("key", this.onKey.bind(this))
    term.windowTitle(this._interpolate(this.title))
    this.clearScreen()
  }

  _interpolate(str) {
    let varRe = /{@(.+?)}/g
    let vars = {
      username: this.username,
    }

    let match
    while ((match = varRe.exec(str))) {
      if (vars[match[1]]) {
        str = str.replace(match[0], vars[match[1]])
      }
    }

    return str
  }

  clearScreen() {
    this.term.clear()
    this.prompt()
  }

  prompt() {
    const { term } = this
    term.windowTitle(this._interpolate(this.title))
    term.bold(this._interpolate(this.promptTxt))

    if (!this.inputActive) {
      this.inputActive = true
      this.inputField = term.inputField(
        {
          history: this.cmdHistory,
          autoComplete: Object.keys(this.options.cmdManager.commands),
          autoCompleteHint: true,
          autoCompleteMenu: true,
        },
        (error, input) => {
          this.inputActive = false
          term.nextLine()

          if (error) {
            return term.error(error.message || error)
          }

          if (!input) {
            return this.prompt()
          }
          input[0] !== " " && this.cmdHistory.push(input)

          if (input === "exit") {
            // This is delayed briefly so the newline can be echoed to the client, creating cleaner output when exiting
            setTimeout(this.close.bind(this))
          } else if (input === "clear") {
            this.clearScreen()
          } else if (input) {
            this.options.cmdManager
              .runCmd(input, this.username, this.cmdInterface)
              .then((output) => {
                if (typeof output !== "string") {
                  output = JSON.stringify(output, null, "  ")
                }
                this.term(output)
                this.term.nextLine()
                this.prompt()
              })
              .catch((err) => {
                if (typeof err !== "string") {
                  err = err.message || JSON.stringify(err, null, "  ")
                }
                this.term.red.error(err)
                this.term.nextLine()
                this.prompt()
              })
          } else {
            this.prompt()
          }
        },
      )
    }
  }
}

export default SSHManager
