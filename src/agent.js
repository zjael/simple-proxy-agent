const url = require('url');
const HTTP = require('./http.js');
const SOCKS = require('./socks.js');

/**
 * @typedef {Object} ProxyAgentOptions
 * @property {boolean} [tunnel=true] - If true, will tunnel all HTTPS using CONNECT method
 * @property {number} [timeout=5000] - Time in milliseconds to maximum wait for proxy connection to establish
 */

/**
 * Creates a proxy agent for HTTP/HTTPS/SOCKS proxies
 * @param {string} proxy - Proxy URL (http://, https://, socks://, socks4://, socks4a://, socks5://, socks5h://)
 * @param {ProxyAgentOptions} [options] - Optional configuration
 * @returns {import('http').Agent} Proxy agent instance
 * @throws {Error} If proxy is not specified or protocol is unsupported
 * @example
 * const ProxyAgent = require('simple-proxy-agent');
 * const agent = new ProxyAgent('http://127.0.0.1:8080');
 * @example
 * const agent = new ProxyAgent('socks5://user:pass@127.0.0.1:1080', { timeout: 10000 });
 */
function agent(proxy, options = {}) {
  if (!proxy) throw new Error('a proxy must be specified!');

  options = Object.assign(
    {
      tunnel: true,
      timeout: 5000,
    },
    options
  );

  const { protocol } = url.parse(proxy);
  switch (protocol) {
    case 'http:':
      return new HTTP(proxy, options);
    case 'https:':
      return new HTTP(proxy, options);
    case 'socks:':
    case 'socks4:':
    case 'socks4a:':
    case 'socks5:':
    case 'socks5h:':
      return new SOCKS(proxy, options);
    default:
      throw new Error('Unsupported protocol: ' + protocol);
  }
}

module.exports = agent;
