import { HttpMethod } from '@dvcol/common-utils';

import type {
  SynologyCommonResponse,
  SynologyDownloadStationConfig,
  SynologyDownloadStationInfo,
  SynologyDownloadStationStatistic,
  SynologyTaskCommonRequest,
  SynologyTaskCreateRequestV1,
  SynologyTaskDeleteRequestV1,
  SynologyTaskEditRequest,
  SynologyTaskList,
  SynologyTaskListRequest,
} from '~/models';

import type { SynologyRequest } from '~/models/synology-client.model';

import { Controller, DownloadStationAPI, Endpoint, TaskMethod, Version } from '~/models';

import { SynologyClientEndpoint } from '~/models/synology-client.model';

const sanitizeUrl = (url: string): URL => new URL(url.toString().replace(/,/g, '%2C'));

const infoTemplate = {
  controller: Controller.DownloadStation,
  api: DownloadStationAPI.Info,
  url: Endpoint.Info,
  version: Version.v1,
  method: HttpMethod.POST,
};

const taskTemplate = {
  controller: Controller.DownloadStation,
  api: DownloadStationAPI.Task,
  url: Endpoint.Task,
};

export const download = {
  config: {
    get: new SynologyClientEndpoint<SynologyRequest, SynologyDownloadStationConfig>({
      ...infoTemplate,
      body: {
        api: true,
        version: true,
        method: true,
      },
      seed: {
        method: TaskMethod.getConfig,
      },
    }),
    set: new SynologyClientEndpoint<SynologyRequest<SynologyDownloadStationConfig>, SynologyCommonResponse>({
      ...infoTemplate,
      body: {
        api: true,
        version: true,
        method: true,
      },
      seed: {
        method: TaskMethod.setConfig,
      },
    }),
  },
  info: new SynologyClientEndpoint<SynologyRequest, SynologyDownloadStationInfo>({
    ...infoTemplate,
    body: {
      api: true,
      version: true,
      method: true,
    },
    seed: {
      method: TaskMethod.getInfo,
    },
  }),
  statistic: new SynologyClientEndpoint<SynologyRequest, SynologyDownloadStationStatistic>({
    controller: Controller.DownloadStation,
    api: DownloadStationAPI.Statistic,
    url: Endpoint.Statistic,
    version: Version.v1,
    method: HttpMethod.POST,
    body: {
      api: true,
      version: true,
      method: true,
    },
    seed: {
      method: TaskMethod.getInfo,
    },
  }),
  task: {
    list: new SynologyClientEndpoint<SynologyRequest<SynologyTaskListRequest>, SynologyTaskList>({
      ...taskTemplate,
      version: Version.v1,
      method: HttpMethod.POST,
      body: {
        api: true,
        version: true,
        method: true,

        offset: false,
        limit: false,
        additional: false,
      },
      seed: {
        method: TaskMethod.list,
      },
    }),
    create: new SynologyClientEndpoint<SynologyRequest<SynologyTaskCreateRequestV1>, void, false>({
      ...taskTemplate,
      version: Version.v1,
      method: HttpMethod.POST,
      opts: {
        cache: false,
      },
      body: {
        api: true,
        version: true,
        method: true,

        uri: false,
        file: false,

        username: false,
        password: false,

        unzip: false,
        destination: false,
      },
      seed: {
        method: TaskMethod.create,
      },
      validate: params => {
        if (params.uri?.length || params.file) return true;
        console.error('Task validation: Missing uri or file', params);
        throw new Error('Missing uri or file');
      },
      transform: params => {
        if (params?.uri?.length) {
          if (Array.isArray(params.uri)) params.uri = params.uri.map(_url => sanitizeUrl(_url).toString())?.join(',');
          else params.uri = sanitizeUrl(params.uri).toString();
        }
        return params;
      },
    }),
    delete: new SynologyClientEndpoint<SynologyRequest<SynologyTaskDeleteRequestV1>, SynologyCommonResponse[], false>({
      ...taskTemplate,
      version: Version.v1,
      method: HttpMethod.PUT,
      opts: {
        cache: false,
      },
      body: {
        api: true,
        version: true,
        method: true,

        id: true,
        force_complete: false,
      },
      seed: {
        method: TaskMethod.delete,
        force_complete: false,
      },
    }),
    pause: new SynologyClientEndpoint<SynologyRequest<SynologyTaskCommonRequest>, SynologyCommonResponse[], false>({
      ...taskTemplate,
      version: Version.v1,
      method: HttpMethod.PUT,
      opts: {
        cache: false,
      },
      body: {
        api: true,
        version: true,
        method: true,

        id: true,
      },
      seed: {
        method: TaskMethod.pause,
      },
    }),
    resume: new SynologyClientEndpoint<SynologyRequest<SynologyTaskCommonRequest>, SynologyCommonResponse[], false>({
      ...taskTemplate,
      version: Version.v1,
      method: HttpMethod.PUT,
      opts: {
        cache: false,
      },
      body: {
        api: true,
        version: true,
        method: true,

        id: true,
      },
      seed: {
        method: TaskMethod.resume,
      },
    }),
    edit: new SynologyClientEndpoint<SynologyRequest<SynologyTaskEditRequest>, SynologyCommonResponse[], false>({
      ...taskTemplate,
      version: Version.v2,
      method: HttpMethod.PUT,
      opts: {
        cache: false,
      },
      body: {
        api: true,
        version: true,
        method: true,

        id: true,
        destination: true,
      },
      seed: {
        method: TaskMethod.edit,
      },
    }),
  },
};
