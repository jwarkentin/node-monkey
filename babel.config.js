module.exports = (api) => {
  const webpackTarget = api.caller((caller) => caller && caller.target)
  const targets = webpackTarget === "node" ? { node: true, esmodules: true } : "defaults"

  const presets = [
    [
      "@babel/preset-env",
      {
        targets,
        // useBuiltIns: webpackTarget === "web" && "entry",
      },
    ],
  ]
  const plugins = ["@babel/plugin-transform-runtime", "@babel/proposal-class-properties"]
  api.cache(true)

  return {
    presets,
    plugins,
  }
}
