import { throwError } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

import type { Observable } from 'rxjs';

import type { BaseHttpRequest } from '~/models/base-http-request.model';
import type { HttpParameters } from '~/models/http-parameters.model';

/**
 * Helper function to build a URL from url and parameters
 * @param url base url
 * @param params optional parameters
 * @see URL
 */
export const buildUrl = (url: BaseHttpRequest['url'], params?: HttpParameters): URL => {
  const builder = new URL(typeof url === 'string' || url instanceof URL ? url : `${url.base}/${url.path}`);
  if (params) {
    Object.entries(params)
      .map(e => ({ key: e[0], value: e[1] }))
      .forEach(({ key, value }) =>
        Array.isArray(value) ? value.forEach(val => builder.searchParams.append(key, val)) : builder.searchParams.append(key, value),
      );
  }
  return builder;
};

/**
 * rxjs helper to build valid URL and doing fetch
 * @param url
 * @param params
 * @param redirect
 * @param init
 */
export const rxFetch = <T>({ url, params, redirect, ...init }: BaseHttpRequest): Observable<T> => {
  let _url: string;
  try {
    _url = buildUrl(url, params).toString();
  } catch (error) {
    console.warn('Failed to build url for ', url, params);
    return throwError(() => error);
  }
  return fromFetch<T>(_url, {
    ...init,
    redirect: redirect ?? 'follow',
    selector: res => res.json(),
  });
};
