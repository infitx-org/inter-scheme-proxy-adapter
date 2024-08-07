import { type Agent } from 'node:https';
import { PeerLabel, ILogger, ServerStateEvent } from '../domain/types';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { HEALTH_STATUSES } from '../constants';

export * from './controlAgent/types';

export type AppConfig = {
  PROXY_ID: string;
  LOG_LEVEL: string; // todo: use LogLevel type

  peerAConfig: PeerServerConfig;
  peerBConfig: PeerServerConfig;

  pm4mlEnabled: boolean;
  incomingHeadersRemoval: string[];
  checkPeerJwsInterval: number;
  retryStartTimeoutSec: number;
};

export type PeerServerConfig = {
  peer: PeerLabel;
  peerEndpoint: string;
  authConfig: AuthConfig;
  controlAgentConfig: ControlAgentConfig;
  serverConfig: ServerConfig;
};

// rename to ProxyServerConfig or HttpServerConfig?
export type ServerConfig = {
  host: string;
  port: number;
};

export type ControlAgentConfig = {
  wsHost: string;
  wsPort: number;
  timeout: number;
  reconnectInterval: number;
};

export type AuthConfig = {
  tokenEndpoint: string;
  clientKey: string; // or rename it to clientId?
  clientSecret: string;
  refreshSeconds: number;
  // think, if we need to add mTlsEnabled option
};

export type TlsOptions = Readonly<{
  ca: string | Buffer;
  cert: string | Buffer;
  key: string | Buffer;
}>;
// think, if we need to leave only string?

export type ProxyTlsAgent = Agent | null;

export type HttpServerDeps = {
  serverConfig: ServerConfig;
  peerEndpoint: string; // url
  logger: ILogger;
};

export type AuthClientDeps = {
  authConfig: AuthConfig;
  logger: ILogger;
  // httpClient: HttpClient; // axios
};

type Status = (typeof HEALTH_STATUSES)[keyof typeof HEALTH_STATUSES];

export type HealthcheckDetails = {
  [key in keyof Required<ServerStateEvent>]: boolean;
} & { isReady: boolean };

export type HealthcheckState = {
  status: Status;
  details: HealthcheckDetails; // or rename to state?
  startTime: string; // ISO date string
  versionNumber: string;
};
