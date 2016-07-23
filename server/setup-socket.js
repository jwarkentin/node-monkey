import _ from 'lodash'
import socketio from 'socket.io'
import CmdMan from './command-manager'

export default options => {
  let io, ns
  let userManager = options.userManager

  if (typeof options.server === 'function') {
    io = socketio(options.server)
  } else {
    io = socketio()
    io.attach(options.server)
  }

  ns = io.of('/nm')
  ns.on('connection', socket => {
    socket.emit('settings', options.clientSettings)
    socket.emit('auth')

    socket.on('auth', creds => {
      userManager.verifyUser(creds.username, creds.password).then(result => {
        socket.emit('authResponse', result, result ? undefined : 'Incorrect password')
        if (result) {
          socket.username = creds.username
          socket.join('authed')
          if (options.onAuth) {
            options.onAuth(socket)
          }
        }
      }).catch(err => {
        socket.emit('authResponse', false, err)
      })
    })

    socket.on('cmd', (cmdId, command) => {
      if (!socket.username) {
        socket.emit('cmdResponse', cmdId, `You are not authorized to run commands`)
        return
      }

      CmdMan.runCmd(command, socket.username)
        .then(output => {
          socket.emit('cmdResponse', cmdId, null, output)
        }).catch(err => {
          socket.emit('cmdResponse', cmdId, err && err.message || err, null)
        })
    })
  })

  _.each(options.handlers, function(handler, event) {
    io.on(event, handler)
  })

  return ns
}