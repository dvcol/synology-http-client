import type { SynologyPaginationRequest } from '~/models/synology-client.model';

import type { Api, Order, SynologyMethod } from '~/models/synology.model';

/**
 * Note: When setting a limit, “-1” means to list all tasks.
 * Default to “-1”
 *
 * @link [documentation]{@link https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/DownloadStation/All/enu/Synology_Download_Station_Web_API.pdf}
 */
export type SynologyTaskListRequest = SynologyPaginationRequest<{
  /** Additional requested info, separated by ",". When an additional option is requested, objects will be provided in the specified additional option. */
  additional?: SynologyTaskListOption[];
}>;

export type SynologyTaskCreateRequestV1 = {
  /** required, empty string means default folder */
  uri?: string | string[];
  file?: string | string[];

  username?: string;
  password?: string;

  unzip?: string;
  destination?: string;
};

export type SynologyTaskCommonRequest = {
  id: string | string[];
};

export type SynologyTaskDeleteRequestV1 = SynologyTaskCommonRequest & {
  force_complete?: boolean;
};

export type SynologyTaskBtResponse = {
  extract_password: string;
  is_active_torrent: boolean;

  priority: SynologyTaskPriority;

  destination: string;

  max_peers: number;
  max_download_rate: number;
  max_upload_rate: number;

  seeding_interval: number;
  seeding_ratio: number;
};

export type SynologyTaskEditRequest = SynologyTaskCommonRequest & {
  destination?: string;
};

export type SynologyTaskBtEditRequest = {
  task_id: string;

  destination?: string;

  priority?: SynologyTaskPriority;

  max_peers?: number;
  max_download_rate?: number;
  max_upload_rate?: number;

  seeding_ratio?: number;
  seeding_interval?: number;

  'ext-comp-1522'?: string;
};

export type SynologyTaskFileEditRequest = {
  task_id: string;
  index: number[];
  wanted?: boolean;
  priority?: SynologyTaskPriority;
};

export type SynologyTaskCompleteResponse = {
  /** id fo the task end process (e.g. "dev/SYNODLTaskEnd640A245D84136759") */
  task_id: string;
};

export enum SynologyTaskCreateType {
  url = 'url',
  file = 'file',
}

export type SynologyTaskCreateRequest = {
  type: SynologyTaskCreateType;

  /** required, empty string means default folder */
  destination: string;
  username?: string;
  password?: string;
  extract_password?: string;
  url?: string | string[];

  file?: string | string[];
  /** epoch timestamp */
  mtime?: number;
  size?: number;
  torrent?: Blob;
  /** to prompt for file selection after creation or not */
  create_list: boolean;
};

export type SynologyTaskCreateResponse = {
  list_id: string[];
  task_id: string[];
};

export type SynologyTaskListFile = {
  index: number;
  name: string;
  size: number;
};

export type SynologyTaskListResponse = {
  size: number;
  title: string;
  type: SynologyTaskType;
  files: SynologyTaskListFile[];
};

export type SynologyTaskListDownloadRequest = {
  list_id: string;
  selected: number[];
  destination?: string;
  create_subfolder?: boolean;
};

export type SynologyTaskListDownloadResponse = {
  /** id fo the task create process (e.g. "dev/SYNODLTaskListDownload640BB11B252329B4") */
  task_id: string;
};

export type SynologyTaskListDeleteRequestCompound = {
  api: Api;
  method: SynologyMethod;
  version: string;
  list_id: string;
};

export type SynologyTaskListDeleteRequest = {
  list_id: string;
  stop_when_error?: boolean;
  mode?: 'sequential';
  compound?: string | SynologyTaskListDeleteRequestCompound[];
};

export type SynologyTaskListDeleteResponseResult = {
  api: Api;
  method: SynologyMethod;
  version: string;
  success: true;
};

export type SynologyTaskListDeleteResponse = {
  has_fail: boolean;
  result: SynologyTaskListDeleteResponseResult[];
};

export enum SynologyTaskQuerySortBy {
  filename = 'filename',
  total_size = 'total_size',
  current_size = 'current_size',
  progress = 'progress',
  upload_rate = 'upload_rate',
  current_rate = 'current_rate',
  status = 'status',
  destination = 'destination',
}

