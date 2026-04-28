import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import {
  LikedSong,
  CreateLikedSongDTO,
} from '../models/liked-song.model';

export class LikedSongService {
  async getLikedSongs(userId: string, limit: number = 50, offset: number = 0) {
    const result = await pool.query(
      `SELECT s.id, s.title, a.name AS artist_name, s.cover_url AS cover_url,
              ls.liked_at AS "likedAt"
       FROM liked_songs ls
       JOIN songs s ON s.id = ls.song_id
       JOIN artists a ON a.id = s.artist_id
       WHERE ls.user_id = $1
       ORDER BY ls.liked_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  async isLiked(userId: string, songId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM liked_songs WHERE user_id = $1 AND song_id = $2`,
      [userId, songId]
    );
    return result.rows.length > 0;
  }

  async addLikedSong(userId: string, data: CreateLikedSongDTO): Promise<LikedSong> {
    const result = await pool.query(
      `INSERT INTO liked_songs (user_id, song_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, song_id) DO UPDATE
       SET liked_at = NOW()
       RETURNING user_id AS "userId", song_id AS "songId", liked_at AS "likedAt"`,
      [userId, data.songId]
    );

    return result.rows[0];
  }

  async removeLikedSong(userId: string, songId: string): Promise<void> {
    await pool.query(
      `DELETE FROM liked_songs WHERE user_id = $1 AND song_id = $2`,
      [userId, songId]
    );
  }

  async getLikedCount(userId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) FROM liked_songs WHERE user_id = $1`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }
}

export const likedSongService = new LikedSongService();
