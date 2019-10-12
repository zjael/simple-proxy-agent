const url = require('url');
const tls = require('tls');
const dns = require('dns');
const net = require('net');
const { EventEmitter } = require('events');
const { SocksClient } = require('socks');

class SOCKS extends EventEmitter {
  constructor(proxy, options) {
    super();
    this.proxy = proxy;
    this.options = options;
    this.init();
  }

  init() {
    const proxy = url.parse(this.proxy);
    proxy.host = proxy.hostname || proxy.host;
    proxy.port = +proxy.port || 1080;

    switch (proxy.protocol) {
      case 'socks4:':
      case 'socks4a:':
        proxy.type = 4;
        break;
      case 'socks:':
      case 'socks5:':
      case 'socks5h:':
        proxy.type = 5;
        break;
    }

    this.proxy = proxy;
  }
}

SOCKS.prototype.addRequest = function(req, options) {
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

SOCKS.prototype.createConnection = async function(options) {
  try {
    let ip = options.host;
    if(!net.isIP(options.host)) {
      ip = await new Promise((resolve, reject) => {
        dns.lookup(options.host, (err, address) => {
          if(err) reject(err);
          resolve(address);
        });
      })
    }

    const ssl = options.protocol ? options.protocol.toLowerCase() === 'https:' : false;
    if(ssl && this.options.tunnel === true && options.port === 80) options.port = 443;

    const { socket } = await SocksClient.createConnection({
      proxy: this.proxy,
      command: 'connect',
      destination: {
        host: ip,
        port: options.port
      },
      timeout: 10000
    })

    if(ssl && this.options.tunnel === true) {
      return tls.connect({
        socket: socket,
        host: options.host,
        port: options.port,
        servername: options.servername || options.host,
        hostname: options.hostname,
      });
    }

    // raw net.Socket that is established to the destination host through the given proxy server
    return socket;
  } catch (err) {
    throw err;
  }
};

module.exports = SOCKS;