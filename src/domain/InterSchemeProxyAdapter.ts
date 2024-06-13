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

import { readCertsFromFile } from '../infra';
// todo: remove it after menAPI integration is ready!
import config from '../config';

export const MOCK_TOKEN = 'noAccessTokenYet';

export class InterSchemeProxyAdapter implements IProxyAdapter {
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
    await this.getCerts();
    await this.getAccessTokens();
    await this.initWSConnections();
    // maybe, Promise.all?

    const [isAStarted, isBStarted] = await Promise.all([
      this.deps.httpServerA.start(this.handleProxyRequest),
      this.deps.httpServerB.start(this.handleProxyRequest),
    ]);

    this.deps.logger.info('ISPA is started', { isAStarted, isBStarted });
  }

  async stop(): Promise<void> {
    // prettier-ignore
    const [isAStopped, isBStopped] = await Promise.all([
      this.deps.httpServerA.stop(),
      this.deps.httpServerB.stop(),
    ]);
    this.deps.logger.info('ISPA is stopped', { isAStopped, isBStopped });
  }

  private async getAccessTokens() {
    // todo: add logic to obtain access tokens [CSI-126]
    const tokenA = MOCK_TOKEN;
    const tokenB = MOCK_TOKEN;

    this.emitStateEventServerA({ accessToken: tokenA });
    this.emitStateEventServerB({ accessToken: tokenB });
  }

  private async getCerts() {
    // todo: use MenAPI instead
    const { mtlsConfigA, mtlsConfigB } = config.get();
    const certsA = readCertsFromFile(mtlsConfigA);
    const certsB = readCertsFromFile(mtlsConfigB);

    this.emitStateEventServerA({ certs: certsB });
    this.emitStateEventServerB({ certs: certsA });
  }

  async initWSConnections() {
    // const { httpServerA, httpServerB } = this.deps;
    //
    // this.wsAgentA.init({
    //   config: (certs) => this.emitStateEventServerA({ certs }),
    //   error: () => {}, // todo: clarify how to react on this event
    // });
    // this.wsAgentB.init({
    //   config: (certs) => this.emitStateEventServerB({ certs }),
    //   error: () => {}, // todo: clarify how to react on this event
    // });
  }

  private emitStateEventServerA(event: ServerStateEvent) {
    this.deps.httpServerA.emit(INTERNAL_EVENTS.state, event);
  }

  private emitStateEventServerB(event: ServerStateEvent) {
    this.deps.httpServerB.emit(INTERNAL_EVENTS.state, event);
  }
}
