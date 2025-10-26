#!/usr/bin/env node

/**
 * Feature-complete mock HTTP proxy server for testing
 * This creates an HTTP proxy that simulates real proxy server behavior
 *
 * Usage: node examples/mock-proxy-server.js [port] [username:password]
 * Examples:
 *   node examples/mock-proxy-server.js 8888
 *   node examples/mock-proxy-server.js 8888 user:pass
 *
 * Default port: 8888
 * Default auth: none (unauthenticated)
 */

const http = require('http');
const net = require('net');
const url = require('url');

const PORT = process.argv[2] || 8888;
const AUTH = process.argv[3]; // Optional: "username:password"

let requestCount = 0;

// Handle HTTP requests (non-CONNECT)
const server = http.createServer((req, res) => {
  requestCount++;
  console.log(`[${requestCount}] [HTTP] ${req.method} ${req.url}`);

  // Check authentication for HTTP requests
  if (AUTH) {
    const proxyAuth = req.headers['proxy-authorization'];
    const expectedAuth = 'Basic ' + Buffer.from(AUTH).toString('base64');

    if (!proxyAuth || proxyAuth !== expectedAuth) {
      console.log(`[${requestCount}] [AUTH] Failed - Missing or invalid credentials`);
      res.writeHead(407, {
        'Proxy-Authenticate': 'Basic realm="Proxy Authentication Required"',
        'Proxy-agent': 'simple-proxy-agent-mock',
      });
      res.end('Proxy Authentication Required');
      return;
    }
    console.log(`[${requestCount}] [AUTH] Success`);
  }

  const options = {
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(req.url, options, proxyRes => {
    console.log(`[${requestCount}] [RESPONSE] ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    console.error(`[${requestCount}] [ERROR] ${err.message}`);
    res.writeHead(502, { 'Proxy-agent': 'simple-proxy-agent-mock' });
    res.end('Bad Gateway: ' + err.message);
  });

  req.pipe(proxyReq);
});

// Handle HTTPS CONNECT requests
server.on('connect', (req, clientSocket, head) => {
  requestCount++;
  console.log(`[${requestCount}] [CONNECT] ${req.url}`);

  // Check authentication for CONNECT requests
  if (AUTH) {
    const proxyAuth = req.headers['proxy-authorization'];
    const expectedAuth = 'Basic ' + Buffer.from(AUTH).toString('base64');

    if (!proxyAuth || proxyAuth !== expectedAuth) {
      console.log(`[${requestCount}] [AUTH] Failed - Missing or invalid credentials`);
      clientSocket.write(
        'HTTP/1.1 407 Proxy Authentication Required\r\n' +
          'Proxy-Authenticate: Basic realm="Proxy Authentication Required"\r\n' +
          'Proxy-agent: simple-proxy-agent-mock\r\n' +
          '\r\n'
      );
      clientSocket.end();
      return;
    }
    console.log(`[${requestCount}] [AUTH] Success`);
  }

  const { hostname, port } = url.parse(`http://${req.url}`);

  const serverSocket = net.connect(port || 443, hostname, () => {
    console.log(`[${requestCount}] [CONNECTED] Tunnel established to ${hostname}:${port || 443}`);
    clientSocket.write(
      'HTTP/1.1 200 Connection Established\r\n' +
        'Proxy-agent: simple-proxy-agent-mock\r\n' +
        '\r\n'
    );
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', err => {
    console.error(`[${requestCount}] [ERROR] Server socket: ${err.message}`);
    clientSocket.end();
  });

  clientSocket.on('error', err => {
    console.error(`[${requestCount}] [ERROR] Client socket: ${err.message}`);
    serverSocket.end();
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n=================================================');
  console.log('✓ Mock HTTP Proxy Server Running');
  console.log('=================================================');
  console.log(`Address:        http://127.0.0.1:${PORT}`);
  console.log(`Authentication: ${AUTH ? 'Enabled (' + AUTH + ')' : 'Disabled'}`);
  console.log(`Features:       HTTP, HTTPS (CONNECT), Auth\n`);
  console.log('Test with:');
  console.log(`  node examples/simple-test.js http://127.0.0.1:${PORT}`);
  if (AUTH) {
    console.log(`  node examples/simple-test.js http://${AUTH}@127.0.0.1:${PORT}`);
  }
  console.log(`  node examples/integration-test.js http://127.0.0.1:${PORT}\n`);
  console.log('Press Ctrl+C to stop');
  console.log('=================================================\n');
});

process.on('SIGINT', () => {
  console.log('\n\n=================================================');
  console.log('Shutting down proxy server...');
  console.log(`Total requests handled: ${requestCount}`);
  console.log('=================================================\n');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
