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
    },
    nameFromLevel = utils.invert(levelFromName)

export default inst => {
  return {
    write: function(rec) {
      // TODO: Look for the first call that didn't originate in bunyan.js
      rec = JSON.parse(rec)
      let src = rec.src
      inst._sendMessage({
        method: nameFromLevel[rec.level] || 'info',
        args: [ rec.msg, rec ],
        callerInfo: src && {
          caller: src.func || 'anonymous',
          file: src.file,
          line: src.line,
          column: 0
        }
      })
    }
  }
}