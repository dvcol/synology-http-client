import { ClientEndpoint } from '@dvcol/base-http-client';

import type {
  BaseOptions,
  BaseQuery,
  BaseRequest,
  BaseSettings,
  BaseTemplate,
  BaseTemplateOptions,
  ResponseOrTypedResponse,
} from '@dvcol/base-http-client';
import type { RecursiveRecord } from '@dvcol/common-utils/common/models';
import type { HttpError } from '~/models/http-response.model';

import type { Api, SynologyMethod, Version } from '~/models/synology.model';

import { Controller } from '~/models/synology.model';

export type SynologyClientSettings = BaseSettings<{
  /** The client name */
  name: string;
  /** To inject session id (_sid) in query or body */
  sid: boolean;
  /** To inject csrd token (SynoToken) in query or body */
  token: boolean;
}>;

/**
 * @see [documentation]{@link https://global.download.synology.com/download/Document/Software/DeveloperGuide/Os/DSM/All/enu/DSM_Login_Web_API_Guide_enu.pdf}
 */
export type SynologyClientAuthentication = {
  /** An optional session id if cookies are not used (sets _sid in query or body) */
  sid?: string;
  /** An optional token (SynoToken) if the server enables Improve protection against cross-site request forgery attacks */
  token?: string;
};

export type SynologyApiParam = SynologyRequest<RecursiveRecord>;

type BaseSynologyRequest = {
  /** The endpoint api path */
  api?: Api;
  /** The api version */
  version?: Version;
  /** The api method */
  method?: SynologyMethod;
  /** The server origin if it differs from the default */
  baseUrl?: string;
};

export type SynologyRequest<T extends RecursiveRecord = Record<string, never>> =
  T extends Record<string, never> ? BaseSynologyRequest : BaseSynologyRequest & T;

export type SynologyPaginationRequest<T = Record<string, never>> = T & {
  /** Specify how many shared folders are skipped before beginning to return listed shared folders. Defaults to 0. */
  offset?: number;
  /** Number of shared folders requested. 0 lists all shared folders. Defaults to 0. */
  limit?: number;
};

export type SynologyErrorPayload = {
  code: number;
  errors?: any[];
};

export type SynologyApiErrorPayload = {
  success: false;
  error: HttpError;
};

export type SynologyApiSuccessPayload<T> = {
  success: boolean;
  data: T;
};

export const isSynologyApiErrorPayload = (response: SynologyApiResolvedPayload): response is SynologyApiErrorPayload => !response.success;

export type SynologyApiResolvedPayload<T = unknown> = SynologyApiSuccessPayload<T> | SynologyApiErrorPayload;

export type SynologyApiRawResponse<T = unknown> = ResponseOrTypedResponse<SynologyApiResolvedPayload<T>>;

/**
 * @throws {SynologyError} If the response is not successful
 */
export type SynologyApiResponse<T = unknown> = ResponseOrTypedResponse<T>;

export type SynologyClientOptions = BaseOptions<SynologyClientSettings, SynologyApiResponse>;

export type SynologyApiQuery<T = unknown> = BaseQuery<BaseRequest, T>;

export type SynologyApiTemplateOptions<T extends string | number | symbol = string> = BaseTemplateOptions<T>;

export type SynologyApiTemplate<Parameter extends SynologyApiParam = SynologyApiParam> = BaseTemplate<
  Parameter,
  SynologyApiTemplateOptions<keyof Parameter>
> & {
  controller: Controller;
  version: Version;
  api: Api;
};

export interface SynologyClientEndpoint<Parameter extends SynologyApiParam = SynologyApiParam, Response = unknown> {
  (param?: Parameter, init?: BodyInit): Promise<SynologyApiResponse<Response>>;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class SynologyClientEndpoint<
  Parameter extends SynologyApiParam = SynologyApiParam,
  Response = unknown,
  Cache extends boolean = false,
> extends ClientEndpoint<Parameter, Response, Cache, SynologyApiTemplateOptions<keyof Parameter>> {
  constructor(template: SynologyApiTemplate<Parameter>) {
    template.url = `${template.controller ?? Controller.Common}/${template.url}`;
    super(template);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a recursive type
export type ISynologyApi<Parameter extends SynologyApiParam = any, Response = unknown, Cache extends boolean = boolean> = {
  [key: string]: SynologyClientEndpoint<Parameter, Response, Cache> | ISynologyApi<Parameter>;
};
