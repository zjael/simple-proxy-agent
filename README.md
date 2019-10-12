# simple-proxy-agent

[![Build status](https://github.com/zjael/simple-proxy-agent/workflows/push/badge.svg)](https://github.com/zjael/simple-proxy-agent/actions)
[![Package version](https://img.shields.io/npm/v/simple-proxy-agent.svg?style=flat-square)](https://npmjs.org/package/simple-proxy-agent)
[![NPM downloads](https://img.shields.io/npm/dm/simple-proxy-agent?style=flat-square)](https://npmjs.org/package/simple-proxy-agent)
[![Make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> An simple agent for HTTP and HTTPS through HTTP and SOCKS proxies

## Todo

* [ ] Configurable timeout
* [ ] Proxy authentication

## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [License](#license)

## Install

```shell script
npm install simple-proxy-agent
```

## Usage

```js
const fetch = require('node-fetch');
const ProxyAgent = require('simple-proxy-agent');

fetch('example.com', {
  agent: new ProxyAgent('http://0.0.0.0:8080', {
    // Options, with all defaults
    tunnel: true, // If true, will tunnel all HTTPS using CONNECT method
  })
})
.then(res => res.text())
.then(body => console.log(body))
.catch(err => console.error(err))
```

## License

MIT
