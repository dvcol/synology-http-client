import type { Observable } from 'rxjs';
import type { HttpParameters } from '~/models/http-parameters.model';

import type { SynologyInfoResponse } from '~/models/synology-information.model';

import { SynologyService } from '~/clients/synology.service';
import { HttpMethod } from '~/models/http-method.model';
import { CommonAPI, Endpoint, InfoMethod } from '~/models/synology.model';

export class SynologyInfoService extends SynologyService {
  constructor(protected name: string = 'SynologyInfoService') {
    super(name);
  }

  _do<T>(
    method: HttpMethod,
    params: HttpParameters,
    options: { baseUrl?: string; version?: string; api?: CommonAPI; endpoint?: Endpoint } = {},
  ): Observable<T> {
    const { baseUrl, version, api, endpoint } = {
      version: '1',
      api: CommonAPI.Info,
      endpoint: Endpoint.Query,
      ...options,
    };
    return super.do<T>({ method, params, version, api, endpoint, base: baseUrl });
  }

  info(baseUrl?: string, options: { query?: string[] } = {}): Observable<SynologyInfoResponse> {
    const { query } = { query: ['ALL'], ...options };
    const params: HttpParameters = { method: InfoMethod.query, query: query?.join(',') };
    return this._do<SynologyInfoResponse>(HttpMethod.POST, params, { baseUrl });
  }
}
