import { BaseApiHeaders, BaseClient, BaseHeaderContentType, injectCorsProxyPrefix, parseUrl } from '@dvcol/base-http-client';

import { HttpMethod } from '@dvcol/common-utils';

import type { BaseInit, BaseRequest, BaseTransformed } from '@dvcol/base-http-client';

import type { SynologyApi } from '~/api/synology-api.endpoints';

import type {
  ISynologyApi,
  SynologyApiParam,
  SynologyApiQuery,
  SynologyApiResolvedPayload,
  SynologyApiResponse,
  SynologyApiTemplate,
  SynologyClientAuthentication,
  SynologyClientOptions,
  SynologyClientSettings,
} from '~/models/synology-client.model';

import { minimalSynologyApi } from '~/api/synology-api-minimal.endpoint';
import { isSynologyApiErrorPayload } from '~/models/synology-client.model';

import { SynologyError } from '~/models/synology-error.model';
import { AuthMethod } from '~/models/synology.model';
import { CustomHeader } from '~/utils/endpoint.utils';

/** Needed to type Object assignment */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging  -- To allow type extension
export interface BaseSynologyClient extends SynologyApi {}

const parseResponse = (result: SynologyApiResolvedPayload, template: SynologyApiTemplate) => {
  if (isSynologyApiErrorPayload(result)) {
    throw new SynologyError(template.api, result?.error);
  }
  if (result?.success === true) {
    return result.data;
  }
  return result;
};

const patchResponse = <T extends Response>(response: T, template: SynologyApiTemplate): T => {
  const parsed: T = response;
  const _json = parsed.json as T['json'];
  parsed.json = async () =>
    _json
      .bind(parsed)()
      .then((result: SynologyApiResolvedPayload) => parseResponse(result, template));
  return parsed;
};

/**
 * Represents a Synology API client with common functionality.
 *
 * @class BaseSynologyClient
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging  -- To allow type extension
export class BaseSynologyClient
  extends BaseClient<SynologyApiQuery, SynologyApiResponse, SynologyClientSettings, SynologyClientAuthentication>
  implements SynologyApi
{
  /**
   * Creates an instance of BaseSynologyClient.
   * @param options - The options for the client.
   * @param authentication - The authentication for the client.
   * @param api - The API endpoints for the client.
   */
  constructor(options: SynologyClientOptions, authentication: SynologyClientAuthentication = {}, api: ISynologyApi = minimalSynologyApi) {
    super(options, authentication, api);
  }

  /**
   * Transforms the parameters templates or init before performing a request.
   *
   * @protected
   *
   * @template T - The type of the parameters.
   *
   * @param {SynologyApiTemplate<T>} template - The template for the API endpoint.
   * @param {T} params - The actual parameters.
   * @param {BaseInit} [init] - Additional initialization options.
   *
   * @returns {{ template: SynologyApiTemplate<T>; params: T; init: BaseInit }} The transformed template.
   */
  // eslint-disable-next-line class-methods-use-this -- implemented from abstract class
  protected _transform<T extends SynologyApiParam = SynologyApiParam>(
    template: SynologyApiTemplate<T>,
    params: T,
    init?: BaseInit,
  ): BaseTransformed<T> {
    console.info('pre transform params', structuredClone(params));
    if (template?.seed?.method !== AuthMethod.login) {
      if (this.settings.sid && this.auth.sid) {
        params._sid = this.auth.sid;
        if ([HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH].map(String).includes(template.method)) {
          template.body = { ...template.body, _sid: true };
        } else {
          template.opts = {
            ...template.opts,
            parameters: { ...template.opts?.parameters, query: { ...template.opts?.parameters?.query, _sid: true } },
          };
        }
      }

      if (this.settings.token && this.auth.token) {
        params.SynoToken = this.auth.token;
        if ([HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH].map(String).includes(template.method)) {
          template.body = { ...template.body, SynoToken: true };
        } else {
          template.opts = {
            ...template.opts,
            parameters: { ...template.opts?.parameters, query: { ...template.opts?.parameters?.query, SynoToken: true } },
          };
        }
      }
    }

    if (!params?.api) params.api = template.api;
    if (!params?.version) params.version = template.version;

    console.info('post transform params', structuredClone(params));
    return { template, params, init };
  }

  /**
   * Parses the template to construct the headers for a Synology API request.
   *
   * @protected
   *
   * @template T - The type of the parameters.
   **
   * @returns {HeadersInit} The parsed request headers.
   *
   * @throws {Error} Throws an error if auth is required and the access token is missing.
   */
  // eslint-disable-next-line class-methods-use-this -- implemented from abstract class
  protected _parseHeaders<T extends SynologyApiParam = SynologyApiParam>(template: SynologyApiTemplate<T>): HeadersInit {
    const headers: HeadersInit = { 'Access-Control-Allow-Origin': '*' };

    if (template.body) headers[BaseApiHeaders.ContentType] = BaseHeaderContentType.FormUrlEncoded;

    if (this.settings.name) headers[CustomHeader.ClientName] = this.settings.name;

    return headers;
  }

  /**
   * Parses the parameters and constructs the URL for a Synology API request.
   *
   * @protected
   *
   * @template T - The type of the parameters.
   *
   * @param template - The template for the API endpoint.
   * @param {T} params - The parameters for the API call.
   *
   * @returns {string} The URL for the Synology API request.
   *
   * @throws {Error} Throws an error if mandatory parameters are missing or if a filter is not supported.
   */
  protected _parseUrl<T extends SynologyApiParam = SynologyApiParam>(template: SynologyApiTemplate<T>, params: T): URL {
    injectCorsProxyPrefix(template, this.settings);
    return parseUrl(template, params, params?.baseUrl ?? this.settings.endpoint);
  }

  /**
   * Parses the response from the API before returning from the call.
   * @param response - The response from the API.
   * @param request - The request that was made.
   * @param template - The template for the API endpoint.
   *
   * @returns {SynologyApiResponse} The parsed response.
   * @protected
   */
  // eslint-disable-next-line class-methods-use-this -- implemented from abstract class
  protected _parseResponse<T extends SynologyApiParam = SynologyApiParam>(
    response: SynologyApiResponse,
    request: BaseRequest,
    template: SynologyApiTemplate<T>,
  ): SynologyApiResponse {
    if (!response.ok || response.status >= 400) throw response;

    const parsed: SynologyApiResponse = patchResponse(response, template);
    const _clone = parsed.clone;
    parsed.clone = () => patchResponse(_clone.bind(parsed)(), template);
    return response;
  }
}