export type SynologyTaskQueryRequest = {
  sort_by: SynologyTaskQuerySortBy;
};

export enum TaskListFilesOrderBy {
  name = 'name',
  size = 'size',
  size_downloaded = 'size_downloaded',
  progress = 'progress',
  priority = 'priority',
}

export type SynologyTaskListFilesRequest = SynologyPaginationRequest<{
  task_id: string;
  order_by?: TaskListFilesOrderBy;
  order?: Order;
  query?: string;
}>;

export type SynologyTaskListFilesResponse = {
  items: SynologyTaskFile[];
};

export type SynologyTaskList = {
  total: number;
  offset: number;
  tasks: SynologyTask[];
};

/**
 * Task object for Synology Download Station
 */
export type SynologyTask = {
  id: string;
  type: SynologyTaskType;
  username: string;
  title: string;
  /** Task size in bytes */
  size: number;
  status: SynologyTaskStatus;
  status_extra?: SynologyTaskStatusExtra;
  additional?: SynologyTaskAdditional;
  stopping?: boolean;
};

export type SynologyTaskComplete = {
  id: string;
  taskId: string;
};

/**
 * Possible protocol type
 */
export enum SynologyTaskType {
  bt = 'bt',
  nzb = 'nzb',
  http = 'http',
  https = 'https',
  ftp = 'ftp',
  eMule = 'eMule',
}

/**
 * Enumeration for possible task status
 */
export enum SynologyTaskStatus {
  downloading = 'downloading',
  paused = 'paused',
  error = 'error',
  seeding = 'seeding',
  waiting = 'waiting',
  extracting = 'extracting',
  finishing = 'finishing',
  finished = 'finished',
  hash_checking = 'hash_checking',
  filehosting_waiting = 'filehosting_waiting',
}

/**
 * Status_Extra object which provides extra information about task status.
 */
export type SynologyTaskStatusExtra = {
  /** for more details
   * see: https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/DownloadStation/All/enu/Synology_Download_Station_Web_API.pdf
   */
  error_detail: string;
  /** Available when status=extracting, ranging from 0 to 100 */
  unzip_progress: number;
};

export type SynologyTaskAdditional = {
  detail: SynologyTaskDetail;
  transfer: SynologyTaskTransfer;
  file?: SynologyTaskFile[];
  tracker?: SynologyTaskTracker;
  peer?: SynologyTaskPeer;
};

export enum SynologyTaskListOption {
  detail = 'detail',
  transfer = 'transfer',
  file = 'file',
  tracker = 'tracker',
  peer = 'peer',
}

export enum SynologyTaskPriority {
  low = 'low',
  normal = 'normal',
  high = 'high',
}

export type SynologyTaskDetail = {
  destination: string;
  /** Task uri: HTTP/FTP/BT/Magnet/ED2K links */
  uri: string;
  unzip_password: string;
  create_time: number;
  started_time: number;
  completed_time: number;
  priority: SynologyTaskPriority;
  total_peers: number;
  total_pieces: number;
  connected_seeders: number;
  connected_leechers: number;
  connected_peers: number;
  seedelapsed: number;
  waiting_seconds: number;
};

export type SynologyTaskTransfer = {
  downloaded_pieces: number;
  /** Task downloaded size in bytes */
  size_downloaded: string | number;
  /** Task uploaded size in bytes */
  size_uploaded: string | number;
  /** Task download speed: byte/s */
  speed_download: number;
  /** Task upload speed: byte/s */
  speed_upload: number;
};

export type SynologyTaskFile = {
  index: number;
  /** File name for Task v2 */
  name?: string;
  /** File name for Task v1 */
  filename?: string;
  priority: SynologyTaskPriority | 'skip';
  /** File size in bytes */
  size: string;
  /** Task download speed: byte/s */
  size_downloaded: string;
  wanted: boolean;
};

export type SynologyTaskTracker = {
  url: string;
  status: string;
  update_timer: number;
  seeds: number;
  peers: number;
};

export type SynologyTaskPeer = {
  address: string;
  /** Peer client name */
  agent: string;
  progress: number;
  /** Task download speed: byte/s */
  speed_download: number;
  /** Task upload speed: byte/s */
  speed_upload: number;
};
