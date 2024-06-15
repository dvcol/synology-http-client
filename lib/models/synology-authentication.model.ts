export type SynologyLoginRequest = {
  account: string;
  passwd: string;
  baseUrl?: string;
  otp_code?: string;
  enable_device_token?: 'yes' | 'no';
  device_name?: string;
  device_id?: string;

  format?: 'cookie' | 'sid';
  session?: string;
};

export type SynologyLogoutRequest = {
  session?: string;
};

export type SynologyLoginResponse = {
  sid: string;
  did?: string;
  device_id?: string;
  ik_message?: string;
  is_portal_port?: boolean;
  synotoken?: string;
};
