import { ILogger } from '../../domain';
import { ControlAgent } from './index';
import { IControlAgent } from './types';
import config from '../../config';

type controlAgentsMap = Readonly<{
  controlAgentA: IControlAgent;
  controlAgentB: IControlAgent;
}>;

type createControlAgentsDeps = {
  logger: ILogger;
};

export const createControlAgents = async (deps: createControlAgentsDeps): Promise<controlAgentsMap> => {
  const { logger } = deps;
  const controlAgentA = new ControlAgent({
    id: 'ControlAgentA',
    address: config.get('mgmtApiAConfig').host,
    port: config.get('mgmtApiAConfig').port,
    logger: logger.child('controlAgentA'),
  });

  const controlAgentB = new ControlAgent({
    id: 'ControlAgentB',
    address: config.get('mgmtApiBConfig').host,
    port: config.get('mgmtApiBConfig').port,
    logger: logger.child('controlAgentB'),
  });

  return Object.freeze({
    controlAgentA,
    controlAgentB,
  });
};
