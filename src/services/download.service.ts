import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import {
  Download,
  CreateDownloadDTO,
  UpdateDownloadDTO,
  DownloadStatus,
} from '../models/download.model';

export class DownloadService {
  async getDownloads(userId: string, limit: number = 50, offset: number = 0): Promise<Download[]> {
    const result = await pool.query(
      `SELECT id, user_id AS "userId", song_id AS "songId", status,
              file_size_bytes AS "fileSizeBytes", local_path AS "localPath",
              downloaded_at AS "downloadedAt"
       FROM downloads
       WHERE user_id = $1
       ORDER BY downloaded_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  async getDownloadById(id: string): Promise<Download> {
    const result = await pool.query(
      `SELECT id, user_id AS "userId", song_id AS "songId", status,
              file_size_bytes AS "fileSizeBytes", local_path AS "localPath",
              downloaded_at AS "downloadedAt"
       FROM downloads
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Download not found');
    }

    return result.rows[0];
  }

  async isDownloaded(userId: string, songId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM downloads
       WHERE user_id = $1 AND song_id = $2 AND status = 'completed'`,
      [userId, songId]
    );
    return result.rows.length > 0;
  }

  async createDownload(userId: string, data: CreateDownloadDTO): Promise<Download> {
    const result = await pool.query(
      `INSERT INTO downloads (user_id, song_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (user_id, song_id) DO UPDATE
       SET status = 'pending'
       RETURNING id, user_id AS "userId", song_id AS "songId", status,
                 file_size_bytes AS "fileSizeBytes", local_path AS "localPath",
                 downloaded_at AS "downloadedAt"`,
      [userId, data.songId]
    );

    return result.rows[0];
  }

  async updateDownload(id: string, data: UpdateDownloadDTO): Promise<Download> {
    const download = await this.getDownloadById(id);

    let downloadedAt = download.downloadedAt;
    if (data.status === 'completed' && download.status !== 'completed') {
      downloadedAt = new Date();
    }

    const result = await pool.query(
      `UPDATE downloads
       SET status = $1, file_size_bytes = $2, local_path = $3, downloaded_at = $4
       WHERE id = $5
       RETURNING id, user_id AS "userId", song_id AS "songId", status,
                 file_size_bytes AS "fileSizeBytes", local_path AS "localPath",
                 downloaded_at AS "downloadedAt"`,
      [
        data.status ?? download.status,
        data.fileSizeBytes ?? download.fileSizeBytes,
        data.localPath ?? download.localPath,
        downloadedAt,
        id,
      ]
    );

    return result.rows[0];
  }

  async deleteDownload(id: string): Promise<void> {
    await this.getDownloadById(id);
    await pool.query('DELETE FROM downloads WHERE id = $1', [id]);
  }

  async getDownloadsByStatus(userId: string, status: DownloadStatus): Promise<Download[]> {
    const result = await pool.query(
      `SELECT id, user_id AS "userId", song_id AS "songId", status,
              file_size_bytes AS "fileSizeBytes", local_path AS "localPath",
              downloaded_at AS "downloadedAt"
       FROM downloads
       WHERE user_id = $1 AND status = $2
       ORDER BY downloaded_at DESC`,
      [userId, status]
    );
    return result.rows;
  }
}

export const downloadService = new DownloadService();
