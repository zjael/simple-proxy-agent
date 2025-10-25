import { Agent } from 'http';

export interface ProxyAgentOptions {
  /**
   * If true, will tunnel all HTTPS using CONNECT method.
   * @default true
   */
  tunnel?: boolean;

  /**
   * Time in milliseconds to maximum wait for proxy connection to establish.
   * @default 5000
   */
  timeout?: number;
}

/**
 * Creates a proxy agent for HTTP/HTTPS/SOCKS proxies
 * @param proxy - Proxy URL (http://, https://, socks://, socks4://, socks4a://, socks5://, socks5h://)
 * @param options - Optional configuration
 * @returns Proxy agent instance
 * @example
 * ```js
 * const ProxyAgent = require('simple-proxy-agent');
 * const agent = new ProxyAgent('http://127.0.0.1:8080', { timeout: 10000 });
 * ```
 */
declare function ProxyAgent(proxy: string, options?: ProxyAgentOptions): Agent;

export = ProxyAgent;
