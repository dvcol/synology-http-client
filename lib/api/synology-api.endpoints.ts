import { authentication } from '~/api/endpoints/authentication.endpoint';

export const synologyApi = {
  authentication,
};

export type SynologyApi = typeof synologyApi;
