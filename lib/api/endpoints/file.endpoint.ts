import { HttpMethod } from '@dvcol/common-utils';

import type { SynologyFileStationInfo, SynologyListFileRequest } from '~/models/synology-file.model';
import type {
  FolderList,
  NewFolderList,
  SynologyCreateFolderRequest,
  SynologyListFolderRequest,
  SynologyRenameFolderRequest,
} from '~/models/synology-folder.model';

import { SynologyClientEndpoint, type SynologyRequest } from '~/models/synology-client.model';
import { Controller, Endpoint, FileMethod, FileStationAPI, Version } from '~/models/synology.model';
import { baseBodyValidation, basePaginationValidation } from '~/utils/endpoint.utils';

/**
 * @link [documentation]{@link https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/FileStation/All/enu/Synology_File_Station_API_Guide.pdf}
 */
export const file = {
  file: {
    list: new SynologyClientEndpoint<SynologyRequest<SynologyListFileRequest>, FileList>({
      controller: Controller.Common,
      api: FileStationAPI.List,
      url: Endpoint.Entry,
      version: Version.v2,
      method: HttpMethod.POST,
      body: {
        ...baseBodyValidation,
        ...basePaginationValidation,

        folder_path: true,
        filetype: false,
        additional: false,
        sort_by: false,
        sort_direction: false,
        pattern: false,
        goto_path: false,
      },
      seed: {
        method: FileMethod.list,
      },
    }),
  },
  folder: {
    list: new SynologyClientEndpoint<SynologyRequest<SynologyListFolderRequest>, FolderList>({
      controller: Controller.Common,
      api: FileStationAPI.List,
      url: Endpoint.Entry,
      version: Version.v2,
      method: HttpMethod.POST,
      body: {
        ...baseBodyValidation,
        ...basePaginationValidation,

        onlywritable: false,
        sort_by: false,
        sort_direction: false,
        additional: false,
      },
      seed: {
        method: FileMethod.listShare,
      },
    }),
    create: new SynologyClientEndpoint<SynologyRequest<SynologyCreateFolderRequest>, NewFolderList, false>({
      controller: Controller.Common,
      api: FileStationAPI.CreateFolder,
      url: Endpoint.Entry,
      version: Version.v2,
      method: HttpMethod.POST,
      opts: {
        cache: false,
      },
      body: {
        ...baseBodyValidation,

        folder_path: true,
        name: true,
        force_parent: false,
        additional: false,
      },
      seed: {
        method: FileMethod.create,
        force_parent: false,
      },
      transform: param => {
        if (param.folder_path) {
          const folders = (Array.isArray(param.folder_path) ? param.folder_path : [param.folder_path])?.map(folder =>
            folder.charAt(0) === '/' ? folder : `/${folder}`,
          );
          param.folder_path = `["${folders?.join('","')}"]`;
        }
        if (param.name) param.name = `["${Array.isArray(param.name) ? param.name.join('","') : param.name}"]`;
        return param;
      },
    }),
    rename: new SynologyClientEndpoint<SynologyRequest<SynologyRenameFolderRequest>, FileList, false>({
      controller: Controller.Common,
      api: FileStationAPI.Rename,
      url: Endpoint.Entry,
      version: Version.v2,
      method: HttpMethod.POST,
      opts: {
        cache: false,
      },
      body: {
        ...baseBodyValidation,

        path: true,
        name: true,
        search_taskid: false,
        additional: false,
      },
      seed: {
        method: FileMethod.rename,
      },
      transform: param => {
        if (param.path) {
          const folders = (Array.isArray(param.path) ? param.path : [param.path])?.map(folder => (folder.charAt(0) === '/' ? folder : `/${folder}`));
          param.path = `["${folders?.join('","')}"]`;
        }
        if (param.name) param.name = `["${Array.isArray(param.name) ? param.name.join('","') : param.name}"]`;
        return param;
      },
    }),
  },
  info: new SynologyClientEndpoint<SynologyRequest, SynologyFileStationInfo>({
    controller: Controller.Common,
    api: FileStationAPI.Info,
    url: Endpoint.Entry,
    version: Version.v1,
    method: HttpMethod.POST,
    body: baseBodyValidation,
    seed: {
      method: FileMethod.get,
    },
  }),
};
