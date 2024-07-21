/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/

import { INTERNAL_EVENTS } from '../constants';
import { IProxyAdapter, ISPADeps, IncomingRequestDetails, ServerState, ServerStateEvent } from './types';
import { ICACerts, ICAPeerJWSCert } from '../infra';
import config from '../config';
const { checkPeerJwsInterval, pm4mlEnabled } = config.get();

export class InterSchemeProxyAdapter implements IProxyAdapter {
  private peerJwsRefreshLoopTimer: {
    A: NodeJS.Timeout | undefined;
    B: NodeJS.Timeout | undefined;
  } = { A: undefined, B: undefined };

  constructor(private readonly deps: ISPADeps) {
    this.handleProxyRequest = this.handleProxyRequest.bind(this);
  }

  async handleProxyRequest(reqDetails: IncomingRequestDetails, serverState: ServerState) {
    const { ispaService, httpRequest } = this.deps;
    const { httpsAgent } = serverState;
    const proxyTarget = ispaService.getProxyTarget(reqDetails, serverState); // pass only accessToken

    return httpRequest({
      httpsAgent,
      url: proxyTarget.url,
      headers: proxyTarget.headers,
      method: reqDetails.method,
      data: reqDetails.payload,
    });
  }

  async start(): Promise<void> {
    this.startPeer();
    this.deps.logger.debug('Starting httpServers...');

    const [isAStarted, isBStarted] = await Promise.all([
      this.deps.httpServerA.start(this.handleProxyRequest),
      this.deps.httpServerB.start(this.handleProxyRequest),
    ]);

    this.deps.logger.info('ISPA is started', { isAStarted, isBStarted });
  }

  private timeoutA: NodeJS.Timeout | undefined;
  private timeoutB: NodeJS.Timeout | undefined;
  private retryAgents: boolean = false;

  startPeer() {
    const init = async (which: 'A' | 'B') => {
      this.deps.logger.info('Starting peer', { peer: which });
      const agent = this.deps[`controlAgent${which}`];
      const emit = (event: ServerStateEvent) => this.deps[`httpServer${which}`].emit(INTERNAL_EVENTS.serverState, event);
      const peerAgent = this.deps[`controlAgent${which === 'A' ? 'B' : 'A'}`];
      try {
        await this.deps[`authClient${which}`].startAccessTokenUpdates((accessToken: string) => emit({ accessToken }));
        await agent.init({
          onCert: (certs: ICACerts) => emit({ certs }),
          onPeerJWS: (peerJWS: ICAPeerJWSCert[]) => peerAgent.sendPeerJWS(peerJWS),
        });
        emit({ certs: await agent.loadCerts() });

        // @note: This is a fail safe measure to ensure that the peer JWS certs
        // are optimistically retrieved, just in case the websocket event is missed.
        this.peerJwsRefreshLoopTimer[which] = setInterval(() => agent.triggerFetchPeerJws(), checkPeerJwsInterval);
        this.deps.logger.info('Certs and token are ready.', { peer: which });

      } catch (error) {
        if (this.retryAgents) this[`timeout${which}`] = setTimeout(() => init(which), 60000);
        this.deps.logger.error('Failed to start peer', { error, peer: which });
      }
    };
    if (pm4mlEnabled) {
      this.retryAgents = true;
      init('A');
      init('B');
    }
  }

  async stop(): Promise<void> {
    this.retryAgents = false;
    this.timeoutA && clearTimeout(this.timeoutA);
    this.timeoutA = undefined;
    this.timeoutB && clearTimeout(this.timeoutB);
    this.timeoutB = undefined;
    this.peerJwsRefreshLoopTimer.A && clearInterval(this.peerJwsRefreshLoopTimer.A);
    this.peerJwsRefreshLoopTimer.A = undefined;
    this.peerJwsRefreshLoopTimer.B && clearInterval(this.peerJwsRefreshLoopTimer.B);
    this.peerJwsRefreshLoopTimer.B = undefined;
    this.deps.authClientA.stopUpdates();
    this.deps.authClientB.stopUpdates();
    // prettier-ignore
    const [isAStopped, isBStopped] = await Promise.all([
      this.deps.httpServerA.stop(),
      this.deps.httpServerB.stop(),
    ]);
    this.deps.logger.info('ISPA is stopped', { isAStopped, isBStopped });
  }
}
