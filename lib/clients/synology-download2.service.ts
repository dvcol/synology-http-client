import { throwError } from 'rxjs';

import type { Observable } from 'rxjs';
import type {
  SynologyTaskBtEditRequest,
  SynologyTaskCompleteResponse,
  SynologyTaskCreateRequest,
  SynologyTaskCreateResponse,
  SynologyTaskEditRequest,
  SynologyTaskEditResponse,
  SynologyTaskFileEditRequest,
  SynologyTaskListDeleteRequest,
  SynologyTaskListDeleteResponse,
  SynologyTaskListDownloadRequest,
  SynologyTaskListDownloadResponse,
  SynologyTaskListFilesRequest,
  SynologyTaskListFilesResponse,
  SynologyTaskListResponse,
} from '~/models';
import type { HttpParameters } from '~/models/http-parameters.model';
import type { SynologyCommonResponse, SynologySynologyQueryOptions } from '~/models/synology.model';

import { SynologyService } from '~/clients/synology.service';
import { HttpMethod } from '~/models/http-method.model';
import { DownloadStation2API, Endpoint, EntryAPI, EntryMethod, Task2Method } from '~/models/synology.model';

import { buildFormData, stringifyKeys } from '~/utils/string.utils';

export class SynologyDownload2Service extends SynologyService {
  /**
   * Synology uses comma in a non standardized way to delimit array payload in the API.
   * This makes urls containing un-encoded commas though technically non-malformed, invalid for the API.
   *
   * To palliate this, we substitute comma with it's unicode equivalent before encoding parameters
   *
   * @param url the url to sanitize
   * @private
   *
   * @see https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/DownloadStation/All/enu/Synology_Download_Station_Web_API.pdf
   */
  private static _sanitizeUrl(url: string): URL {
    return new URL(url.toString().replace(/,/g, '%2C'));
  }

  constructor(name = 'SynologyDownloadService2') {
    super(name);
  }

  _do<T>({ method, params, body, version, api, endpoint, base }: Partial<SynologySynologyQueryOptions> & { method: HttpMethod }): Observable<T> {
    return super.do<T>({
      api: api ?? DownloadStation2API.Task,
      method,
      version: version ?? '1',
      body,
      params,
      endpoint: endpoint ?? Endpoint.Entry,
      base,
    });
  }

  createTask(request: SynologyTaskCreateRequest): Observable<SynologyTaskCreateResponse> {
    try {
      const { url, file, torrent, ..._request } = request;
      const params: HttpParameters = stringifyKeys(_request, true);
      if (url?.length) params.url = JSON.stringify(url?.map(_url => SynologyDownload2Service._sanitizeUrl(_url).toString()));

      const options: SynologySynologyQueryOptions = {
        api: DownloadStation2API.Task,
        method: HttpMethod.POST,
        version: '2',
        endpoint: Endpoint.Entry,
      };
      if (torrent) {
        options.body = buildFormData({
          api: DownloadStation2API.Task,
          method: Task2Method.create,
          version: '2',
          ...params,
          torrent,
          mtime: Date.now()?.toString(),
          size: torrent.size?.toString(),
          file: JSON.stringify(['torrent']),
        });
      } else {
        options.params = {
          method: Task2Method.create,
          ...params,
        };
      }

      return this._do<SynologyTaskCreateResponse>(options);
    } catch (error) {
      return throwError(error);
    }
  }

  getTaskFiles(request: SynologyTaskListFilesRequest): Observable<SynologyTaskListFilesResponse> {
    return this._do<SynologyTaskListFilesResponse>({
      api: DownloadStation2API.TaskBtFile,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.list,
        ...stringifyKeys(request),
      },
    });
  }

  getTaskList(list_id: string): Observable<SynologyTaskListResponse> {
    return this._do<SynologyTaskListResponse>({
      api: DownloadStation2API.TaskList,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.get,
        list_id,
      },
    });
  }

  setTaskListDownload(request: SynologyTaskListDownloadRequest): Observable<SynologyTaskListDownloadResponse> {
    return this._do<SynologyTaskListDownloadResponse>({
      api: DownloadStation2API.TaskListPolling,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.download,
        ...stringifyKeys(request),
      },
    });
  }

  deleteTaskList(list_id: string): Observable<SynologyTaskListDeleteResponse> {
    const request: SynologyTaskListDeleteRequest = {
      mode: 'sequential',
      stop_when_error: false,
      compound: [
        {
          api: DownloadStation2API.TaskList,
          method: Task2Method.delete,
          version: '2',
          list_id,
        },
      ],
    };
    return this._do<SynologyTaskListDeleteResponse>({
      api: EntryAPI.request,
      method: HttpMethod.POST,
      version: '1',
      params: {
        method: EntryMethod.request,
        ...stringifyKeys(request),
        compound: JSON.stringify(request.compound),
      },
    });
  }

  stopTask(id: string | string[]): Observable<SynologyTaskCompleteResponse> {
    return this._do<SynologyTaskCompleteResponse>({
      api: DownloadStation2API.TaskComplete,
      method: HttpMethod.POST,
      version: '1',
      params: {
        method: Task2Method.start,
        id: Array.isArray(id) ? id : [id],
      },
    });
  }

  getTaskEdit(task_id: string): Observable<SynologyTaskEditResponse> {
    return this._do<SynologyTaskEditResponse>({
      api: DownloadStation2API.TaskBt,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.get,
        task_id,
      },
    });
  }

  editTask(request: SynologyTaskEditRequest): Observable<SynologyCommonResponse[]> {
    return this._do<SynologyCommonResponse[]>({
      api: DownloadStation2API.Task,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.edit,
        ...stringifyKeys(request),
      },
    });
  }

  editTaskBt(request: SynologyTaskBtEditRequest): Observable<SynologyCommonResponse[]> {
    return this._do<SynologyCommonResponse[]>({
      api: DownloadStation2API.TaskBt,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.set,
        ...stringifyKeys(request),
      },
    });
  }

  editFile(request: SynologyTaskFileEditRequest): Observable<SynologyCommonResponse[]> {
    return this._do<SynologyCommonResponse[]>({
      api: DownloadStation2API.TaskBtFile,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.set,
        ...stringifyKeys(request),
      },
    });
  }
}
