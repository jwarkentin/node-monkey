import webpack from "webpack"
import nodeExternals from "webpack-node-externals"
import MinifyPlugin from "babel-minify-webpack-plugin"
import HtmlWebpackPlugin from "html-webpack-plugin"

export default [
  {
    entry: "./src/server/index.js",
    output: {
      path: `${__dirname}/dist`,
      filename: `server.js`,
      library: "WOSTargetingClient",
      libraryExport: "default",
      libraryTarget: "umd",
    },

    target: "node",
    externals: [nodeExternals()],

    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
      ],
    },

    plugins: [new MinifyPlugin()],

    devtool: "source-map",
  },
  {
    entry: "./src/client/index.js",

    output: {
      path: `${__dirname}/dist`,
      filename: `monkey.js`,
      library: "NodeMonkey",
      libraryExport: "default",
      libraryTarget: "umd",
    },

    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        title: "NodeMonkey Client Test",
      }),
      new MinifyPlugin(),
    ],

    devtool: "source-map",
  },
]
