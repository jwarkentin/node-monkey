let _ = require('lodash')
let fs = require('fs')
let path = require('path')

function CopyProcessPlugin(files, processFn) {
  this._files = files
}

CopyProcessPlugin.prototype.apply = function apply(compiler) {
  let context = compiler.options.context

  function exists(path) {
    try {
      fs.accessSync(path)
      return true
    } catch(err) {
      return false
    }
  }

  compiler.plugin('emit', (compilation, callback) => {
    _.each(this._files, file => {
      let fromPath = path.normalize(path.join(context, file.from))
      let toName = file.to || file.from

      if (exists(fromPath)) {
        let fileData = fs.readFileSync(fromPath, { encoding: 'utf8' })
        let writeData = file.process ? file.process(fileData) : fileData

        compilation.fileDependencies.push(fromPath)

        compilation.assets[toName] = {
          size: () => {
            return Buffer(writeData).length
          },
          source: () => {
            return writeData
          }
        }
      }
    })

    setTimeout(() => {
      callback()
    })
  })

  compiler.plugin('after-emit', (compilation, callback) => {
    let outputPath = compiler.options.output.path
    _.each(compilation.assets, (asset, assetPath) => {
      let toPath = path.normalize(path.join(outputPath, assetPath))

      fs.writeFileSync(toPath, asset.source())
    })

    callback()
  })
}


module.exports = CopyProcessPlugin