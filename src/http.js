const http = require('http');
const url = require('url');
const tls = require('tls');
const net = require('net');
const { EventEmitter } = require('events');

class HTTP extends EventEmitter {
  constructor(proxy, options) {
    super();
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
  const absolute = url.format({
    protocol: options.protocol || 'http:',
    hostname: options.hostname || options.host,
    port: options.port,
    pathname: req.path
  });
  req.path = absolute;
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
    if(!options.protocol) options = options.uri;
    const ssl = options.protocol ? options.protocol.toLowerCase() === 'https:' : false;
    if(ssl && this.options.tunnel === true) {
      // CONNECT Method
      const req = http.request({
        host: this.proxy.host,
        port: this.proxy.port,
        method: "CONNECT",
        path: options.host + ":" + options.port,
        headers: {
          host: options.host
        }
      });

      req.once("connect", (res, socket, head) => {
        const sock = tls.connect({
          socket: socket,
          host: options.host,
          port: options.port,
          servername: options.servername || options.host
        });
        resolve(sock);
      });

      req.once("error", (err) => {
        reject(err);
      });

      req.end();
    } else {
      const socket = net.connect({
        host: this.proxy.host,
        port: this.proxy.port
      });
      resolve(socket);
    }
  })
};

module.exports = HTTP;