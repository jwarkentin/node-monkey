import restify from 'restify'

export default options => {
  let server = restify.createServer()

  server.pre(restify.pre.userAgentConnection())
  server.use(restify.gzipResponse())
  server.use(restify.CORS({
    credentials: true
  }))

  server.get(/.*/, restify.serveStatic({
    directory: __dirname,
    default: 'index.html'
  }))

  return server
}