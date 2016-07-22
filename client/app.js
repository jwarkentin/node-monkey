import utils from './utils'
import cycle from '../lib/cycle'
import convertStyles from './convert-styles'

let initialized = false
let monkey = window.monkey = {
  cmdId: 0,
  runningCmd: {},
  connect: null,
  disconnect: null,

  init() {
    if (initialized) return
    initialized = true

    return new Promise((resolve, reject) => {
      utils
        .addHeadScript(`${utils.getClientHost()}/socket.io/socket.io.js`)
        .addEventListener('load', () => {
          initClient().then(client => {
            monkey.client = client
            monkey.connect = client.connect.bind(client)
            monkey.disconnect = client.disconnect.bind(client)

            client.on('cmdResponse', (cmdId, error, output) => {
              if (monkey.runningCmd[cmdId]) {
                let { resolve, reject } = monkey.runningCmd[cmdId]
                delete monkey.runningCmd[cmdId]

                if (error) {
                  reject(error)
                } else {
                  resolve(output)
                }
              }
            })

            resolve()
          }).catch(reject)
        })
    })
  },

  cmd(command, noOutput) {
    let p = new Promise((resolve, reject) => {
      let cmdId = monkey.cmdId++
      monkey.client.emit('cmd', cmdId, command)
      monkey.runningCmd[cmdId] = { resolve, reject }
    })

    if (!noOutput) {
      p.then(output => console.log(output)).catch(error => console.error(error))
    }

    return p
  }
}

function initClient() {
  return new Promise((resolve, reject) => {
    let client = io(`${location.origin}/nm`),
        authAttempts = 0,
        stylize = convertStyles,
        settings = {
          convertStyles: true
        }

    client.on('connect', function() {
      resolve(client)
    })

    client.on('error', err => {
      console.error(err)
    })

    client.on('connect_error', err => {
      console.error(err)
    })

    client.on('reconnect_error', err => {
      console.error(err)
    })

    client.on('connect_timeout', () => {
      console.error(new Error('Socket.IO connection timed out'))
    })

    client.on('settings', data => {
      Object.assign(settings, data)

      if (!settings.convertStyles) {
        stylize = function(args, trace) {
          return args.concat([ trace ])
        }
      }
    })

    client.on('auth', () => {
      if (authAttempts > 2) {
        client.disconnect()
        return
      }

      // WARNING: DEBUG
      // client.emit('auth', { username: 'guest', password: 'guest' })
      // return
      // END WARNING: DEBUG

      let username = prompt('Node Monkey username'),
          password = prompt('Node Monkey password')

      ++authAttempts
      client.emit('auth', { username, password })
    })

    client.on('console', data => {
      let trace, cdata = data.callerInfo
      if (cdata) {
        trace = ' -- Called from ' + cdata.file + ':' + cdata.line + ':' + cdata.column + (cdata.caller ? '(function ' + cdata.caller + ')' : '')
      }
      if (data.method === 'dir') {
        console.dir(data.args[0])
        if (trace) {
          console.log.apply(console, stylize(['^^^'], trace))
        }
      } else {
        console[data.method].apply(console, stylize(data.args, trace))
      }
    })
  })
}