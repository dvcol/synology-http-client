import { authentication } from '~/api/endpoints/authentication.endpoint';
import { download } from '~/api/endpoints/download.endpoint';
import { download2 } from '~/api/endpoints/download2.endpoint';
import { file } from '~/api/endpoints/file.endpoint';
import { information } from '~/api/endpoints/information.endpoint';

export const synologyApi = {
  authentication,
  download,
  download2,
  file,
  information,
};

export type SynologyApi = typeof synologyApi;
