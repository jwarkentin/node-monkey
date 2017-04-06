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
      path: `${__dirname}/dist`,
      filename: `server.js`
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
      rules: [
        {
          test: /\.js$/,
          exclude: /(node-monkey\/(dist|client)|node-monkey\/.*node_modules)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                compact: true,
                cacheDirectory: true,
                presets: ['es2015', 'stage-0'],
                plugins: ['transform-runtime']
              }
            }
          ]
        }
      ]
    },

    plugins: [
      new webpack.BannerPlugin({ banner: 'module.exports = ', raw: true }),
      new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false }),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          warnings: true
        }
      })
    ],

    devtool: 'source-map'
  },
  {
    context: __dirname,
    entry: './client/app.js',

    output: {
      path: `${__dirname}/dist`,
      filename: `monkey.js`
    },

    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /(node-monkey\/(dist|server)|node-monkey\/.*node_modules)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                compact: true,
                cacheDirectory: true,
                presets: ['es2015', 'stage-0'],
                plugins: ['transform-runtime']
              }
            }
          ]
        }
      ]
    },

    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          warnings: true
        }
      })
    ],

    devtool: 'source-map'
  },
  {
    entry: `${__dirname}/client/index.html`,
    context: `${__dirname}/client`,

    output: {
      path: `${__dirname}/dist`,
      filename: 'index.html'
    },

    module: {
      loaders: [
        {
          exclude: '/.*/',
          use: [
            {
              loader: 'ignore-loader'
            }
          ]
        }
      ]
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
