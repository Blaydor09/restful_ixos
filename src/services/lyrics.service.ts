import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import { Lyrics, CreateLyricsDTO, UpdateLyricsDTO } from '../models/lyrics.model';

export class LyricsService {
  async getSongLyrics(songId: string): Promise<Lyrics[]> {
    const result = await pool.query(
      `SELECT id, song_id AS "songId", line_index AS "lineIndex",
              start_ms AS "startMs", end_ms AS "endMs", text
       FROM lyrics
       WHERE song_id = $1
       ORDER BY line_index ASC`,
      [songId]
    );
    return result.rows;
  }

  async getLyricsById(id: string): Promise<Lyrics> {
    const result = await pool.query(
      `SELECT id, song_id AS "songId", line_index AS "lineIndex",
              start_ms AS "startMs", end_ms AS "endMs", text
       FROM lyrics
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Lyrics not found');
    }

    return result.rows[0];
  }

  async createLyrics(songId: string, data: CreateLyricsDTO): Promise<Lyrics> {
    const result = await pool.query(
      `INSERT INTO lyrics (song_id, line_index, start_ms, end_ms, text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, song_id AS "songId", line_index AS "lineIndex",
                 start_ms AS "startMs", end_ms AS "endMs", text`,
      [songId, data.lineIndex, data.startMs, data.endMs, data.text]
    );

    return result.rows[0];
  }

  async bulkCreateLyrics(songId: string, lyrics: CreateLyricsDTO[]): Promise<Lyrics[]> {
    const result = await pool.query(
      `INSERT INTO lyrics (song_id, line_index, start_ms, end_ms, text)
       VALUES ${lyrics
         .map(
           (_, index) =>
             `($1, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4}, $${index * 4 + 5})`
         )
         .join(', ')}
       RETURNING id, song_id AS "songId", line_index AS "lineIndex",
                 start_ms AS "startMs", end_ms AS "endMs", text`,
      [
        songId,
        ...lyrics.flatMap((l) => [l.lineIndex, l.startMs, l.endMs, l.text]),
      ]
    );

    return result.rows;
  }

  async updateLyrics(id: string, data: UpdateLyricsDTO): Promise<Lyrics> {
    const lyrics = await this.getLyricsById(id);

    const result = await pool.query(
      `UPDATE lyrics
       SET text = $1, start_ms = $2, end_ms = $3
       WHERE id = $4
       RETURNING id, song_id AS "songId", line_index AS "lineIndex",
                 start_ms AS "startMs", end_ms AS "endMs", text`,
      [
        data.text ?? lyrics.text,
        data.startMs ?? lyrics.startMs,
        data.endMs ?? lyrics.endMs,
        id,
      ]
    );

    return result.rows[0];
  }

  async deleteLyrics(id: string): Promise<void> {
    await this.getLyricsById(id);
    await pool.query('DELETE FROM lyrics WHERE id = $1', [id]);
  }

  async deleteSongLyrics(songId: string): Promise<void> {
    await pool.query('DELETE FROM lyrics WHERE song_id = $1', [songId]);
  }
}

export const lyricsService = new LyricsService();
