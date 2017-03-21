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
    if (initialized) {
      monkey.connect()
      return
    }
    initialized = true

    return new Promise((resolve, reject) => {
      utils
        .addHeadScript(`${utils.getClientHost()}/socket.io/socket.io.js`)
        .addEventListener('load', () => {
          initClient().then(client => {
            let authAttempts = 0,
                creds = null,
                stylize = convertStyles,
                settings = {
                  convertStyles: true
                }

            monkey.client = client
            monkey.connect = client.connect.bind(client)
            monkey.disconnect = () => {
              authAttempts = 0
              creds = null
              client.disconnect.call(client)
            }

            let doAuth = () => {
              if (authAttempts > 2) {
                monkey.disconnect()
                return
              }

              let username, password
              if (!creds) {
                username = prompt('Node Monkey username')
                password = prompt('Node Monkey password')
                creds = { username, password }
              }

              ++authAttempts
              client.emit('auth', creds)
            }

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

            client.on('settings', data => {
              Object.assign(settings, data)

              if (!settings.convertStyles) {
                stylize = function(args, trace) {
                  return args.concat([ trace ])
                }
              }
            })

            client.on('auth', doAuth)

            client.on('authResponse', (result, err) => {
              if (!result) {
                creds = null
                console.warn('Auth failed:', err)
                doAuth()
              }
            })

            client.on('console', data => {
              data = cycle.retrocycle(data)

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

            client.on('prompt', (promptId, promptTxt, opts) => {
              opts || (opts = {})

              client.emit('promptResponse', promptId, prompt(promptTxt))
            })

            resolve()
          }).catch(reject)
        })
    })
  },

  cmd(command, noOutput) {
    if (!monkey.client) {
      console.error(`Must be connected to a server to execute a command`)
      return
    }

    let p = new Promise((resolve, reject) => {
      let cmdId = monkey.cmdId++
      monkey.client.emit('cmd', cmdId, command)
      monkey.runningCmd[cmdId] = { resolve, reject }
    })

    if (!noOutput) {
      p.then(output => output !== null && console.log(output)).catch(error => error !== null && console.error(error))
    }

    return p
  }
}

function initClient() {
  return new Promise((resolve, reject) => {
    let client = io(`${location.origin}/nm`)

    client.on('connect', function() {
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

    resolve(client)
  })
}
