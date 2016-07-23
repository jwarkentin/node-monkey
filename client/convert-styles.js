import utils from './utils'

let styleMap = {
      // Styles
      '\u001b[24m'  : 'text-decoration: none',
      '\u001b[22m'  : 'font-weight: normal',
      '\u001b[1m'   : 'font-weight: bold',
      '\u001b[3m'   : 'font-style: italic',
      '\u001b[4m'   : 'text-decoration: underline',
      '\u001b[23m'  : 'font-style: normal',

      // Colors
      '\u001b[39m'  : 'color: ',
      '\u001b[37m'  : 'color: white',
      '\u001b[90m'  : 'color: grey',
      '\u001b[30m'  : 'color: black',
      '\u001b[35m'  : 'color: magenta',
      '\u001b[33m'  : 'color: yellow',
      '\u001b[31m'  : 'color: red',
      '\u001b[36m'  : 'color: cyan',
      '\u001b[34m'  : 'color: blue',
      '\u001b[32m'  : 'color: green'
    },

    // Styles for the caller data.
    traceStyle = 'color: grey; font-family: Helvetica, Arial, sans-serif',

    // RegExp pattern for styles
    stylePattern = /(\u001b\[.*?m)+/g,

    // RegExp pattern for format specifiers (like '%o', '%s')
    formatPattern = /(?:^|[^%])%(s|d|i|o|f|c)/g

function stylize(data, cdata) {
  if (!data.length) {
    data.push('')
  }

  // If `data` has multiple arguments, we are going to merge everything into
  // the first argument, so style-specifiers can be used throughout all arguments.

  let cap,
      mergeArgsStart = 1,
      formatSpecifiers = []

  // If the first argument is an object, we need to replace it with `%o`
  // (always preemptively reset the color)
  if (utils.isObject(data[0])) {
    data.splice(1, 0, data[0])
    data[0] = '%o'
  }

  // Count all format specifiers in the first argument to see from where we need to
  // start merging
  let txt = data[0]
  while (cap = formatPattern.exec(txt)) {
      if (cap[1] == 'o') {
        // Insert color resetter
        data[0] = data[0].replace(cap[0], cap[0].slice(0, cap[0].length -2) + '\u001b[39m%o')
      }
      mergeArgsStart++
  }


  // Start merging...
  if (data.length > mergeArgsStart) {
    for (let i = mergeArgsStart; i < data.length; i++) {
      let arg = data[i],
          specifier

      if (typeof arg == 'string') {
        // Since this argument is a string and may be styled as well, put it right in...
        specifier = ' ' + arg
        // ...and remove the argument...
        data.splice(i, 1)
        // ...and adapt the iterator.
        i--
      } else {
        // Otherwise use the '%o'-specifier (preemptively reset color)
        specifier = ' \u001b[39m%o'
      }

      data[0] += specifier
    }
  }

  // Now let's collect all format specifiers and their positions as well,
  // so we know where to put our style-specifiers.
  while (cap = formatPattern.exec(data[0])) {
    formatSpecifiers.push(cap)
  }

  let added = 0
  txt = data[0]

  // Let's do some styling...
  while (cap = stylePattern.exec(txt)) {
    let styles = [],
        capsplit = cap[0].split('m')

    // Get the needed styles
    for (let j = 0; j < capsplit.length; j++) {
      let s
      if (s = styleMap[capsplit[j] + 'm']) styles.push(s)
    }

    // Check if the style must be added before other specifiers
    if (styles.length) {
      let k
      for (k = 0; k < formatSpecifiers.length; k++) {
        let sp = formatSpecifiers[k]
        if (cap['index'] < sp['index']) {
          break
        }
      }

      // Add them at the right position
      let pos = k + 1 + added
      data.splice(pos, 0, styles.join(';'))
      added++

      // Replace original with `%c`-specifier
      data[0] = data[0].replace(cap[0], '%c')
    }
  }
  // ...done!

  // At last, add caller data, if present.
  if (cdata) {
    data[0] += '%c' + cdata
    data.push(traceStyle)
  }

  return data
}


export default stylize