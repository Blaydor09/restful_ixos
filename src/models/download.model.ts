export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed';

export interface Download {
  id: string;
  userId: string;
  songId: string;
  status: DownloadStatus;
  fileSizeBytes?: number;
  localPath?: string;
  downloadedAt?: Date;
}

export interface CreateDownloadDTO {
  songId: string;
}

export interface UpdateDownloadDTO {
  status?: DownloadStatus;
  fileSizeBytes?: number;
  localPath?: string;
  downloadedAt?: Date;
}
