const url = require('url');
const tls = require('tls');
const dns = require('dns');
const net = require('net');
const { SocksClient } = require('socks');

/**
 * SOCKS Proxy Agent
 * Handles connections through SOCKS4, SOCKS4a, SOCKS5, and SOCKS5h proxies
 */
class SOCKS {
  /**
   * @param {string} proxy - Proxy URL
   * @param {import('./agent').ProxyAgentOptions} options - Agent options
   */
  constructor(proxy, options) {
    this.proxy = proxy;
    this.options = options;
    this.init();
  }

  /**
   * Initializes the SOCKS proxy configuration
   * @private
   */
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

/**
 * Adds a request to the agent
 * @param {import('http').ClientRequest} req - The HTTP request
 * @param {Object} options - Request options
 */
SOCKS.prototype.addRequest = function (req, options) {
  if (!options.protocol) options = options.uri;
  req.shouldKeepAlive = false;

  this.createConnection(options)
    .then(socket => {
      req.onSocket(socket);
    })
    .catch(err => {
      req.emit('error', err);
    });
};

/**
 * Creates a connection through the SOCKS proxy
 * @param {Object} options - Connection options
 * @returns {Promise<import('net').Socket>} Promise that resolves to a socket
 * @private
 */
SOCKS.prototype.createConnection = async function (options) {
  // SOCKS4 and SOCKS5 use client-side DNS resolution
  // SOCKS4a and SOCKS5h use remote DNS resolution (hostname resolved by proxy)
  let lookup = false;
  if (this.proxy.protocol === 'socks4:' || this.proxy.protocol === 'socks5:') {
    lookup = true;
  }

  let ip = options.hostname;
  if (lookup && !net.isIP(ip)) {
    ip = await new Promise((resolve, reject) => {
      dns.lookup(ip, (err, address) => {
        if (err) reject(err);
        resolve(address);
      });
    });
  }

  const ssl = options.protocol ? options.protocol.toLowerCase() === 'https:' : false;
  if (ssl && this.options.tunnel === true && options.port === 80) options.port = 443;

  const auth = this.proxy.auth && this.proxy.auth.split(':');
  const { socket } = await SocksClient.createConnection({
    proxy: {
      host: this.proxy.hostname || this.proxy.host,
      port: +this.proxy.port,
      type: this.proxy.type,
      ...(auth && {
        userId: auth[0],
        password: auth[1],
      }),
    },
    command: 'connect',
    destination: {
      host: ip,
      port: +options.port,
    },
    timeout: this.options.timeout,
  });

  if (ssl && this.options.tunnel === true) {
    return tls.connect({
      socket: socket,
      host: options.hostname || options.host,
      port: +options.port,
      servername: options.servername || options.hostname || options.host,
    });
  }

  return socket;
};
module.exports = SOCKS;
