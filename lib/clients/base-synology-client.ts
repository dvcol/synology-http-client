import { BaseApiHeaders, BaseClient, BaseHeaderContentType, injectCorsProxyPrefix, parseBody, parseUrl } from '@dvcol/base-http-client';

import { HttpMethod } from '@dvcol/common-utils';

import type { BaseBody, BaseInit, BaseRequest, BaseTransformed } from '@dvcol/base-http-client';

import type { SynologyApi } from '~/api/synology-api.endpoints';

import type {
  ISynologyApi,
  SynologyApiParam,
  SynologyApiQuery,
  SynologyApiRawResponse,
  SynologyApiResolvedPayload,
  SynologyApiResponse,
  SynologyApiTemplate,
  SynologyClientAuthentication,
  SynologyClientOptions,
  SynologyClientSettings,
} from '~/models/synology-client.model';

import { minimalSynologyApi } from '~/api/synology-api-minimal.endpoint';
import { AuthMethod, CustomHeader, SynologyError } from '~/models';
import { isSynologyApiErrorPayload } from '~/models/synology-client.model';

/** Needed to type Object assignment */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging  -- To allow type extension
export interface BaseSynologyClient extends SynologyApi {}

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
    if (params?.method !== AuthMethod.login) {
      if (this.settings.sid && this.auth.sid) {
        params._sid = this.auth.sid;
        if ([HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH].map(String).includes(template.method)) {
          template.body = { ...template.body, _sid: this.auth.sid };
        } else {
          template.opts = {
            ...template.opts,
            parameters: { ...template.opts?.parameters, query: { ...template.opts?.parameters?.query, _sid: this.auth.sid } },
          };
        }
      }

      if (this.settings.token && this.auth.token) {
        params._synotoken = this.auth.token;
        if ([HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH].map(String).includes(template.method)) {
          template.body = { ...template.body, SynoToken: this.auth.token };
        } else {
          template.opts = {
            ...template.opts,
            parameters: { ...template.opts?.parameters, query: { ...template.opts?.parameters?.query, SynoToken: this.auth.token } },
          };
        }
      }
    }

    if (!params?.api) params.api = template.api;
    if (!params?.version) params.version = template.version;

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
    const headers: HeadersInit = {
      [BaseApiHeaders.Accept]: BaseHeaderContentType.Json,
      [BaseApiHeaders.ContentType]: template.body ? BaseHeaderContentType.FormUrlEncoded : BaseHeaderContentType.Json,
    };

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
   * Parses body from a template and stringifies a {@link BodyInit}
   *
   * @protected
   *
   * @template T - The type of the parameters.
   *
   * @param template - The expected body structure.
   * @param {T} params - The actual parameters.
   *
   * @returns {BodyInit} The parsed request body.
   */
  // eslint-disable-next-line class-methods-use-this -- implemented from abstract class
  protected _parseBody<T extends SynologyApiParam = SynologyApiParam>(template: BaseBody<string | keyof T>, params: T): BodyInit {
    return parseBody(template, params);
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

    const parsed: SynologyApiResponse = response;
    const _oldJson = parsed.json as SynologyApiRawResponse['json'];
    const _newJson = async () => {
      const result: SynologyApiResolvedPayload = await _oldJson.bind(parsed)();
      if (isSynologyApiErrorPayload(result)) {
        throw new SynologyError(template.api, result?.error);
      }
      if (result?.success === true) {
        return result.data;
      }
      return result;
    };
    parsed.json = _newJson as SynologyApiResponse['json'];
    return response;
  }
}
