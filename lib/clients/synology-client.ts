import type { LoginRequest } from '~/models';
import type { ISynologyApi, SynologyClientAuthentication, SynologyClientOptions } from '~/models/synology-client.model';

import { minimalSynologyApi } from '~/api/synology-api-minimal.endpoint';
import { BaseSynologyClient } from '~/clients/base-synology-client';

/**
 * SynologyClient is a wrapper around the SynologyApi to provide basic authentication and state management.
 *
 * @class SynologyClient
 *
 * @extends {BaseSynologyClient}
 */
export class SynologyClient extends BaseSynologyClient {
  /**
   * Creates an instance of SynologyClient, with the necessary endpoints and settings.
   * @param settings - The settings for the client.
   * @param authentication - The authentication for the client.
   * @param api - The API endpoints for the client.
   */
  constructor(settings: SynologyClientOptions, authentication: SynologyClientAuthentication = {}, api: ISynologyApi = minimalSynologyApi) {
    super(settings, authentication, api);
  }

  setBaseUrl(baseUrl: string) {
    this.settings.endpoint = baseUrl;
  }

  importAuth(auth: SynologyClientAuthentication = {}) {
    this.updateAuth(auth);
  }

  async login(request: LoginRequest) {
    const result = await this.authentication.login(request);
    return result.json();
  }

  async logout(session?: string) {
    return this.authentication.logout({ session });
  }
}
