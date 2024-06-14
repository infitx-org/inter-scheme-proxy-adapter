import convict from 'convict';
import { AppConfig } from './infra';

const config = convict<AppConfig>({
  PROXY_ID: {
    doc: 'The Proxy DFSP ID',
    format: String,
    default: null,
    env: 'PROXY_ID',
  },

  authConfigA: {
    tokenEndpoint: {
      doc: 'Endpoint to get access token on hub A',
      format: String,
      default: null,
      env: 'OAUTH_TOKEN_ENDPOINT_A',
    },
    clientKey: {
      doc: 'Client key on hub A',
      format: String,
      default: null,
      env: 'OAUTH_CLIENT_KEY_A',
    },
    clientSecret: {
      doc: 'Client secret to get token on hub A',
      format: String,
      default: null,
      sensitive: true,
      env: 'OAUTH_CLIENT_SECRET_A',
    },
    refreshSeconds: {
      doc: 'Time interval (in sec) to update access token on hub A',
      format: Number,
      default: 60,
      env: 'OAUTH_REFRESH_SECONDS_A',
    },
  },

  authConfigB: {
    tokenEndpoint: {
      doc: 'Endpoint to get access token on hub B',
      format: String,
      default: null,
      env: 'OAUTH_TOKEN_ENDPOINT_B',
    },
    clientKey: {
      doc: 'Client key on hub B',
      format: String,
      default: null,
      env: 'OAUTH_CLIENT_KEY_B',
    },
    clientSecret: {
      doc: 'Client secret to get token on hub B',
      format: String,
      default: null,
      sensitive: true,
      env: 'OAUTH_CLIENT_SECRET_B',
    },
    refreshSeconds: {
      doc: 'Time interval (in sec) to update access token on hub B',
      format: Number,
      default: 60,
      env: 'OAUTH_REFRESH_SECONDS_B',
    },
  },

  serverAConfig: {
    port: {
      doc: 'HTTP port to listen on for serverA',
      format: 'port',
      default: 4100,
      env: 'INBOUND_LISTEN_PORT_A',
    },
    host: {
      doc: 'Hostname or IP address where the serverA listens for incoming requests',
      format: String,
      default: '0.0.0.0',
      env: 'INBOUND_HOST_A',
    },
  },

  serverBConfig: {
    port: {
      doc: 'HTTP port to listen on for serverB',
      format: 'port',
      default: 4200,
      env: 'INBOUND_LISTEN_PORT_B',
    },
    host: {
      doc: 'Hostname or IP address where the serverB listens for incoming requests',
      format: String,
      default: '0.0.0.0',
      env: 'INBOUND_HOST_B',
    },
  },

  mgmtApiAConfig: {
    host: {
      doc: 'Hostname or IP address where the management API listens for incoming requests',
      format: String,
      default: null,
      env: 'MGMT_API_WS_URL_A',
    },
    port: {
      doc: 'HTTP port to listen on for the management API',
      format: 'port',
      default: 4000,
      env: 'MGMT_API_WS_PORT_A',
    },
  },

  mgmtApiBConfig: {
    host: {
      doc: 'Hostname or IP address where the management API listens for incoming requests',
      format: String,
      default: null,
      env: 'MGMT_API_WS_URL_B',
    },
    port: {
      doc: 'HTTP port to listen on for the management API',
      format: 'port',
      default: 4000,
      env: 'MGMT_API_WS_PORT_B',
    },
  },

  hubAConfig: {
    baseUrl: {
      doc: 'Base URL on hub A',
      format: String,
      default: null,
      env: 'PEER_ENDPOINT_A',
    },
  },

  hubBConfig: {
    baseUrl: {
      doc: 'Base URL on hub B',
      format: String,
      default: null,
      env: 'PEER_ENDPOINT_B',
    },
  },

  LOG_LEVEL: {
    doc: 'Logger level',
    format: String, // todo: use LogLevel type
    default: 'info',
    env: 'LOG_LEVEL',
  },

  pm4mlEnabled: {
    doc: 'Defines if pm4ml is enabled',
    format: Boolean,
    default: false,
    env: 'PM4ML_ENABLED',
  },
});

config.validate({ allowed: 'strict' });

export default config;
