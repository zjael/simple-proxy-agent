process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const assert = require('assert');
const ProxyAgent = require('../src/agent.js');
const fetch = require('node-fetch');
const server = require('./server.js');
const httpProxy = require('./http-proxy.js');
const socksProxy = require('./socks-proxy');
const pem = require('pem');

const serverPorts = {};
const proxyPorts = {};

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
          serverPorts.HTTP = port;
          resolve();
        })
      }),
      new Promise(resolve => {
        server.createHTTPS(options).then(port => {
          serverPorts.HTTPS = port;
          resolve();
        })
      }),
      new Promise(resolve => {
        httpProxy.create().then(port => {
          proxyPorts.HTTP = port;
          proxyPorts.HTTPS = port;
          resolve();
        })
      }),
      new Promise(resolve => {
        socksProxy.create().then(port => {
          proxyPorts.SOCKS = port;
          proxyPorts.SOCKS4 = port;
          proxyPorts.SOCKS5 = port;
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
  for(const protocol of ["HTTP", "HTTPS", "SOCKS4", "SOCKS5"]) {
    for(const server of ["HTTP", "HTTPS"]) {
      it(`should work over an ${protocol} proxy to an ${server} server without auth`, () => {
        const proxy = process.env[`${protocol}_PROXY`] || `${protocol.toLowerCase()}://127.0.0.1:` + proxyPorts[protocol];
        const target = process.env.HTTP_TARGET_URL || `${server.toLowerCase()}://127.0.0.1:` + serverPorts[server];
        const match = target.match(/:\/\/(.*)/)[1];
        return fetch(target, { agent: new ProxyAgent(proxy) })
          .then(res => res.json())
          .then(json => {
            assert.strictEqual(match, json.host);
          })
          .catch(err => {
            throw err;
          }).done;
      });
    }

    for(const server of ["HTTP", "HTTPS"]) {
      it(`should work over an ${protocol} proxy to an ${server} server with auth`, () => {
        const proxy = process.env[`${protocol}_PROXY`] || `${protocol.toLowerCase()}://toto:tata@127.0.0.1:` + proxyPorts[protocol];
        const target = process.env.HTTPS_TARGET_URL || `${server.toLowerCase()}://127.0.0.1:` + serverPorts[server];
        const match = target.match(/:\/\/(.*)/)[1];
        return fetch(target, { agent: new ProxyAgent(proxy) })
          .then(res => res.json())
          .then(json => {
            assert.strictEqual(match, json.host);
          })
          .catch(err => {
            throw err;
          }).done;
      });
    }
  }
});