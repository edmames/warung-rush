// Server statis ringan untuk melayani game/ secara lokal saat play-test.

import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const GAME_DIR = resolve(REPO_ROOT, 'game');
const PORT = Number(process.env.PORT || process.argv[2] || 4173);
const HOST = process.env.HOST || '127.0.0.1';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0] || '/';
  const relPath = urlPath === '/' ? 'index.html' : decodeURIComponent(urlPath.replace(/^\/+/, ''));
  const fullPath = resolve(GAME_DIR, relPath);

  if (fullPath !== GAME_DIR && !fullPath.startsWith(`${GAME_DIR}/`)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  try {
    const st = statSync(fullPath);
    const target = st.isDirectory() ? join(fullPath, 'index.html') : fullPath;
    const data = readFileSync(target);
    const contentType = MIME[extname(target).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Warung Rush local server -> http://${HOST}:${PORT}/`);
});
