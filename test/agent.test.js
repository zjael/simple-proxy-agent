process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const assert = require('assert');
const ProxyAgent = require('../src/agent.js');
const fetch = require('node-fetch');
const server = require('./server.js');
const httpProxy = require('./http-proxy.js');
const socksProxy = require('./socks-proxy');
const pem = require('pem');

const ports = {};
before(async () => {
  try {
    const options = await new Promise(resolve => {
      pem.createCertificate({ days: 1, selfSigned: true }, (err, keys) => {
        if(err) throw err;
        resolve({
          key: keys.serviceKey,
          cert: keys.certificate
        });
      });
    })

    await Promise.all([
      new Promise(resolve => {
        server.createHTTP().then(port => {
          ports.httpServerPort = port;
          resolve();
        })
      }),
      new Promise(resolve => {
        server.createHTTPS(options).then(port => {
          ports.httpsServerPort = port;
          resolve();
        })
      }),
      new Promise(resolve => {
        httpProxy.create().then(port => {
          ports.httpProxyPort = port;
          ports.httpsProxyPort = port;
          resolve();
        })
      }),
      new Promise(resolve => {
        socksProxy.create().then(port => {
          ports.socksProxyPort = port;
          resolve();
        })
      })
    ])

    return;
  } catch (err) {
    throw err;
  }
});

after(done => {
  server.closeAll();
  httpProxy.close();
  socksProxy.close();
  done();
})

describe('ProxyAgent', () => {
  it('should work over an HTTP proxy to an HTTP server with auth', () => {
    const proxy = process.env.HTTP_PROXY || 'http://toto:tata@127.0.0.1:' + ports.httpProxyPort;
    const target = process.env.HTTP_TARGET_URL || 'http://127.0.0.1:' + ports.httpServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  it('should work over an HTTP proxy to an HTTP server without auth', () => {
    const proxy = process.env.HTTP_PROXY || 'http://127.0.0.1:' + ports.httpProxyPort;
    const target = process.env.HTTP_TARGET_URL || 'http://127.0.0.1:' + ports.httpServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  it('should work over an HTTP proxy to an HTTPS server with auth', () => {
    const proxy = process.env.HTTP_PROXY || 'http://toto:tata@127.0.0.1:' + ports.httpProxyPort;
    const target = process.env.HTTPS_TARGET_URL || 'https://127.0.0.1:' + ports.httpsServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  it('should work over an HTTP proxy to an HTTPS server without auth', () => {
    const proxy = process.env.HTTP_PROXY || 'http://127.0.0.1:' + ports.httpProxyPort;
    const target = process.env.HTTPS_TARGET_URL || 'https://127.0.0.1:' + ports.httpsServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  it('should work over an HTTPS proxy to an HTTP server with auth', () => {
    const proxy = process.env.HTTPS_PROXY || 'https://toto:tata@127.0.0.1:' + ports.httpsProxyPort;
    const target = process.env.HTTP_TARGET_URL || 'http://127.0.0.1:' + ports.httpServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  it('should work over an HTTPS proxy to an HTTP server without auth', () => {
    const proxy = process.env.HTTPS_PROXY || 'https://127.0.0.1:' + ports.httpsProxyPort;
    const target = process.env.HTTP_TARGET_URL || 'http://127.0.0.1:' + ports.httpServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  it('should work over an HTTPS proxy to an HTTPS server', () => {
    const proxy = process.env.HTTPS_PROXY || 'https://toto:tata@127.0.0.1:' + ports.httpsProxyPort;
    const target = process.env.HTTPS_TARGET_URL || 'https://127.0.0.1:' + ports.httpsServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  it('should work over an SOCKSv4 proxy to an HTTP server without auth', () => {
    const proxy = process.env.SOCKS4_PROXY || 'socks4://127.0.0.1:' + ports.socksProxyPort;
    const target = process.env.HTTP_TARGET_URL || 'http://127.0.0.1:' + ports.httpServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  it('should work over an SOCKSv4 proxy to an HTTP server with auth', () => {
    const proxy = process.env.SOCKS4_PROXY || 'socks4://toto:tata@127.0.0.1:' + ports.socksProxyPort;
    const target = process.env.HTTP_TARGET_URL || 'http://127.0.0.1:' + ports.httpServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  xit('should work over an SOCKSv4 proxy to an HTTPS server without auth', () => {
    const proxy = process.env.SOCKS4_PROXY || 'socks4://127.0.0.1:' + ports.socksProxyPort;
    const target = process.env.HTTPS_TARGET_URL || 'https://127.0.0.1:' + ports.httpsServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  xit('should work over an SOCKSv4 proxy to an HTTPS server with auth', () => {
    const proxy = process.env.SOCKS4_PROXY || 'socks4://toto:tata@127.0.0.1:' + ports.socksProxyPort;
    const target = process.env.HTTPS_TARGET_URL || 'https://127.0.0.1:' + ports.httpsServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  it('should work over an SOCKSv5 proxy to an HTTP server without auth', () => {
    const proxy = process.env.SOCKS5_PROXY || 'socks5://127.0.0.1:' + ports.socksProxyPort;
    const target = process.env.HTTP_TARGET_URL || 'http://127.0.0.1:' + ports.httpServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  it('should work over an SOCKSv5 proxy to an HTTP server with auth', () => {
    const proxy = process.env.SOCKS5_PROXY || 'socks5://toto:tata@127.0.0.1:' + ports.socksProxyPort;
    const target = process.env.HTTP_TARGET_URL || 'http://127.0.0.1:' + ports.httpServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  xit('should work over an SOCKSv5 proxy to an HTTPS server without auth', () => {
    const proxy = process.env.SOCKS5_PROXY || 'socks5://127.0.0.1:' + ports.socksProxyPort;
    const target = process.env.HTTPS_TARGET_URL || 'https://127.0.0.1:' + ports.httpsServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });

  xit('should work over an SOCKSv5 proxy to an HTTPS server with auth', () => {
    const proxy = process.env.SOCKS5_PROXY || 'socks5://toto:tata@127.0.0.1:' + ports.socksProxyPort;
    const target = process.env.HTTPS_TARGET_URL || 'https://127.0.0.1:' + ports.httpsServerPort;
    const match = target.match(/:\/\/(.*)/)[1];
    return fetch(target, { agent: new ProxyAgent(proxy) })
      .then(res => res.json())
      .then(json => {
        assert.equal(match, json.host);
      })
      .catch(err => {
        throw err;
      })
  });
});