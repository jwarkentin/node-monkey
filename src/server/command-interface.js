class CommandInterface {
  commandManager = null

  write = (val, opts) => {
    console.log(val)
  }

  writeLn = (val, opts) => {
    console.log(val)
  }

  error = (val, opts) => {
    console.error(val)
  }

  prompt = (promptTxt, opts, cb) => {
    if (typeof opts === "function") {
      cb = opts
      opts = undefined
    }
    opts || (opts = {})

    console.warn("Prompt not implemented")
  }

  constructor(commandManager, writeFn, writeLnFn, errorFn, promptFn) {
    this.commandManager = commandManager
    this.write = writeFn
    this.writeLn = writeLnFn
    this.error = errorFn
    this.prompt = promptFn
  }
}

export default CommandInterface
