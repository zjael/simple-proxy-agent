const http = require('http');
const url = require('url');
const tls = require('tls');
const net = require('net');

/**
 * HTTP/HTTPS Proxy Agent
 * Handles connections through HTTP and HTTPS proxies
 */
class HTTP {
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
   * Initializes the proxy configuration
   * @private
   */
  init() {
    const proxy = url.parse(this.proxy);
    proxy.host = proxy.hostname || proxy.host;
    proxy.port = +proxy.port || (proxy.protocol.toLowerCase() === 'https:' ? 443 : 80);
    this.proxy = proxy;
  }
}

/**
 * Adds a request to the agent
 * @param {import('http').ClientRequest} req - The HTTP request
 * @param {Object} options - Request options
 */
HTTP.prototype.addRequest = function (req, options) {
  if (!options.protocol) options = options.uri;
  const absolute = url.format({
    protocol: options.protocol || 'http:',
    hostname: options.hostname || options.host,
    port: options.port,
    pathname: req.path,
  });
  req.path = decodeURIComponent(absolute);
  req.shouldKeepAlive = false;

  // Add Proxy-Authorization header for authenticated proxies
  if (this.proxy.auth) {
    req.setHeader(
      'Proxy-Authorization',
      'Basic ' + Buffer.from(this.proxy.auth).toString('base64')
    );
  }

  this.createConnection(options)
    .then(socket => {
      req.onSocket(socket);
    })
    .catch(err => {
      req.emit('error', err);
    });
};

/**
 * Creates a connection through the proxy
 * @param {Object} options - Connection options
 * @returns {Promise<import('net').Socket>} Promise that resolves to a socket
 * @private
 */
HTTP.prototype.createConnection = function (options) {
  return new Promise((resolve, reject) => {
    const ssl = options.protocol ? options.protocol.toLowerCase() === 'https:' : false;
    if (ssl && this.options.tunnel === true) {
      if (options.port === 80) options.port = 443;
      // CONNECT Method
      const headers = {
        host: options.host,
      };

      // Add Proxy-Authorization header for authenticated proxies
      if (this.proxy.auth) {
        headers['Proxy-Authorization'] = 'Basic ' + Buffer.from(this.proxy.auth).toString('base64');
      }

      const req = http.request({
        host: this.proxy.hostname,
        port: this.proxy.port,
        method: 'CONNECT',
        path: (options.hostname || options.host) + ':' + options.port,
        headers: headers,
        timeout: this.options.timeout,
      });

      req.once('connect', (res, socket, _head) => {
        // Verify CONNECT request succeeded
        if (res.statusCode !== 200) {
          socket.destroy();
          reject(
            new Error(`Proxy CONNECT failed with status ${res.statusCode}: ${res.statusMessage}`)
          );
          return;
        }

        const tunnel = tls.connect({
          socket: socket,
          host: options.hostname || options.host,
          port: +options.port,
          servername: options.servername || options.hostname || options.host,
        });
        resolve(tunnel);
      });

      req.once('timeout', () => {
        req.abort();
        reject(new Error('HTTP CONNECT request timed out'));
      });

      req.once('error', err => {
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
      });
      resolve(socket);
    }
  });
};

module.exports = HTTP;
