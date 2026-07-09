import {createServer} from 'http'
import {readFile} from 'fs/promises'
import {extname, join, normalize} from 'path'

const root = process.cwd()
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'}

createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0])
  if (p === '/') p = '/index.html'
  const file = join(root, normalize(p).replace(/^(\.\.[/\\])+/, ''))
  try {
    const data = await readFile(file)
    res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream'})
    res.end(data)
  } catch {
    res.writeHead(404); res.end('Not found')
  }
}).listen(3000, () => console.log('http://localhost:3000'))
