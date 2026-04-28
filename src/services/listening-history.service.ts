import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import {
  ListeningHistory,
  CreateListeningHistoryDTO,
} from '../models/listening-history.model';

export class ListeningHistoryService {
  async getHistory(userId: string, limit: number = 100, offset: number = 0): Promise<ListeningHistory[]> {
    const result = await pool.query(
      `SELECT id, user_id AS "userId", song_id AS "songId", mood_id AS "moodId",
              duration_s AS "durationS", completed, listened_at AS "listenedAt"
       FROM listening_history
       WHERE user_id = $1
       ORDER BY listened_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  async getHistoryById(id: string): Promise<ListeningHistory> {
    const result = await pool.query(
      `SELECT id, user_id AS "userId", song_id AS "songId", mood_id AS "moodId",
              duration_s AS "durationS", completed, listened_at AS "listenedAt"
       FROM listening_history
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Listening history record not found');
    }

    return result.rows[0];
  }

  async addToHistory(userId: string, data: CreateListeningHistoryDTO): Promise<ListeningHistory> {
    const result = await pool.query(
      `INSERT INTO listening_history (user_id, song_id, mood_id, duration_s, completed)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id AS "userId", song_id AS "songId", mood_id AS "moodId",
                 duration_s AS "durationS", completed, listened_at AS "listenedAt"`,
      [
        userId,
        data.songId,
        data.moodId || null,
        data.durationS,
        data.completed ?? false,
      ]
    );

    return result.rows[0];
  }

  async getRecentMoods(userId: string, days: number = 7): Promise<any[]> {
    const result = await pool.query(
      `SELECT m.id, m.name, COUNT(*) as frequency
       FROM listening_history lh
       JOIN moods m ON m.id = lh.mood_id
       WHERE lh.user_id = $1 AND lh.listened_at > NOW() - INTERVAL '${days} days'
       GROUP BY m.id, m.name
       ORDER BY frequency DESC
       LIMIT 10`,
      [userId]
    );
    return result.rows;
  }

  async getTopSongs(userId: string, days: number = 30, limit: number = 50): Promise<any[]> {
    const result = await pool.query(
      `SELECT s.id, s.title, a.name as artist_name, COUNT(*) as plays,
              SUM(lh.duration_s) as total_duration
       FROM listening_history lh
       JOIN songs s ON s.id = lh.song_id
       JOIN artists a ON a.id = s.artist_id
       WHERE lh.user_id = $1 AND lh.listened_at > NOW() - INTERVAL '${days} days'
       GROUP BY s.id, s.title, a.name
       ORDER BY plays DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  async getTotalListeningTime(userId: string, days: number = 30): Promise<number> {
    const result = await pool.query(
      `SELECT COALESCE(SUM(duration_s), 0) as total_time
       FROM listening_history
       WHERE user_id = $1 AND listened_at > NOW() - INTERVAL '${days} days'`,
      [userId]
    );
    return parseFloat(result.rows[0].total_time);
  }
}

export const listeningHistoryService = new ListeningHistoryService();
