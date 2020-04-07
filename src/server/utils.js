import commonUtils from "../lib/common-utils"
import sourceMapSupport from "source-map-support"

export default Object.assign(
  {
    parseCommand(str) {
      const reg = /"(.*?)"|'(.*?)'|`(.*?)`|([^\s"]+)/gi
      const arr = []
      let match

      do {
        match = reg.exec(str)
        if (match !== null) {
          arr.push(match[1] || match[2] || match[3] || match[4])
        }
      } while (match !== null)

      return arr
    },

    getStack() {
      let prep = Error.prepareStackTrace
      let limit = Error.stackTraceLimit
      Error.prepareStackTrace = (error, trace) => trace.map(sourceMapSupport.wrapCallSite)
      Error.stackTraceLimit = 30

      let stack = new Error().stack
      Error.prepareStackTrace = prep
      Error.stackTraceLimit = limit

      return stack.slice(1)
    },

    getPromiseObj() {
      const pobj = {}
      pobj.promise = new Promise((resolve, reject) => {
        Object.assign(pobj, {
          resolve,
          reject,
        })
      })
      return pobj
    },
  },
  commonUtils,
)
