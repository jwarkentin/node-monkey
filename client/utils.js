import commonUtils from '../lib/common-utils'

export default Object.assign({
  getClientHost() {
    let scripts = document.getElementsByTagName('script'),
        scriptRe = /\/monkey\.js/,
        script = null

    // Loop in reverse since the correct script will be the last one except when the `async` attribute is set on the script
    for (let i = scripts.length - 1; i >= 0; --i) {
      if (scriptRe.test(scripts[i].src)) {
        script = scripts[i]
        break
      }
    }

    if (script) {
      let parser = document.createElement('a')
      parser.href = script.src

      return `${parser.protocol}//${parser.host}`
    }

    return `${location.protocol}//${location.host}`
  },

  addHeadScript(src) {
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = src
    document.getElementsByTagName('head')[0].appendChild(script)

    return script
  }
}, commonUtils)