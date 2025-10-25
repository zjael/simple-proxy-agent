#!/usr/bin/env node

/**
 * Simple mock HTTP proxy server for testing
 * This creates a basic HTTP proxy that can be used to test simple-proxy-agent
 *
 * Usage: node examples/mock-proxy-server.js [port]
 * Default port: 8888
 */

const http = require('http');
const net = require('net');
const url = require('url');

const PORT = process.argv[2] || 8888;

// Handle HTTP requests (non-CONNECT)
const server = http.createServer((req, res) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);

  const options = {
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(req.url, options, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    console.error(`[ERROR] ${err.message}`);
    res.writeHead(500);
    res.end('Proxy error: ' + err.message);
  });

  req.pipe(proxyReq);
});

// Handle HTTPS CONNECT requests
server.on('connect', (req, clientSocket, head) => {
  console.log(`[CONNECT] ${req.url}`);

  const { hostname, port } = url.parse(`http://${req.url}`);

  const serverSocket = net.connect(port || 443, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', err => {
    console.error(`[ERROR] ${err.message}`);
    clientSocket.end();
  });

  clientSocket.on('error', err => {
    console.error(`[ERROR] ${err.message}`);
    serverSocket.end();
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n✓ Mock HTTP proxy server running on http://127.0.0.1:${PORT}`);
  console.log('\nTest with:');
  console.log(`  node examples/simple-test.js http://127.0.0.1:${PORT}`);
  console.log(`  node examples/integration-test.js http://127.0.0.1:${PORT}\n`);
  console.log('Press Ctrl+C to stop\n');
});

process.on('SIGINT', () => {
  console.log('\n\nShutting down proxy server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
