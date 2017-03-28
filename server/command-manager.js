import _ from 'lodash'
import utils from './utils'
import minimist from 'minimist'

function CommandManager() {
  this.commands = {}
}

Object.assign(CommandManager.prototype, {
  addCmd(cmdName, opts, exec) {
    if (this.commands[cmdName]) {
      throw new Error(`'${cmdName}' is already registered as a command`)
    }

    if (typeof opts === 'function') {
      exec = opts
      opts = {}
    }

    this.commands[cmdName] = {
      opts,
      exec
    }
  },

  bindI(ioInterface) {
    let boundI = _.mapValues(this)
    Object.assign(boundI, _.mapValues(this.constructor.prototype, (val, key) => {
      if (val instanceof Function) {
        if (key === 'runCmd') {
          return val.bind(this, ioInterface)
        }
        return val.bind(this)
      } else {
        return val
      }
    }))

    return boundI
  },

  runCmd(io, rawCommand, asUser) {
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
          write: io.write,
          writeLn: io.writeLn,
          error: io.error,
          prompt: io.prompt
        },
        resolve
      )
    })
  }
})


export default CommandManager