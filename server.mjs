import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
await import('./build.mjs');
const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
http.createServer(async (req,res) => {
  try {
    const route = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = path.resolve(root, '.'+(route==='/'?'/index.html':route));
    if (!file.startsWith(root+path.sep)) {res.writeHead(403); return res.end('Forbidden');}
    const body = await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(body);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
