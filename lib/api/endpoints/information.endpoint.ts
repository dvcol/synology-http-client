import { HttpMethod } from '@dvcol/common-utils';

import type { SynologyRequest } from '~/models/synology-client.model';

import type { SynologyInfoRequest, SynologyInfoResponse } from '~/models/synology-information.model';

import { SynologyClientEndpoint } from '~/models/synology-client.model';

import { CommonAPI, Controller, Endpoint, InfoMethod, Version } from '~/models/synology.model';
import { baseBodyValidation } from '~/utils/endpoint.utils';

export const information = {
  info: new SynologyClientEndpoint<SynologyRequest<SynologyInfoRequest>, SynologyInfoResponse>({
    controller: Controller.Common,
    api: CommonAPI.Info,
    url: Endpoint.Query,
    version: Version.v1,
    method: HttpMethod.POST,
    body: {
      ...baseBodyValidation,

      query: false,
    },
    seed: {
      method: InfoMethod.query,
      query: ['ALL'],
    },
    transform: param => (Array.isArray(param.query) ? { ...param, query: param.query?.join(',') } : param),
  }),
};
