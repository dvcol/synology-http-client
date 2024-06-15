import { HttpMethod } from '@dvcol/common-utils';

import type { LoginRequest, LoginResponse, LogoutRequest } from '~/models';

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

export const authentication = {
  login: new SynologyClientEndpoint<SynologyRequest<LoginRequest>, LoginResponse, false>({
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
  logout: new SynologyClientEndpoint<SynologyRequest<LogoutRequest>, void, false>({
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
