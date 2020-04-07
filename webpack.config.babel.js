import webpack from "webpack"
import nodeExternals from "webpack-node-externals"
import MinifyPlugin from "babel-minify-webpack-plugin"
import HtmlWebpackPlugin from "html-webpack-plugin"

export default [
  {
    mode: process.env.NODE_ENV || "development",
    entry: "./src/server/index.js",
    output: {
      path: `${__dirname}/dist`,
      filename: `server.js`,
      library: "NodeMonkey",
      libraryExport: "default",
      libraryTarget: "umd",
    },

    target: "node",
    externals: [nodeExternals()],
    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false,
    },

    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
      ],
    },

    plugins: [
      new webpack.BannerPlugin({
        banner: "require('source-map-support').install();",
        raw: true,
      }),
      new MinifyPlugin(),
    ],

    devtool: "source-map",
  },
  {
    mode: process.env.NODE_ENV || "development",
    entry: "./src/client/index.js",
    output: {
      path: `${__dirname}/dist`,
      filename: `monkey.js`,
      library: "NodeMonkey",
      libraryExport: "default",
      libraryTarget: "umd",
    },

    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        title: "NodeMonkey Client Test",
        inject: "head",
        template: `${__dirname}/src/client/index.html`,
      }),
      new MinifyPlugin(),
    ],

    devtool: "source-map",
  },
]
