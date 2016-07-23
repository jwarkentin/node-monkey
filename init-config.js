let _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    nconf = require('nconf')

nconf.require = function require(options) {
  let missing = []
  for (let i = 0; i < options.length; ++i) {
    if (!nconf.get(options[i])) {
      missing.push(options[i])
    }
  }

  if (missing.length) {
    console.error(`Missing required option${(missing.length > 1 ? 's' : '')} '${missing.join("', '")}'`)
    process.exit(1)
  }
}


module.exports = options => {
  nconf.argv().env();
  options = _.defaultsDeep(options, {
    configFile: nconf.get('config'),
    configDir: path.dirname(require.main.filename) + '/config',
    defaults: null
  })

  let NODE_ENV = process.env.NODE_ENV || 'dev',
      configFile = options.configFile || options.configDir && NODE_ENV ? (`${options.configDir}/${NODE_ENV}.json`) : null

  if (configFile) {
    try {
      fs.accessSync(configFile)
    } catch(err) {
      console.error(`Could not access config file '${configFile}'\n`, err);
      process.exit(1)
    }

    nconf.file({
      file: configFile,
      dir: configFile[0] === '/' ? null : process.cwd()
    });
  }

  if (options.defaults) {
    nconf.defaults(options.defaults)
  }

  return nconf
}