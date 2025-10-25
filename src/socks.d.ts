import { Agent, ClientRequest } from 'http';
import { Socket } from 'net';
import { ProxyAgentOptions } from './agent';

declare class SOCKS extends Agent {
  proxy: any;
  options: ProxyAgentOptions;

  constructor(proxy: string, options: ProxyAgentOptions);

  init(): void;
  addRequest(req: ClientRequest, options: any): void;
  createConnection(options: any): Promise<Socket>;
}

export = SOCKS;
