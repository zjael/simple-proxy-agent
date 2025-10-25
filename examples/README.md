# Integration Testing Examples

This directory contains scripts and configurations for testing `simple-proxy-agent` with real proxy servers.

## Files

- `simple-test.js` - Quick manual test script
- `integration-test.js` - Comprehensive test suite
- `mock-proxy-server.js` - Simple HTTP proxy for local testing
- `docker-compose.yml` - Docker setup for test proxy servers
- `squid.conf` - Squid proxy configuration

## Quick Start

### Option 1: Test with Mock Proxy (Simplest)

Start the mock proxy server:

```bash
node examples/mock-proxy-server.js
```

In another terminal, test with it:

```bash
node examples/simple-test.js http://127.0.0.1:8888
node examples/integration-test.js http://127.0.0.1:8888
```

**Note:** The mock proxy requires internet/DNS access to work properly.

### Option 2: Test with Your Own Proxy

If you have access to a proxy server:

```bash
node examples/simple-test.js http://127.0.0.1:3128
node examples/simple-test.js socks5://127.0.0.1:1080
node examples/simple-test.js http://user:pass@proxy.example.com:8080
```

Or use environment variables:

```bash
export HTTPS_PROXY=http://127.0.0.1:3128
node examples/simple-test.js
```

### 2. Comprehensive Integration Tests

Run full test suite against a proxy:

```bash
node examples/integration-test.js http://127.0.0.1:3128
```

This will test:
- HTTP requests through proxy
- HTTPS requests through proxy
- Different HTTP methods
- Request headers
- JSON responses
- Timeouts and delays

### 3. Using Docker Test Proxies

Start test proxy servers using Docker Compose:

```bash
cd examples
docker-compose up -d
```

This will start:
- **HTTP Proxy (Squid)** on port 3128
- **SOCKS5 Proxy** on port 1080 (no auth)
- **SOCKS5 Proxy with Auth** on port 1081 (user: testuser, pass: testpass)

#### Test with Docker proxies:

```bash
# Test HTTP proxy
node examples/integration-test.js http://127.0.0.1:3128

# Test SOCKS5 proxy
node examples/integration-test.js socks5://127.0.0.1:1080

# Test SOCKS5 with authentication
node examples/integration-test.js socks5://testuser:testpass@127.0.0.1:1081
```

Stop test proxies:

```bash
cd examples
docker-compose down
```

## Test Output Example

```
═══════════════════════════════════════════════════════
  simple-proxy-agent Integration Test
═══════════════════════════════════════════════════════

Proxy: http://127.0.0.1:3128
Tests: 7

→ HTTP Request to HTTP endpoint
  URL: http://httpbin.org/ip
  ✓ Status: 200
  ✓ Duration: 234ms
  Response preview:
  {
    "origin": "1.2.3.4"
  }

→ HTTPS Request to HTTPS endpoint
  URL: https://httpbin.org/ip
  ✓ Status: 200
  ✓ Duration: 456ms
  ...

═══════════════════════════════════════════════════════
  Test Summary
═══════════════════════════════════════════════════════

Total tests:  7
Passed:       7
Failed:       0
Success rate: 100.0%
Avg duration: 345ms
```

## Testing with Public Proxies

**Warning:** Public free proxies are often unreliable. For testing, it's recommended to use the Docker setup or a known proxy service.

If using a public proxy, test with:

```bash
node examples/simple-test.js http://proxy.example.com:8080
```

## CI/CD Integration

You can use the integration test in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Test with proxy
  run: |
    docker-compose -f examples/docker-compose.yml up -d
    sleep 5  # Wait for proxies to start
    node examples/integration-test.js http://127.0.0.1:3128
    docker-compose -f examples/docker-compose.yml down
```

## Troubleshooting

### Proxy connection refused
- Ensure the proxy server is running
- Check firewall rules
- Verify the proxy port

### Timeout errors
- Increase timeout in the test script
- Check network connectivity
- Verify proxy server is responding

### Authentication failures
- Double-check username and password
- Ensure URL encoding for special characters in credentials
- Example: `http://user%40name:p%40ssword@proxy:8080`

## Additional Examples

### TypeScript Usage

```typescript
import https from 'https';
import ProxyAgent from 'simple-proxy-agent';

const agent = new ProxyAgent('http://127.0.0.1:3128', {
  timeout: 10000,
  tunnel: true,
});

https.get('https://httpbin.org/ip', { agent }, res => {
  // Handle response
});
```

### With node-fetch

```javascript
const fetch = require('node-fetch');
const ProxyAgent = require('simple-proxy-agent');

const agent = new ProxyAgent('socks5://127.0.0.1:1080');

fetch('https://api.example.com/data', { agent })
  .then(res => res.json())
  .then(data => console.log(data));
```

### With axios

```javascript
const axios = require('axios');
const ProxyAgent = require('simple-proxy-agent');

const agent = new ProxyAgent('http://127.0.0.1:3128');

axios.get('https://api.example.com/data', {
  httpAgent: agent,
  httpsAgent: agent,
})
  .then(res => console.log(res.data));
```
