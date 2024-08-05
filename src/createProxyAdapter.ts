import { Config } from 'convict';
import { InterSchemeProxyAdapter, ISPADeps, PeerServer, ProxyService } from './domain';
import { loggerFactory } from './utils';
import { AuthClient, createHttpServer, createControlAgent, HttpClient, AppConfig, PeerServerConfig } from './infra';

export const createPeerServer = (peerConfig: PeerServerConfig) => {
  const { peer, peerEndpoint, authConfig, controlAgentConfig, serverConfig } = peerConfig;

  const logger = loggerFactory({ peer });
  const httpClient = new HttpClient({ logger });

  const proxyService = new ProxyService({ httpClient, logger });
  const authClient = new AuthClient({ authConfig, logger });
  const controlAgent = createControlAgent({ peer, controlAgentConfig, logger });
  const httpServer = createHttpServer({ serverConfig, peerEndpoint, logger });

  return new PeerServer({
    proxyService,
    authClient,
    controlAgent,
    httpServer,
    logger,
  });
};

export const createProxyAdapter = (config: Config<AppConfig>, deps: Partial<ISPADeps> = {}) => {
  const logger = loggerFactory('ISPA'); // think how to deal with logger
  const peerA = deps.peerA || createPeerServer(config.get('peerAConfig'));
  const peerB = deps.peerB || createPeerServer(config.get('peerBConfig'));

  return new InterSchemeProxyAdapter({
    peerA,
    peerB,
    logger,
  });
};
