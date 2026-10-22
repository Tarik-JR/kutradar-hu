import { createServer } from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
const root = resolve(import.meta.dirname, '..');
const contentTypes = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml' };

export function createDevServer(directory = root) {
  const publicRoot = resolve(directory);
  return createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }); res.end('Method not allowed'); return;
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); res.end('Bad request'); return; }
    if (pathname.split('/').some(part => part.startsWith('.'))) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    try {
      const target = await realpath(resolve(publicRoot, '.' + (pathname === '/' ? '/index.html' : pathname)));
      if (!target.startsWith(publicRoot + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
      const details = await stat(target);
      if (!details.isFile()) throw new Error('Not a file');
      const body = req.method === 'HEAD' ? undefined : await readFile(target);
      res.writeHead(200, { 'Content-Type': contentTypes[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(body);
    } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: {
    host: { type: 'string', default: '127.0.0.1' },
    port: { type: 'string', default: process.env.PORT || '5173' },
    strictPort: { type: 'boolean', default: false },
  } });
  const port = Number(values.port);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid port');
  const server = createDevServer();
  server.listen(port, values.host, () => console.log(`KútRadar demo: http://${values.host}:${server.address().port}`));
}
