const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_PORT = 3000; // PORT = 3000
const PORT = parseInt(process.env.PORT || process.argv[2] || DEFAULT_PORT, 10);
const BASE_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function handleRequest(req, res) {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404 Not Found</h1>');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
}

function getNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

const server = http.createServer(handleRequest);

server.listen(PORT, '0.0.0.0', () => {
  const networkIps = getNetworkAddresses();
  console.log('\n======================================================');
  console.log('   Aarambhx Technology — Local & Network Web Server   ');
  console.log('======================================================');
  console.log(`  > Local:    http://localhost:${PORT}/`);
  if (networkIps.length > 0) {
    networkIps.forEach(ip => {
      console.log(`  > Network:  http://${ip}:${PORT}/`);
    });
  } else {
    console.log(`  > Network:  http://192.168.29.75:${PORT}/`);
  }

  // Also bind companion port (8080 <-> 3000) so both ports work simultaneously
  const ALT_PORT = (PORT === 3000) ? 8080 : 3000;
  const altServer = http.createServer(handleRequest);
  altServer.listen(ALT_PORT, '0.0.0.0', () => {
    console.log(`  > Local:    http://localhost:${ALT_PORT}/`);
    if (networkIps.length > 0) {
      networkIps.forEach(ip => {
        console.log(`  > Network:  http://${ip}:${ALT_PORT}/`);
      });
    }
    console.log('======================================================\n');
  }).on('error', () => {
    console.log('======================================================\n');
  });
});
