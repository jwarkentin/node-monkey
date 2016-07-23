let fs = require('fs'),
    webpack = require('webpack'),
    nodeExternals = require('webpack-node-externals'),
    CopyProcessPlugin = require('./copy-process-webpack-plugin'),
    initConfig = require('./init-config'),
    config = initConfig({
      configDir: `${__dirname}/config`
    })


module.exports = [
  {
    context: __dirname,
    entry: './server/app.js',
    target: 'node',
    externals: [ nodeExternals() ],

    output: {
      filename: `server.js`,
      path: __dirname + '/dist',
    },

    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false
    },

    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules|dist|client)/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            presets: ['es2015', 'stage-0'],
            plugins: ['transform-runtime']
          }
        }
      ]
    },

    plugins: [
      new webpack.BannerPlugin('module.exports = ', { raw: true }),
      new webpack.BannerPlugin('require("source-map-support").install();', { raw: true, entryOnly: false }),
      new webpack.optimize.UglifyJsPlugin()
    ],

    devtool: 'source-map'
  },
  {
    context: __dirname,
    entry: './client/app.js',

    output: {
      filename: `monkey.js`,
      path: __dirname + '/dist',
    },

    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|dist|server)/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            presets: ['es2015', 'stage-0'],
            plugins: ['transform-runtime']
          }
        }
      ]
    },

    plugins: [
      new webpack.optimize.UglifyJsPlugin()
    ],

    devtool: 'source-map'
  },
  {
    context: __dirname + '/client',

    output: {
      filename: 'index.html',
      path: __dirname + '/dist',
    },

    plugins: [
      new CopyProcessPlugin([
        {
          from: 'index.html',
          process: fileData => {
            return fileData
            // return fileData.replace(/client\.js/, `client${NODE_ENV == 'dev' ? '.dev' : ''}.js`)
          }
        }
      ])
    ]
  }
]