import type { SynologyPaginationRequest } from '~/models/synology-client.model';
import type { File, FileListOption } from '~/models/synology-file.model';

/**
 * Note: When setting a limit, 0 lists all shared folders.
 * Defaults to 0.
 *
 * @link [documentation]{@link https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/FileStation/All/enu/Synology_File_Station_API_Guide.pdf}
 */
export type SynologyListFolderRequest = SynologyPaginationRequest<{
  /**
   * - true : List writable shared folders.
   * - false : List writable and read-only shared folders
   */
  onlywritable?: boolean;
  /** Specify which file information to sort on. Defaults to 'name'. */
  sort_by?: FolderSortBy;
  /** Specify to sort ascending or to sort descending. Defaults to 'asc'. */
  sort_direction?: 'asc' | 'dsc';
  /**
   * Additional requested file information separated by a comma "," and surrounded by brackets.
   * When an additional option is requested, response objects will be provided in dedicated option fields.
   */
  additional?: FolderListOption[];
}>;

export type SynologyCreateFolderRequest = {
  /**
   * One or more shared folder paths, separated by commas and around brackets.
   * If force_parent is "true," and folder_path does not exist, the folder_path will be created.
   * If force_parent is "false," folder_path must exist or a false value will be returned.
   * The number of paths must be the same as the number of names in the name parameter.
   * The first folder_path parameter corresponds to the first name parameter
   */
  folder_path: string | string[];
  /**
   * One or more new folder names, separated by commas "," and around brackets.
   * The number of names must be the same as the number of folder paths in the folder_path parameter.
   * The first name parameter corresponding to the first folder_path parameter.
   */
  name: string | string[];
  /**
   * Optional.
   * - true : no error occurs if a folder exists and create parent folders as needed.
   * - false : parent folders are not created.
   */
  force_parent?: boolean;
  /**
   * Additional requested file information separated by a comma "," and surrounded by brackets.
   * When an additional option is requested, response objects will be provided in dedicated option fields.
   */
  additional?: FileListOption[];
};

// @param path  One or more paths of files/folders to be renamed, separated by commas "," and around brackets.
//   The number of paths must be the same as the number of names in the name parameter.
//   The first path parameter corresponds to the first name parameter.
//   @param name  One or more new names, separated by commas "," and around brackets.
//   The number of names must be the same as the number of folder paths in the path parameter.
//   The first name parameter corresponding to the first path parameter.
//   @param search_taskid Optional.
//   A unique ID for the search task which is obtained from start method.
//   It is used to update the renamed file in the search result.
//   @param additional
export type SynologyRenameFolderRequest = {
  /**
   * One or more paths of files/folders to be renamed, separated by commas "," and around brackets.
   * The number of paths must be the same as the number of names in the name parameter.
   * The first path parameter corresponds to the first name parameter.
   */
  path: string | string[];
  /**
   * One or more new names, separated by commas "," and around brackets.
   * The number of names must be the same as the number of folder paths in the path parameter.
   * The first name parameter corresponding to the first path parameter.
   */
  name: string | string[];
  /**
   * A unique ID for the search task which is obtained from start method.
   * It is used to update the renamed file in the search result.
   */
  search_taskid?: string;
  /**
   * Additional requested file information separated by a comma "," and surrounded by brackets.
   * When an additional option is requested, response objects will be provided in dedicated option fields.
   */
  additional?: FileListOption[];
};

export interface FolderList {
  total: number;
  offset: number;
  shares?: Folder[];
}

export interface NewFolderList {
  folders?: File[];
}

/**
 * Specify which file information to sort on.
 */
export enum FolderSortBy {
  name = 'name',
  user = 'user',
  group = 'group',
  /** Last modified time */
  mtime = 'mtime',
  /** Last access time */
  atime = 'atime',
  /** Last change time */
  ctime = 'ctime',
  /** Creation time */
  crtime = 'crtime',
  /** POSIX permission */
  posix = 'posix',
}

export interface Folder {
  isdir: boolean;
  name: string;
  path: string;
  additional?: FolderAdditional;
}

export interface FolderAdditional {
  real_path: string;
  owner?: FolderOwner;
  /** Real path of a shared folder in a volume space. */
  time?: FolderTime;
  /** Folder permission information. */
  perm?: FolderPermission;
  mount_point_type: string;
  volume_status?: FolderVolumeStatus;
}

export enum FolderListOption {
  real_path = 'real_path',
  owner = 'owner',
  time = 'time',
  perm = 'perm',
  mount_point_type = 'mount_point_type',
  volume_status = 'volume_status',
}

export interface FolderOwner {
  /** File GID. */
  gid: number;
  /** Group name of file group. */
  group: string;
  /** File UID. */
  uid: number;
  /** User name of file owner. */
  user: string;
}

/**
 * Note: Linux timestamp in second, defined as the number of seconds that have elapsed since 00:00:00.
 * Coordinated Universal Time (UTC), Thursday, 1 January 1970.
 */
export interface FolderTime {
  /** Last access time */
  atime: number;
  /** Last modified time */
  mtime: number;
  /** Last change time */
  ctime: number;
  /** Creation time */
  crtime: number;
}

export enum FolderRight {
  /** "RW": The shared folder is writable */
  RW = 'RW',
  /** "RO": the shared folder is read-only. */
  RO = 'RO',
}

export interface FolderPermission {
  share_right: FolderRight;
  /** POSIX file permission, For example, 777 means owner, group or other has all permission; 764 means owner has all permission, group has read/write permission, other has read permission */
  posix: number;
  adv_right?: FolderPermissionAdvanced;
  /** If Windows ACL privilege of the shared folder is enabled or not. */
  acl_enabled: boolean;
  /** true : The privilege of the shared folder is set to be ACL-mode. false : The privilege of the shared folder is set to be POSIX-mode.
   */
  is_acl_mode: boolean;
  acl?: FolderAcl;
}

export interface FolderPermissionAdvanced {
  /**  If a non-administrator user can download files in this shared folder through SYNO.FileStation.Download API or not. */
  disable_download: boolean;
  /** If a non-administrator user can enumerate files in this shared folder though SYNO.FileStation.List API with list method or not. */
  disable_list: boolean;
  /** If a non-administrator user can modify or overwrite files in this shared folder or not. */
  disable_modify: boolean;
}

/**
 * Windows ACL privilege. If a shared folder is set to be POSIX-mode, these values of Windows ACL privileges are derived from the POSIX privilege.
 */
export interface FolderAcl {
  /** If a logged-in user has a privilege to append data or create folders within this folder or not. */
  append: boolean;
  /** If a logged-in user has a privilege to delete a file/a folder within this folder or not. */
  del: boolean;
  /** If a logged-in user has a privilege to execute files/traverse folders within this folder or not. */
  exec: boolean;
  /** If a logged-in user has a privilege to read data or list folder within this folder or not. */
  read: boolean;
  /** If a logged-in user has a privilege to write data or create files within this folder or not. */
  write: boolean;
}

export interface FolderVolumeStatus {
  /** Byte size of free space of a volume where a shared folder is located. */
  freespace: number;
  /** Byte size of total space of a volume where a shared folder is located.  */
  totalspace: number;
  /** true : A volume where a shared folder is located is readonly; false : It's writable. */
  readonly: boolean;
}
