import type { ApiInfo } from '~/models/synology-api-info.model';

export type SynologyInfoRequest = {
  query?: string[] | string;
};

export type SynologyInfoResponse = {
  [key: string]: ApiInfo;
};
