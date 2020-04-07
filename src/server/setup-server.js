import restify from "restify"
import corsMiddleware from "restify-cors-middleware"

export default (options) => {
  const server = restify.createServer()
  const cors = corsMiddleware({
    origins: [/https?:\/\/.+/],
    allowHeaders: [],
    exposeHeaders: [],
    credentials: true,
  })

  server.pre(restify.pre.userAgentConnection())
  server.pre(cors.preflight)
  server.use(restify.plugins.gzipResponse())
  server.use(cors.actual)

  server.get(
    "*",
    restify.plugins.serveStatic({
      directory: __dirname,
      default: "index.html",
    }),
  )

  return server
}
