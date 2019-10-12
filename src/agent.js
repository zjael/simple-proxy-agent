const debug = require('debug')('agent');
const url = require('url');
const HTTP = require('./http.js');
const SOCKS = require('./socks.js');

function agent(proxy, options = {}) {
  if (!proxy) throw new Error('a proxy must be specified!');
  debug('creating new ProxyAgent instance: %o', proxy);

  options = Object.assign({
    tunnel: true
  }, options)

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