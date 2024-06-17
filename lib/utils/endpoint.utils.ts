import type { SynologyPaginationRequest, SynologyRequest } from '~/models/synology-client.model';

export const baseBodyValidation: Record<keyof SynologyRequest, boolean> = {
  api: true,
  version: true,
  method: true,
  baseUrl: false,
} as const;

export const basePaginationValidation: Record<keyof SynologyPaginationRequest, boolean> = {
  offset: false,
  limit: false,
} as const;

export enum CustomHeader {
  ClientName = 'client-name',
}
