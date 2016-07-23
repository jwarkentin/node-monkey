import commonUtils from '../lib/common-utils'

export default Object.assign({
  parseCommand(str) {
    const reg = /"(.*?)"|'(.*?)'|`(.*?)`|([^\s"]+)/gi
    let arr = [],
        match

    do {
      match = reg.exec(str)
      if (match !== null) {
        arr.push(match[1] || match[2] || match[3] || match[4])
      }
    } while (match !== null)

    return arr
  }
}, commonUtils)