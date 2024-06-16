import { map } from 'rxjs';

import { BaseHttpService } from './base-http.service';

import type { Observable } from 'rxjs';
import type { BaseHttpRequest } from '~/models/base-http-request.model';

import type { HttpHeaders } from '~/models/http-headers.model';

import type { HttpResponse } from '~/models/http-response.model';

import type { SynologySynologyQueryOptions } from '~/models/synology.model';

import { HttpMethod } from '~/models/http-method.model';
import { CustomHeader } from '~/models/http-response.model';
import { SynologyError } from '~/models/synology-error.model';
import { AuthMethod, Controller } from '~/models/synology.model';
import { stringifyParams } from '~/utils/string.utils';

export class SynologyService extends BaseHttpService {
  protected sid?: string;

  constructor(
    protected name = 'SynologyService',
    protected prefix = Controller.Common,
  ) {
    super(prefix);
  }

  setBaseUrl(baseUrl: string, prefix = this.prefix): void {
    super.setBaseUrl(baseUrl + prefix);
  }

  setSid(sid?: string): void {
    this.sid = sid;
  }

  query<T>({ method: httpMethod, params, body: httpBody, version, api, endpoint, base }: SynologySynologyQueryOptions): Observable<HttpResponse<T>> {
    const { method, ..._params } = params ?? {};
    let url: BaseHttpRequest['url'] = endpoint;

    if (base) url = { base: base + this.prefix, path: endpoint };
    if (this.sid && params?.method !== AuthMethod.login) _params._sid = this.sid;

    const _body = httpBody ?? stringifyParams({ api, method, version, ..._params });

    const headers: HttpHeaders = { 'Access-Control-Allow-Origin': '*', [CustomHeader.SynologyDownloadApp]: this.name };
    if (!httpBody) headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

    switch (httpMethod) {
      case HttpMethod.POST:
      case HttpMethod.post:
        return this.post<HttpResponse<T>>(url, _body, undefined, headers);
      case HttpMethod.PUT:
      case HttpMethod.put:
        return this.put<HttpResponse<T>>(url, _body, undefined, headers);
      case HttpMethod.DELETE:
      case HttpMethod.delete:
        return this.delete<HttpResponse<T>>(url, { api, method, version, ..._params }, headers);
      case HttpMethod.GET:
      case HttpMethod.get:
      default:
        return this.get<HttpResponse<T>>(url, { api, method, version, ..._params }, headers);
    }
  }

  do<T>(options: SynologySynologyQueryOptions): Observable<T> {
    return this.query<T>(options).pipe(
      map(response => {
        if (response?.success === true) {
          return response.data;
        }
        if (response?.success === false) {
          throw new SynologyError(options.api, response?.error);
        }
        return response;
      }),
    );
  }
}
