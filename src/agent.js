const url = require('url');
const { LRUCache } = require('lru-cache');
const HTTP = require('./http.js');
const SOCKS = require('./socks.js');

/**
 * @typedef {Object} ProxyAgentOptions
 * @property {boolean} [tunnel=true] - If true, will tunnel all HTTPS using CONNECT method
 * @property {number} [timeout=5000] - Time in milliseconds to maximum wait for proxy connection to establish
 */

// LRU cache for agent instances (max 50 agents)
const agentCache = new LRUCache({ max: 50 });

/**
 * Creates a cache key from proxy URL and options
 * @param {string} proxy - Proxy URL
 * @param {ProxyAgentOptions} options - Agent options
 * @returns {string} Cache key
 * @private
 */
function getCacheKey(proxy, options) {
  return `${proxy}|${options.tunnel}|${options.timeout}`;
}

/**
 * Creates a proxy agent for HTTP/HTTPS/SOCKS proxies
 * Agent instances are cached and reused for identical configurations
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

  // Check cache for existing agent instance
  const cacheKey = getCacheKey(proxy, options);
  const cachedAgent = agentCache.get(cacheKey);
  if (cachedAgent) {
    return cachedAgent;
  }

  // Create new agent instance
  const { protocol } = url.parse(proxy);
  let newAgent;
  switch (protocol) {
    case 'http:':
      newAgent = new HTTP(proxy, options);
      break;
    case 'https:':
      newAgent = new HTTP(proxy, options);
      break;
    case 'socks:':
    case 'socks4:':
    case 'socks4a:':
    case 'socks5:':
    case 'socks5h:':
      newAgent = new SOCKS(proxy, options);
      break;
    default:
      throw new Error('Unsupported protocol: ' + protocol);
  }

  // Store in cache and return
  agentCache.set(cacheKey, newAgent);
  return newAgent;
}

module.exports = agent;
