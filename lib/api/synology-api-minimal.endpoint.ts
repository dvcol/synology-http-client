import { authentication } from '~/api/endpoints/authentication.endpoint';

export const minimalSynologyApi = {
  authentication,
};

export type MinimalSynologyApi = typeof minimalSynologyApi;
