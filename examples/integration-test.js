#!/usr/bin/env node

/**
 * Integration test script for simple-proxy-agent
 * Tests against real proxy servers to verify functionality
 *
 * Usage:
 *   node examples/integration-test.js <proxy-url>
 *
 * Examples:
 *   node examples/integration-test.js http://127.0.0.1:8080
 *   node examples/integration-test.js socks5://127.0.0.1:1080
 *   node examples/integration-test.js http://user:pass@proxy.example.com:8080
 */

const http = require('http');
const https = require('https');
const ProxyAgent = require('../src/agent.js');

// Test configuration
const TESTS = [
  {
    name: 'HTTP Request to HTTP endpoint',
    url: 'http://httpbin.org/ip',
    protocol: 'http',
  },
  {
    name: 'HTTPS Request to HTTPS endpoint',
    url: 'https://httpbin.org/ip',
    protocol: 'https',
  },
  {
    name: 'GET request with headers',
    url: 'https://httpbin.org/headers',
    protocol: 'https',
  },
  {
    name: 'User-Agent test',
    url: 'https://httpbin.org/user-agent',
    protocol: 'https',
  },
  {
    name: 'JSON response test',
    url: 'https://httpbin.org/json',
    protocol: 'https',
  },
  {
    name: 'Status code test (200)',
    url: 'https://httpbin.org/status/200',
    protocol: 'https',
  },
  {
    name: 'Delay test (2s)',
    url: 'https://httpbin.org/delay/2',
    protocol: 'https',
    timeout: 5000,
  },
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function makeRequest(url, agent, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      agent,
      timeout,
      headers: {
        'User-Agent': 'simple-proxy-agent-integration-test/1.0',
      },
    };

    const startTime = Date.now();
    const req = client.get(url, options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          duration,
        });
      });
    });

    req.on('error', err => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

async function runTest(test, proxyUrl) {
  const agent = new ProxyAgent(proxyUrl, {
    timeout: test.timeout || 10000,
  });

  console.log(`\n${colorize('→', 'blue')} ${test.name}`);
  console.log(`  URL: ${colorize(test.url, 'cyan')}`);

  try {
    const result = await makeRequest(test.url, agent, test.timeout);

    console.log(`  ${colorize('✓', 'green')} Status: ${result.statusCode}`);
    console.log(`  ${colorize('✓', 'green')} Duration: ${result.duration}ms`);

    // Show response preview
    if (result.body) {
      try {
        const json = JSON.parse(result.body);
        const preview = JSON.stringify(json, null, 2)
          .split('\n')
          .slice(0, 5)
          .join('\n');
        console.log(`  Response preview:\n${colorize(preview, 'cyan')}`);
        if (JSON.stringify(json).split('\n').length > 5) {
          console.log(`  ${colorize('... (truncated)', 'cyan')}`);
        }
      } catch (e) {
        const preview = result.body.substring(0, 200);
        console.log(`  Response preview: ${colorize(preview, 'cyan')}`);
        if (result.body.length > 200) {
          console.log(`  ${colorize('... (truncated)', 'cyan')}`);
        }
      }
    }

    return { success: true, duration: result.duration };
  } catch (err) {
    console.log(`  ${colorize('✗', 'red')} Failed: ${err.message}`);
    if (err.stack) {
      console.log(`  ${colorize(err.stack.split('\n').slice(0, 3).join('\n'), 'red')}`);
    }
    return { success: false, error: err.message };
  }
}

async function main() {
  const proxyUrl = process.argv[2];

  if (!proxyUrl) {
    console.error(colorize('\nError: Proxy URL is required\n', 'red'));
    console.log('Usage:');
    console.log('  node examples/integration-test.js <proxy-url>\n');
    console.log('Examples:');
    console.log('  node examples/integration-test.js http://127.0.0.1:8080');
    console.log('  node examples/integration-test.js socks5://127.0.0.1:1080');
    console.log('  node examples/integration-test.js http://user:pass@proxy.example.com:8080\n');
    process.exit(1);
  }

  console.log(colorize('\n═══════════════════════════════════════════════════════', 'blue'));
  console.log(colorize('  simple-proxy-agent Integration Test', 'blue'));
  console.log(colorize('═══════════════════════════════════════════════════════\n', 'blue'));

  console.log(`${colorize('Proxy:', 'yellow')} ${proxyUrl}`);
  console.log(`${colorize('Tests:', 'yellow')} ${TESTS.length}`);

  const results = [];

  for (const test of TESTS) {
    const result = await runTest(test, proxyUrl);
    results.push(result);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log(colorize('\n═══════════════════════════════════════════════════════', 'blue'));
  console.log(colorize('  Test Summary', 'blue'));
  console.log(colorize('═══════════════════════════════════════════════════════\n', 'blue'));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const successRate = ((successful / results.length) * 100).toFixed(1);

  console.log(`Total tests:  ${results.length}`);
  console.log(`${colorize('Passed:', 'green')}       ${successful}`);
  console.log(`${colorize('Failed:', 'red')}       ${failed}`);
  console.log(`Success rate: ${colorize(successRate + '%', successRate === '100.0' ? 'green' : 'yellow')}`);

  if (successful > 0) {
    const durations = results.filter(r => r.success).map(r => r.duration);
    const avgDuration = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(0);
    console.log(`Avg duration: ${avgDuration}ms`);
  }

  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(colorize('\nUnexpected error:', 'red'), err);
  process.exit(1);
});
