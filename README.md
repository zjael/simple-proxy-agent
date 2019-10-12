# simple-proxy-agent

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
