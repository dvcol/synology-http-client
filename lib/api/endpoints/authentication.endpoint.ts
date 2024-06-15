import { HttpMethod } from '@dvcol/common-utils';

import type { SynologyLoginRequest, SynologyLoginResponse, SynologyLogoutRequest } from '~/models';

import type { SynologyRequest } from '~/models/synology-client.model';

import { AuthMethod, CommonAPI, Controller, Endpoint, SessionName, Version } from '~/models';

import { SynologyClientEndpoint } from '~/models/synology-client.model';

const authTemplate = {
  controller: Controller.Common,
  api: CommonAPI.Auth,
  url: Endpoint.Auth,
  version: Version.v1,
  method: HttpMethod.POST,
  opts: { cache: false },
};

/**
 * @see [documentation]{@link https://global.download.synology.com/download/Document/Software/DeveloperGuide/Os/DSM/All/enu/DSM_Login_Web_API_Guide_enu.pdf}
 */
export const authentication = {
  login: new SynologyClientEndpoint<SynologyRequest<SynologyLoginRequest>, SynologyLoginResponse, false>({
    ...authTemplate,
    body: {
      api: true,
      version: true,
      method: true,

      account: true,
      passwd: true,

      otp_code: false,
      enable_device_token: false,
      device_name: false,
      device_id: false,

      session: true,
      format: true,
    },
    seed: {
      method: AuthMethod.login,
      session: SessionName.SynologyHttpClient,
      format: 'cookie',
    },
  }),
  logout: new SynologyClientEndpoint<SynologyRequest<SynologyLogoutRequest>, void, false>({
    ...authTemplate,
    body: {
      api: true,
      version: true,
      method: true,

      session: true,
    },
    seed: {
      method: AuthMethod.logout,
      session: SessionName.SynologyHttpClient,
    },
  }),
};
