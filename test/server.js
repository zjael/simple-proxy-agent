const http = require('http');
const https = require('https');

const servers = [];

function createHTTP() {
  return new Promise(resolve => {
    const server = http.createServer();
    server.on('request', (req, res) => {
      res.end(JSON.stringify(req.headers));
    });
    servers.push(server);
    server.listen(() => {
      resolve(server.address().port);
    })
  })
}

function createHTTPS(options) {
  return new Promise(resolve => {
    const server = https.createServer(options);
    server.on('request', (req, res) => {
      res.end(JSON.stringify(req.headers));
    });
    servers.push(server);
    server.listen(() => {
      resolve(server.address().port);
    })
  })
}

function closeAll() {
  for(const server of servers) {
    server.close();
  }
}

module.exports = {
  createHTTP,
  createHTTPS,
  closeAll
}