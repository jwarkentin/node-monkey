import _ from "lodash"
import socketio from "socket.io"
import CommandInterface from "./command-interface"

export default (options) => {
  const io = socketio()
  io.attach(options.server, {
    path: "/monkey.io",
    autoUnref: true,
  })

  const ns = io.of("/nm")
  ns.on("connection", (socket) => {
    let cmdInterface = null
    socket.emit("settings", options.clientSettings)
    socket.emit("auth")

    socket.on("auth", (creds) => {
      options.userManager
        .verifyUser(creds.username, creds.password)
        .then((result) => {
          socket.emit("authResponse", result, result ? undefined : "Incorrect password")
          if (result) {
            socket.username = creds.username
            socket.join("authed")
            if (options.onAuth) {
              options.onAuth(socket)
            }
          }
        })
        .catch((err) => {
          socket.emit("authResponse", false, err)
        })
    })

    socket.on("cmd", (cmdId, command) => {
      if (!socket.username) {
        socket.emit("cmdResponse", cmdId, `You are not authorized to run commands`)
        return
      }

      if (!cmdInterface) {
        cmdInterface = createCmdInterface(options.cmdManager, socket)
      }

      options.cmdManager
        .runCmd(command, socket.username, cmdInterface)
        .then((output) => {
          socket.emit("cmdResponse", cmdId, null, output)
        })
        .catch((err) => {
          socket.emit("cmdResponse", cmdId, (err && err.message) || err, null)
        })
    })
  })

  _.each(options.handlers, function (handler, event) {
    io.on(event, handler)
  })

  return ns
}

function createCmdInterface(cmdManager, socket) {
  let promptId = 0
  const prompts = {}

  const writeFn = (val, opts) => {
    if (!val) return

    socket.emit("console", {
      method: "log",
      args: [val],
    })
  }

  const errorFn = (val, opts) => {
    if (!val) return

    socket.emit("console", {
      method: "error",
      args: [val],
    })
  }

  const promptFn = (promptTxt, opts, cb) => {
    if (typeof opts === "function") {
      cb = opts
      opts = undefined
    }
    opts || (opts = {})

    let pid = promptId++
    socket.emit("prompt", pid, promptTxt, opts)

    prompts[pid] = cb
  }

  socket.on("promptResponse", (promptId, response) => {
    const cb = prompts[promptId]
    if (cb) {
      cb(null, response)
    }
  })

  return new CommandInterface(cmdManager, writeFn, writeFn, errorFn, promptFn)
}
