import { HttpMethod } from '@dvcol/common-utils';

import type { SynologyRequest } from '~/models/synology-client.model';

import type {
  SynologyTaskBtEditRequest,
  SynologyTaskBtResponse,
  SynologyTaskCompleteResponse,
  SynologyTaskCreateRequest,
  SynologyTaskCreateResponse,
  SynologyTaskEditRequest,
  SynologyTaskFileEditRequest,
  SynologyTaskListDeleteRequest,
  SynologyTaskListDeleteResponse,
  SynologyTaskListDownloadRequest,
  SynologyTaskListDownloadResponse,
  SynologyTaskListFilesRequest,
  SynologyTaskListFilesResponse,
  SynologyTaskListResponse,
} from '~/models/synology-task.model';

import type { SynologyCommonResponse } from '~/models/synology.model';

import { SynologyClientEndpoint } from '~/models/synology-client.model';

import { TaskListFilesOrderBy } from '~/models/synology-task.model';

import { Controller, DownloadStation2API, Endpoint, EntryAPI, EntryMethod, Order, Task2Method, Version } from '~/models/synology.model';

import { baseBodyValidation, basePaginationValidation } from '~/utils/endpoint.utils';
import { sanitizeUrl, stringifyKeys } from '~/utils/string.utils';

export const download2 = {
  task: {
    create: new SynologyClientEndpoint<SynologyRequest<SynologyTaskCreateRequest>, SynologyTaskCreateResponse, false>({
      controller: Controller.DownloadStation,
      api: DownloadStation2API.Task,
      url: Endpoint.Entry,
      version: Version.v2,
      method: HttpMethod.POST,
      opts: {
        cache: false,
      },
      body: {
        api: true,
        version: true,
        method: true,
        baseUrl: false,

        type: true,
        destination: true,
        username: false,
        password: false,
        extract_password: false,
        url: false,
        file: false,
        mtime: false,
        size: false,
        torrent: false,
        create_list: false,
      },
      seed: {
        method: Task2Method.create,
      },
      validate: params => {
        if (params.url?.length || params.file) return true;
        console.error('Task validation: Missing uri or file', params);
        throw new Error('Missing uri or file');
      },
      transform: params => {
        const { url, file, torrent, ..._request } = params;
        const transformed = stringifyKeys<SynologyRequest<SynologyTaskCreateRequest>>(_request, true);
        if (url?.length) {
          if (Array.isArray(url)) transformed.url = JSON.stringify(url?.map(_url => sanitizeUrl(_url).toString()));
          else transformed.url = sanitizeUrl(url).toString();
        }
        if (torrent) {
          transformed.torrent = torrent;
          transformed.mtime = Date.now()?.toString();
          transformed.size = torrent.size?.toString();
          transformed.file = JSON.stringify(['torrent']);
        } else {
          transformed.file = file;
        }
        return params;
      },
    }),
    list: new SynologyClientEndpoint<SynologyRequest<{ list_id: string }>, SynologyTaskListResponse>({
      controller: Controller.DownloadStation,
      api: DownloadStation2API.TaskList,
      url: Endpoint.Entry,
      version: Version.v2,
      method: HttpMethod.POST,
      body: {
        ...baseBodyValidation,

        list_id: true,
      },
      seed: {
        method: Task2Method.get,
      },
    }),
    download: new SynologyClientEndpoint<SynologyRequest<SynologyTaskListDownloadRequest>, SynologyTaskListDownloadResponse, false>({
      controller: Controller.DownloadStation,
      api: DownloadStation2API.TaskListPolling,
      url: Endpoint.Entry,
      version: Version.v2,
      method: HttpMethod.POST,
      opts: {
        cache: false,
      },
      body: {
        ...baseBodyValidation,

        list_id: true,
        selected: true,
        destination: false,
        create_subfolder: false,
      },
      seed: {
        method: Task2Method.download,
      },
    }),
    delete: new SynologyClientEndpoint<SynologyRequest<SynologyTaskListDeleteRequest>, SynologyTaskListDeleteResponse, false>({
      controller: Controller.DownloadStation,
      api: EntryAPI.request,
      url: Endpoint.Entry,
      version: Version.v1,
      method: HttpMethod.POST,
      opts: {
        cache: false,
      },
      body: {
        ...baseBodyValidation,

        list_id: true,
        mode: true,
        stop_when_error: true,
        compound: true,
      },
      seed: {
        method: EntryMethod.request,

        mode: 'sequential',
        stop_when_error: false,
      },
      transform: params => {
        params.compound = JSON.stringify([
          {
            api: DownloadStation2API.TaskList,
            method: Task2Method.delete,
            version: Version.v2,
            list_id: params.list_id,
          },
        ]);
        return params;
      },
    }),
    stop: new SynologyClientEndpoint<SynologyRequest<{ id: string | string[] }>, SynologyTaskCompleteResponse, false>({
      controller: Controller.DownloadStation,
      api: DownloadStation2API.TaskComplete,
      url: Endpoint.Entry,
      version: Version.v1,
      method: HttpMethod.POST,
      opts: {
        cache: false,
      },
      body: {
        ...baseBodyValidation,

        id: true,
      },
      seed: {
        method: Task2Method.start,
      },
      transform: params => (Array.isArray(params.id) ? params : { id: [params.id] }),
    }),
    edit: new SynologyClientEndpoint<SynologyRequest<SynologyTaskEditRequest>, SynologyCommonResponse[], false>({
      controller: Controller.DownloadStation,
      api: DownloadStation2API.Task,
      url: Endpoint.Entry,
      version: Version.v2,
      method: HttpMethod.POST,
      opts: {
        cache: false,
      },
      body: {
        ...baseBodyValidation,

        id: true,
        destination: false,
      },
      seed: {
        method: Task2Method.edit,
      },
    }),
    bt: {
      get: new SynologyClientEndpoint<SynologyRequest<{ task_id: string }>, SynologyTaskBtResponse>({
        controller: Controller.DownloadStation,
        api: DownloadStation2API.TaskBt,
        url: Endpoint.Entry,
        version: Version.v2,
        method: HttpMethod.POST,
        body: {
          ...baseBodyValidation,

          task_id: true,
        },
        seed: {
          method: Task2Method.get,
        },
      }),
      edit: new SynologyClientEndpoint<SynologyRequest<SynologyTaskBtEditRequest>, SynologyCommonResponse[], false>({
        controller: Controller.DownloadStation,
        api: DownloadStation2API.TaskBt,
        url: Endpoint.Entry,
        version: Version.v2,
        method: HttpMethod.POST,
        opts: {
          cache: false,
        },
        body: {
          ...baseBodyValidation,

          task_id: true,

          destination: false,
          priority: false,
          max_peers: false,
          max_download_rate: false,
          max_upload_rate: false,
          seeding_ratio: false,
          seeding_interval: false,
          'ext-comp-1522': false,
        },
        seed: {
          method: Task2Method.set,
        },
      }),
      files: {
        list: new SynologyClientEndpoint<SynologyRequest<SynologyTaskListFilesRequest>, SynologyTaskListFilesResponse>({
          controller: Controller.DownloadStation,
          api: DownloadStation2API.TaskBtFile,
          url: Endpoint.Entry,
          version: Version.v2,
          method: HttpMethod.POST,
          body: {
            ...baseBodyValidation,
            ...basePaginationValidation,

            task_id: true,
            order_by: false,
            order: false,
            query: false,
          },
          seed: {
            method: Task2Method.list,

            offset: 0,
            limit: 100,

            order_by: TaskListFilesOrderBy.name,
            order: Order.ASC,
          },
        }),
        edit: new SynologyClientEndpoint<SynologyRequest<SynologyTaskFileEditRequest>, SynologyCommonResponse[], false>({
          controller: Controller.DownloadStation,
          api: DownloadStation2API.TaskBtFile,
          url: Endpoint.Entry,
          version: Version.v2,
          method: HttpMethod.POST,
          body: {
            ...baseBodyValidation,

            task_id: true,
            index: true,
            wanted: false,
            priority: false,
          },
          seed: {
            method: Task2Method.set,
          },
        }),
      },
    },
  },
};
