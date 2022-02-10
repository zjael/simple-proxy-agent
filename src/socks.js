const url = require('url');
const tls = require('tls');
const dns = require('dns');
const net = require('net');
const { SocksClient } = require('socks');

class SOCKS {
  constructor(proxy, options) {
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
  if(!options.protocol) options = options.uri;
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
    let lookup = false;
    switch (this.proxy.protocol) {
      case 'socks4:':
      case 'socks5:':
        lookup = true;
        break;
    }

    let ip = options.hostname;
    if(lookup && !net.isIP(ip)) {
      ip = await new Promise((resolve, reject) => {
        dns.lookup(ip, (err, address) => {
          if(err) reject(err);
          resolve(address);
        });
      })
    }

    const ssl = options.protocol ? options.protocol.toLowerCase() === 'https:' : false;
    if(ssl && this.options.tunnel === true && options.port === 80) options.port = 443;

    const auth = this.proxy.auth && this.proxy.auth.split(':');
    const { socket } = await SocksClient.createConnection({
      proxy: {
        host: this.proxy.hostname || this.proxy.host,
        port: +this.proxy.port,
        type: this.proxy.type,
        ...(auth && {
          userId: auth[0],
          password: auth[1]
        })
      },
      command: 'connect',
      destination: {
        host: ip,
        port: +options.port
      },
      timeout: this.options.timeout
    })

    if(ssl && this.options.tunnel === true) {
      return tls.connect({
        socket: socket,
        host: options.hostname || options.host,
        port: +options.port,
        servername: options.servername || options.host
      });
    }

    return socket;
  } catch (err) {
    throw err;
  }
};
module.exports = SOCKS;