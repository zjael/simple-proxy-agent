#!/usr/bin/env node

/**
 * Simple manual test for quick proxy verification
 *
 * Usage:
 *   node examples/simple-test.js [proxy-url]
 *
 * If no proxy URL is provided, uses HTTP_PROXY or HTTPS_PROXY env vars
 */

const https = require('https');
const ProxyAgent = require('../src/agent.js');

const proxyUrl = process.argv[2] || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

if (!proxyUrl) {
  console.error('Error: No proxy URL provided');
  console.error('Usage: node examples/simple-test.js <proxy-url>');
  console.error('   Or: export HTTPS_PROXY=http://127.0.0.1:8080 && node examples/simple-test.js');
  process.exit(1);
}

console.log('Testing proxy:', proxyUrl);
console.log('Making request to httpbin.org...\n');

const agent = new ProxyAgent(proxyUrl, {
  timeout: 10000,
});

https
  .get('https://httpbin.org/ip', { agent }, res => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('\nResponse:');

    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));
        console.log('\n✓ Proxy connection successful!');
      } catch {
        console.log(data);
      }
    });
  })
  .on('error', err => {
    console.error('\n✗ Error:', err.message);
    process.exit(1);
  });
