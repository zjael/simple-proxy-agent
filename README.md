# simple-proxy-agent

[![Build status](https://github.com/zjael/simple-proxy-agent/workflows/Node%20CI/badge.svg)](https://github.com/zjael/simple-proxy-agent/actions)
[![Package version](https://img.shields.io/npm/v/simple-proxy-agent.svg)](https://npmjs.org/package/simple-proxy-agent)
[![NPM downloads](https://img.shields.io/npm/dm/simple-proxy-agent)](https://npmjs.org/package/simple-proxy-agent)
[![Make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

> A simple agent for HTTP and HTTPS requests through HTTP and SOCKS proxies

## Features

- HTTP and HTTPS proxy support
- SOCKS4, SOCKS4a, SOCKS5, and SOCKS5h proxy support
- Proxy authentication (username/password)
- TypeScript type definitions included
- Tunnel mode for HTTPS connections
- Configurable connection timeout

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [JavaScript](#javascript)
  - [TypeScript](#typescript)
  - [Basic Authentication](#basic-authentication)
  - [SOCKS Proxies](#socks-proxies)
- [API](#api)
  - [ProxyAgent(proxy, options)](#proxyagentproxy-options)
  - [Options](#options)
- [Supported Proxy Protocols](#supported-proxy-protocols)
- [Testing](#testing)
- [Requirements](#requirements)
- [License](#license)

## Install

```bash
npm install simple-proxy-agent
```

## Usage

### JavaScript

```js
const fetch = require('node-fetch');
const ProxyAgent = require('simple-proxy-agent');

fetch('https://example.com', {
  agent: new ProxyAgent('http://127.0.0.1:8080'),
})
  .then(res => res.text())
  .then(body => console.log(body))
  .catch(err => console.error(err));
```

### TypeScript

```typescript
import fetch from 'node-fetch';
import ProxyAgent from 'simple-proxy-agent';

const agent = new ProxyAgent('http://127.0.0.1:8080', {
  tunnel: true,
  timeout: 10000,
});

fetch('https://example.com', { agent })
  .then(res => res.text())
  .then(body => console.log(body))
  .catch(err => console.error(err));
```

### Basic Authentication

```js
const ProxyAgent = require('simple-proxy-agent');

// HTTP proxy with authentication
const agent = new ProxyAgent('http://user:password@127.0.0.1:8080');

// SOCKS5 proxy with authentication
const socksAgent = new ProxyAgent('socks5://user:password@127.0.0.1:1080');
```

### SOCKS Proxies

```js
const ProxyAgent = require('simple-proxy-agent');

// SOCKS5 proxy
const agent = new ProxyAgent('socks5://127.0.0.1:1080');

// SOCKS4 proxy
const socks4Agent = new ProxyAgent('socks4://127.0.0.1:1080');

// Use with any HTTP client
const https = require('https');

https.get('https://example.com', { agent }, res => {
  res.on('data', chunk => console.log(chunk.toString()));
});
```

## API

### ProxyAgent(proxy, options)

Creates a new proxy agent instance.

**Parameters:**

- `proxy` (string, required): Proxy URL with protocol (http://, https://, socks4://, socks5://, etc.)
- `options` (object, optional): Configuration options

**Returns:** Agent instance compatible with Node.js http/https modules

### Options

| Option    | Type    | Default | Description                                                    |
| --------- | ------- | ------- | -------------------------------------------------------------- |
| `tunnel`  | boolean | `true`  | If true, will tunnel all HTTPS using CONNECT method            |
| `timeout` | number  | `5000`  | Time in milliseconds to wait for proxy connection to establish |

## Supported Proxy Protocols

- `http://` - HTTP proxy ✅
- `https://` - HTTPS proxy ✅
- `socks://` or `socks5://` - SOCKS5 proxy (remote DNS resolution) ✅
- `socks5h://` - SOCKS5 proxy (remote DNS resolution, explicit) ✅
- `socks4://` - SOCKS4 proxy ⚠️ (experimental, known issues)
- `socks4a://` - SOCKS4a proxy ⚠️ (experimental, known issues)

**Note:** SOCKS5 is the recommended protocol for SOCKS proxies. SOCKS4/4a support is experimental and has known compatibility issues.

## Testing

### Integration Tests

The repository includes comprehensive integration tests that can be run against real proxy servers:

```bash
# Quick test with any proxy
node examples/simple-test.js http://127.0.0.1:8080

# Full test suite
node examples/integration-test.js socks5://127.0.0.1:1080

# Start mock proxy server for local testing
node examples/mock-proxy-server.js
```

See [examples/README.md](examples/README.md) for detailed testing instructions, including:
- Docker Compose setup with ready-to-use proxy servers
- Testing different proxy types (HTTP, HTTPS, SOCKS5)
- Authentication testing
- CI/CD integration examples

### Unit Tests

Run the test suite:

```bash
npm test
```

## Requirements

- Node.js >= 18.0.0

## License

MIT
