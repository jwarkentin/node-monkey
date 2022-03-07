import { extname, } from "path"
import { createServer, } from "http"
import { readFile, } from "fs/promises"

const extMap = {
  html: "text/html",
  js: "application/javascript",
  json: "application/json",
  map: "application/json",
}

const loadedFiles = new Map()
async function loadFile(file) {
  if (!loadedFiles.has(file)) {
    loadedFiles.set(file, await readFile(file))
  }
  return loadedFiles.get(file)
}

export default (options) => {
  const filePaths = options.filePaths || {}
  const server = createServer(async (req, res) => {
    const filePath = filePaths[req.url]
    if (filePath) {
      const contentType = extMap[(extname(filePath) || "").slice(1)] || "text/plain"
      const content = await loadFile(filePath)

      res.setHeader("Content-Type", contentType)
      res.writeHead(200)
      res.end(content)
    } else {
      res.writeHead(404)
      res.end()
    }
  })

  return server
}
