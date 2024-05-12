import type { Task, TaskComplete } from '~/models/synology-task.model';

import { computeProgress, formatTime } from '~/utils/format.utils';

export interface ParsedTask extends Task {
  folder?: string;
  progress?: number;
  speed?: number;
  received?: number;
  eta?: string;
  createdAt?: number;
  finishedAt?: number;
  stopping?: boolean;
}

const computeEta = (task: Task): string | undefined => {
  const downloaded = Number(task.additional?.transfer?.size_downloaded);
  const speed = Number(task.additional?.transfer?.speed_download);
  if (downloaded && Number.isFinite(downloaded) && speed && Number.isFinite(speed)) {
    const secondsRemaining = Math.round((task.size - downloaded) / speed);
    return Number.isFinite(secondsRemaining) ? formatTime(secondsRemaining) : undefined;
  }
  return undefined;
};

export const mapToTask = (task: Task, stoppingIds: TaskComplete['taskId'][] = []): ParsedTask => {
  const folder = task.additional?.detail?.destination ?? undefined;
  const received = task.additional?.transfer?.size_downloaded ?? 0;
  const speed = task.additional?.transfer?.speed_download ?? undefined;
  const created = task.additional?.detail?.create_time ?? 0;
  const finished = task.additional?.detail?.completed_time ?? 0;
  return {
    ...task,
    folder,
    progress: computeProgress(received, task.size),
    speed,
    received: Number(received ?? 0),
    eta: computeEta(task),
    createdAt: created ? new Date(created * 1000).getTime() : undefined,
    finishedAt: finished ? new Date(finished * 1000).getTime() : undefined,
    stopping: stoppingIds?.includes(task.id),
  };
};
