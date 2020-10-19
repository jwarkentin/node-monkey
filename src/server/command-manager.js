import _ from "lodash"
import utils from "./utils"
import minimist from "minimist"

class CommandManager {
  commands = {}

  addCmd = (cmdName, opts, exec) => {
    if (this.commands[cmdName]) {
      throw new Error(`'${cmdName}' is already registered as a command`)
    }

    if (typeof opts === "function") {
      exec = opts
      opts = {}
    }

    this.commands[cmdName] = {
      opts,
      exec,
    }
  }

  runCmd = async (rawCommand, asUser, io) => {
    const parsed = utils.parseCommand(rawCommand)
    const cmdName = parsed[0]
    const cmd = this.commands[cmdName]

    if (!asUser) {
      throw new Error(`Missing user context for command '${cmdName}'`)
    }

    if (!cmd) {
      throw new Error(`Command not found: '${cmdName}'`)
    }

    const args = minimist(parsed.slice(1))
    const doneP = utils.getPromiseObj()
    const result = cmd.exec(
      {
        args,
        username: asUser,
      },
      {
        write: io.write,
        writeLn: io.writeLn,
        error: io.error,
        prompt: io.prompt,
      },
      doneP.resolve,
    )

    return result.then ? result : doneP.promise
  }
}

export default CommandManager
