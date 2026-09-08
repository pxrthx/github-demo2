const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function startServer(port) {
  const server = http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      let safePath = path.normalize(decodeURIComponent(parsedUrl.pathname)).replace(/^(\.\.[\/\\])+/, '');
      if (safePath === '/' || safePath === '\\' || safePath === '') {
        safePath = '/index.html';
      } else if (safePath === '/login' || safePath === '\\login') {
        safePath = '/login.html';
      }

      let filePath = path.join(__dirname, safePath);
      if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
        filePath += '.html';
      }

      if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('403 Forbidden');
        return;
      }

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
          res.end('404 Not Found');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
      });
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('500 Internal Server Error');
    }
  });

  server.listen(port, () => {
    console.log(`\x1b[32m✔ Server running at:\x1b[0m http://localhost:${port}/`);
    console.log(`Press Ctrl+C to stop.`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);
