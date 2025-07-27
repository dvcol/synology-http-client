import type { SynologyPaginationRequest } from '~/models/synology-client.model';

import type { FolderAcl, FolderOwner, FolderTime } from '~/models/synology-folder.model';

/**
 * Note: When setting a limit, 0 lists all files.
 * Defaults to 0.
 *
 * @link [documentation]{@link https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/FileStation/All/enu/Synology_File_Station_API_Guide.pdf}
 */
export type SynologyListFileRequest = SynologyPaginationRequest<{
  /** A listed folder path starting with a shared folder */
  folder_path: string;
  /**
   * Optional.
   *
   * "file": only enumerate regular files;
   * "dir": only enumerate folders;
   * "all": enumerate regular files and folders.
   */
  filetype?: 'file' | 'dir' | 'all';
  /** Specify which file information to sort on. Defaults to 'name'. */
  sort_by?: FileSortBy;
  /** Specify to sort ascending or to sort descending. Defaults to 'asc'. */
  sort_direction?: 'asc' | 'dsc';
  /**
   * Optional.
   *
   * Given glob pattern(s) to find files whose names and extensions match a case-insensitive glob pattern.
   *
   * Note:
   * 1. If the pattern doesn't contain any glob syntax (? and *), * of glob syntax will be added at begin and end of the string automatically for partially matching the pattern.
   * 2. You can use "," to separate multiple glob patterns.**
   */
  pattern?: string;
  /**
   * Optional.
   *
   * Folder path starting with a shared folder. Return all iles and sub-folders within folder_path path until goto_path path recursively.
   *
   * Note: goto_path is only valid with parameter "additional" contains real_path.
   */
  goto_path?: string;
  /**
   * Additional requested file information separated by a comma "," and surrounded by brackets.
   * When an additional option is requested, response objects will be provided in the specified option fields.
   */
  additional?: FileListOption[];
}>;

export interface FileList {
  total: number;
  offset: number;
  files?: File[];
}

/**
 * Specify which file information to sort on.
 */
export enum FileSortBy {
  name = 'name',
  size = 'size',
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
  /** file extension */
  type = 'type',
}

export interface File {
  isdir: boolean;
  name: string;
  path: string;
  children?: FileList;
  additional?: FileAdditional;
}

export interface FileAdditional {
  real_path?: string;
  size?: number;
  owner?: FolderOwner;
  time?: FolderTime;
  /** File permission information. */
  perm?: FilePermission;
  mount_point_type?: string;
  /** Real path of a shared folder in a volume space. */
  type?: string;
}

export enum FileListOption {
  real_path = 'real_path',
  size = 'size',
  owner = 'owner',
  time = 'time',
  perm = 'perm',
  mount_point_type = 'mount_point_type',
  type = 'type',
}

export interface FilePermission {
  /** POSIX file permission, For example, 777 means owner, group or other has all permission; 764 means owner has all permission, group has read/write permission, other has read permission */
  posix: number;
  /** true : The privilege of the shared folder is set to be ACL-mode. false : The privilege of the shared folder is set to be POSIX-mode.
   */
  is_acl_mode: boolean;
  acl?: FolderAcl;
}

export interface SynologyFileStationInfo {
  enable_list_usergrp: boolean;
  enable_send_email_attachment: boolean;
  enable_view_google: boolean;
  enable_view_microsoft: boolean;
  hostname: string;
  is_manager: boolean;
  items: { gid: number }[];
  support_file_request: boolean;
  support_sharing: boolean;
  support_vfs: boolean;
  support_virtual: {
    enable_iso_mount: boolean;
    enable_remote_mount: boolean;
  };
  support_virtual_protocol: string[];
  system_codepage: string;
  uid: number;
}
