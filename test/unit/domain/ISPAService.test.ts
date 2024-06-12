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

import { ISPAService, ISPAServiceInterface } from '#src/domain';
import { loggerFactory } from '#src/utils';
import { PROXY_HEADER, AUTH_HEADER } from '#src/constants';
import config from '#src/config';

// import * as fixtures from '#test/fixtures';

describe('ISPAService Tests -->', () => {
  const logger = loggerFactory('test');

  let service: ISPAServiceInterface;
  beforeEach(() => {
    service = new ISPAService({ logger });
  });

  test('should return correct proxy details', () => {
    const pathWithSearchParams = '/path?query=1';
    const incomingUrl = new URL(`http://localhost:12345${pathWithSearchParams}`);
    const headers = { h: 'h1' };
    const { baseUrl } = config.get('hubBConfig');
    const token = 'TOKEN_NOT_IMPLEMENTED_YET'; // todo: update after implement token retrieval

    const proxyDetails = service.getProxyTarget({
      url: incomingUrl,
      method: 'GET',
      headers,
      proxyDetails: { baseUrl },
    });

    expect(proxyDetails.url).toBe(`${baseUrl}${pathWithSearchParams}`);
    expect(proxyDetails.headers).toEqual({
      ...headers,
      [PROXY_HEADER]: config.get('PROXY_DFSP_ID'),
      [AUTH_HEADER]: `Bearer ${token}`,
    });
  });
});
