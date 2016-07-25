import utils from './utils'
import minimist from 'minimist'

let commands = {}

function CommandManager(options) {
  this.commands = commands
  this.write = options.write
  this.writeLn = options.writeLn
  this.error = options.error
  this.prompt = options.prompt
}

CommandManager.addCmd = (cmdName, opts, exec) => {
  if (commands[cmdName]) {
    throw new Error(`'${cmdName}' is already registered as a command`)
  }

  if (typeof opts === 'function') {
    exec = opts
    opts = {}
  }

  commands[cmdName] = {
    opts,
    exec
  }
}

Object.assign(CommandManager.prototype, {
  addCmd: CommandManager.addCmd,

  runCmd(rawCommand, asUser) {
    return new Promise((resolve, reject) => {
      let parsed = utils.parseCommand(rawCommand),
          cmdName = parsed[0],
          cmd = this.commands[cmdName]

      if (!asUser) {
        return reject(`Missing user context for command '${cmdName}'`)
      }

      if (!cmd) {
        return reject(`Command not found: '${cmdName}'`)
      }

      let args = minimist(parsed.slice(1))
      cmd.exec({
          args,
          username: asUser
        }, {
          write: this.write,
          writeLn: this.writeLn,
          error: this.error,
          prompt: this.prompt
        },
        resolve
      )
    })
  }
})


export default CommandManager