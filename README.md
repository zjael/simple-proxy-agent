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

- `http://` - HTTP proxy
- `https://` - HTTPS proxy
- `socks://` or `socks5://` - SOCKS5 proxy (remote DNS resolution)
- `socks5h://` - SOCKS5 proxy (remote DNS resolution, explicit)
- `socks4://` - SOCKS4 proxy (local DNS resolution)
- `socks4a://` - SOCKS4a proxy (remote DNS resolution)

## Requirements

- Node.js >= 18.0.0

## License

MIT
