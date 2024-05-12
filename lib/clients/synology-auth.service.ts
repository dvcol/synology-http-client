import type { Observable } from 'rxjs';
import type { HttpParameters } from '~/models/http-parameters.model';
import type { LoginRequest, LoginResponse } from '~/models/synology.model';

import { SynologyService } from '~/clients/synology.service';
import { HttpMethod } from '~/models/http-method.model';
import { AuthMethod, CommonAPI, Endpoint, SessionName } from '~/models/synology.model';

type SynologyAuthServiceOptions = { baseUrl?: string; version?: string; api?: CommonAPI; endpoint?: Endpoint };

export class SynologyAuthService extends SynologyService {
  constructor(protected name: string = 'SynologyAuthService') {
    super(name);
  }

  _do<T>(method: HttpMethod, params: HttpParameters, options: SynologyAuthServiceOptions = {}): Observable<T> {
    const { baseUrl, version, api, endpoint } = {
      version: '1',
      api: CommonAPI.Auth,
      endpoint: Endpoint.Auth,
      ...options,
    };
    return super.do<T>({ method, params, version, api, endpoint, base: baseUrl });
  }

  login(
    { account, passwd, baseUrl, otp_code, enable_device_token, device_name, device_id, format }: LoginRequest,
    version = '3',
  ): Observable<LoginResponse> {
    const params: HttpParameters = {
      method: AuthMethod.login,
      session: SessionName.DownloadStation,
      format: format ?? 'cookie',
      account,
      passwd,
    };
    if (otp_code) params.otp_code = otp_code;
    if (enable_device_token) params.enable_device_token = enable_device_token;
    if (device_name) params.device_name = device_name;
    if (device_id) params.device_id = device_id;
    return this._do<LoginResponse>(HttpMethod.POST, params, { baseUrl, version });
  }

  logout(): Observable<void> {
    const params: HttpParameters = { method: AuthMethod.logout, session: SessionName.DownloadStation };
    return this._do<void>(HttpMethod.POST, params);
  }
}
