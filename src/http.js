const http = require('http');
const url = require('url');
const tls = require('tls');
const net = require('net');

class HTTP {
  constructor(proxy, options) {
    this.proxy = proxy;
    this.options = options;
    this.init();
  }

  init() {
    const proxy = url.parse(this.proxy);
    proxy.host = proxy.hostname || proxy.host;
    proxy.port = +proxy.port || (proxy.protocol.toLowerCase() === 'https:' ? 443 : 80);
    this.proxy = proxy;
  }
}

HTTP.prototype.addRequest = function(req, options) {
  if(!options.protocol) options = options.uri;
  const absolute = url.format({
    protocol: options.protocol || 'http:',
    hostname: options.hostname || options.host,
    port: options.port,
    pathname: req.path
  });
  req.path = decodeURIComponent(absolute);
  req.shouldKeepAlive = false;

  this.createConnection(options)
    .then(socket => {
      req.onSocket(socket);
    })
    .catch(err => {
      req.emit('error', err);
    })
};

HTTP.prototype.createConnection = function(options) {
  return new Promise((resolve, reject) => {
    const ssl = options.protocol ? options.protocol.toLowerCase() === 'https:' : false;
    if(ssl && this.options.tunnel === true) {
      if(options.port === 80) options.port = 443;
      // CONNECT Method
      const req = http.request({
        host: this.proxy.hostname,
        port: this.proxy.port,
        auth: this.proxy.auth,
        method: 'CONNECT',
        path: (options.hostname || options.host) + ":" + options.port,
        headers: {
          host: options.host
        },
        timeout: this.options.timeout
      });

      req.once('connect', (res, socket, head) => {
        const tunnel = tls.connect({
          socket: socket,
          host: options.hostname || options.host,
          port: +options.port,
          servername: options.servername || options.host
        });
        resolve(tunnel);
      });

      req.once('timeout', () => {
        req.abort();
        reject(new Error('HTTP CONNECT request timed out'))
      })

      req.once('error', (err) => {
        reject(err);
      });

      req.once('close', () => {
        reject(new Error('Tunnel failed. Socket closed prematurely'));
      });

      req.end();
    } else {
      const socket = net.connect({
        host: this.proxy.host,
        port: this.proxy.port,
        auth: this.proxy.auth,
      });
      resolve(socket);
    }
  })
};

module.exports = HTTP;