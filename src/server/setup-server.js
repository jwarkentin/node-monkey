import { createServer, } from "http"
import { readFileSync, } from "fs"

const indexFileContent = readFileSync(`${__dirname}/index.html`)
const monkeyFileContent = readFileSync(`${__dirname}/monkey.js`)
const monkeyMapFileContent = readFileSync(`${__dirname}/monkey.js.map`)

export default (options) => {
  const server = createServer((req, res) => {
    let content = ""
    let contentType = ""
    if (!req.url || req.url === "/" || req.url === "index.html") {
      content = indexFileContent
      contentType = "text/html"
    } else if (req.url === "/monkey.js") {
      content = monkeyFileContent
      contentType = "application/javascript"
    } else if (req.url === "/monkey.js.map") {
      content = monkeyMapFileContent
      contentType = "application/json"
    }

    res.setHeader("Content-Type", contentType)
    res.writeHead(200)
    res.end(content)
  })

  return server
}
