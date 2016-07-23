module.exports = {
  isObject(value) {
    let type = typeof value
    return !!value && (type == 'object' || type == 'function')
  },

  invert(obj) {
    let inverted = {}
    for (let k in obj) {
      if (obj.hasOwnProperty(k)) {
        inverted[obj[k]] = k
      }
    }

    return inverted
  }
}