import type { HttpBody } from '~/models/http-body.model';
import type { HttpHeaders } from '~/models/http-headers.model';
import type { HttpMethod } from '~/models/http-method.model';
import type { HttpParameters } from '~/models/http-parameters.model';

/** Base Http request interface */
export interface BaseHttpRequest extends RequestInit {
  url: string | URL | { path: string | URL; base: string | URL };
  params?: HttpParameters;
  method?: HttpMethod;
  headers?: HttpHeaders;
  body?: HttpBody;
  redirect?: RequestRedirect;
}
