import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import { SongGenre, AddSongGenreDTO } from '../models/song-genre.model';
import { SongMood, AddSongMoodDTO } from '../models/song-mood.model';

export class SongRelationService {
  // ============= SONG GENRES =============

  async getSongGenres(songId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT g.id, g.name, g.color_hex AS "colorHex"
       FROM song_genres sg
       JOIN genres g ON g.id = sg.genre_id
       WHERE sg.song_id = $1`,
      [songId]
    );
    return result.rows;
  }

  async addSongGenre(songId: string, data: AddSongGenreDTO): Promise<SongGenre> {
    const result = await pool.query(
      `INSERT INTO song_genres (song_id, genre_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING song_id AS "songId", genre_id AS "genreId"`,
      [songId, data.genreId]
    );

    if (result.rows.length === 0) {
      // Already existed, return it
      return { songId, genreId: data.genreId };
    }

    return result.rows[0];
  }

  async removeSongGenre(songId: string, genreId: string): Promise<void> {
    await pool.query(
      `DELETE FROM song_genres WHERE song_id = $1 AND genre_id = $2`,
      [songId, genreId]
    );
  }

  // ============= SONG MOODS =============

  async getSongMoods(songId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT m.id, m.name, m.display_name AS "displayName", sm.score
       FROM song_moods sm
       JOIN moods m ON m.id = sm.mood_id
       WHERE sm.song_id = $1
       ORDER BY sm.score DESC`,
      [songId]
    );
    return result.rows;
  }

  async addSongMood(songId: string, data: AddSongMoodDTO): Promise<SongMood> {
    const result = await pool.query(
      `INSERT INTO song_moods (song_id, mood_id, score)
       VALUES ($1, $2, $3)
       ON CONFLICT (song_id, mood_id) DO UPDATE
       SET score = EXCLUDED.score
       RETURNING song_id AS "songId", mood_id AS "moodId", score`,
      [songId, data.moodId, data.score ?? 1.0]
    );

    return result.rows[0];
  }

  async removeSongMood(songId: string, moodId: string): Promise<void> {
    await pool.query(
      `DELETE FROM song_moods WHERE song_id = $1 AND mood_id = $2`,
      [songId, moodId]
    );
  }
}

export const songRelationService = new SongRelationService();
