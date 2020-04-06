module.exports = (api) => {
  const target = api.caller((caller) => caller && caller.target)
  const presets = [
    [
      "@babel/preset-env",
      {
        [target === "node" ? "target" : undefined]: target,
        useBuiltIns: target === "web" && "entry",
      },
    ],
  ]
  const plugins = ["source-map-support", "@babel/proposal-class-properties"]
  api.cache(true)

  return {
    presets,
    plugins,
  }
}
