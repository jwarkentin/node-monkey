import utils from './utils'

const BUNYAN_TRACE = 10
const BUNYAN_DEBUG = 20
const BUNYAN_INFO = 30
const BUNYAN_WARN = 40
const BUNYAN_ERROR = 50
const BUNYAN_FATAL = 60

let levelFromName = {
  'trace': BUNYAN_TRACE,
  'debug': BUNYAN_DEBUG,
  'info': BUNYAN_INFO,
  'warn': BUNYAN_WARN,
  'error': BUNYAN_ERROR,
  'fatal': BUNYAN_FATAL
}
let nameFromLevel = utils.invert(levelFromName)

export default inst => {
  return {
    write: function(rec) {
      rec = JSON.parse(rec)
      inst._sendMessage({
        method: nameFromLevel[rec.level] || 'info',
        args: [ rec.msg, rec ]
      })
    }
  }
}