import { HttpMethod } from '@dvcol/common-utils';

import type { SynologyRequest } from '~/models/synology-client.model';

import type { SynologyInfoRequest } from '~/models/synology-information.model';

import { CommonAPI, Controller, Endpoint, InfoMethod, type SynologyInfoResponse, Version } from '~/models';
import { SynologyClientEndpoint } from '~/models/synology-client.model';

export const information = {
  info: new SynologyClientEndpoint<SynologyRequest<SynologyInfoRequest>, SynologyInfoResponse>({
    controller: Controller.Common,
    api: CommonAPI.Info,
    url: Endpoint.Query,
    version: Version.v1,
    method: HttpMethod.POST,
    body: {
      api: true,
      version: true,
      method: true,

      query: false,
    },
    seed: {
      method: InfoMethod.query,
      query: ['ALL'],
    },
    transform: param => (Array.isArray(param.query) ? { ...param, query: param.query?.join(',') } : param),
  }),
};
