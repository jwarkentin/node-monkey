import webpack from "webpack"
import nodeExternals from "webpack-node-externals"
import HtmlWebpackPlugin from "html-webpack-plugin"
import TerserPlugin from "terser-webpack-plugin"

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

    optimization: {
      minimize: true,
      nodeEnv: false,
      minimizer: [new TerserPlugin()],
    },

    target: "node",
    externals: [nodeExternals()],
    node: {
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

    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
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
        scriptLoading: "blocking",
        template: `${__dirname}/src/client/index.html`,
      }),
    ],

    devtool: "source-map",
  },
]
