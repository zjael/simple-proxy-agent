const assert = require('assert');
const ProxyAgent = require('../src/agent.js');

describe('Agent Caching', () => {
  it('should cache and reuse agent instances for identical configs', () => {
    const proxy = 'http://127.0.0.1:8080';
    const options = { timeout: 5000, tunnel: true };

    const agent1 = new ProxyAgent(proxy, options);
    const agent2 = new ProxyAgent(proxy, options);

    // Same proxy and options should return cached instance
    assert.strictEqual(agent1, agent2, 'Agents should be the same instance');
  });

  it('should create different agents for different proxies', () => {
    const proxy1 = 'http://127.0.0.1:8080';
    const proxy2 = 'http://127.0.0.1:9090';
    const options = { timeout: 5000, tunnel: true };

    const agent1 = new ProxyAgent(proxy1, options);
    const agent2 = new ProxyAgent(proxy2, options);

    // Different proxies should return different instances
    assert.notStrictEqual(agent1, agent2, 'Agents should be different instances');
  });

  it('should create different agents for different options', () => {
    const proxy = 'http://127.0.0.1:8080';
    const options1 = { timeout: 5000, tunnel: true };
    const options2 = { timeout: 10000, tunnel: true };

    const agent1 = new ProxyAgent(proxy, options1);
    const agent2 = new ProxyAgent(proxy, options2);

    // Different options should return different instances
    assert.notStrictEqual(agent1, agent2, 'Agents should be different instances');
  });
});
