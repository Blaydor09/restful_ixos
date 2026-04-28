import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import {
  Song,
  CreateSongDTO,
  UpdateSongDTO,
  SongWithRelations,
} from '../models/song.model';

export class SongService {
  async getAll(limit: number = 50, offset: number = 0): Promise<Song[]> {
    const result = await pool.query(
      `SELECT id, file_id AS "fileId", file_path AS "filePath",
              cdn_url AS "cdnUrl", title, artist_id AS "artistId",
              album_id AS "albumId", cover_url AS "coverUrl",
              release_year AS "releaseYear", duration_s AS "durationS",
              explicit, play_count AS "playCount", created_at AS "createdAt"
       FROM songs
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getById(id: string): Promise<Song> {
    const result = await pool.query(
      `SELECT id, file_id AS "fileId", file_path AS "filePath",
              cdn_url AS "cdnUrl", title, artist_id AS "artistId",
              album_id AS "albumId", cover_url AS "coverUrl",
              release_year AS "releaseYear", duration_s AS "durationS",
              explicit, play_count AS "playCount", created_at AS "createdAt"
       FROM songs
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Song not found');
    }

    return result.rows[0];
  }

  async getByIdWithRelations(id: string): Promise<SongWithRelations> {
    const song = await this.getById(id);

    const genresResult = await pool.query(
      `SELECT g.id, g.name
       FROM song_genres sg
       JOIN genres g ON g.id = sg.genre_id
       WHERE sg.song_id = $1`,
      [id]
    );

    const moodsResult = await pool.query(
      `SELECT m.id, m.name, sm.score
       FROM song_moods sm
       JOIN moods m ON m.id = sm.mood_id
       WHERE sm.song_id = $1`,
      [id]
    );

    const artistResult = await pool.query(
      `SELECT id, name FROM artists WHERE id = $1`,
      [song.artistId]
    );

    let album = null;
    if (song.albumId) {
      const albumResult = await pool.query(
        `SELECT id, title FROM albums WHERE id = $1`,
        [song.albumId]
      );
      album = albumResult.rows[0] || null;
    }

    return {
      ...song,
      artist: artistResult.rows[0],
      album: album,
      genres: genresResult.rows,
      moods: moodsResult.rows,
    };
  }

  async getByFileId(fileId: string): Promise<Song | null> {
    const result = await pool.query(
      `SELECT id, file_id AS "fileId", file_path AS "filePath",
              cdn_url AS "cdnUrl", title, artist_id AS "artistId",
              album_id AS "albumId", cover_url AS "coverUrl",
              release_year AS "releaseYear", duration_s AS "durationS",
              explicit, play_count AS "playCount", created_at AS "createdAt"
       FROM songs
       WHERE file_id = $1`,
      [fileId]
    );

    return result.rows[0] || null;
  }

  async getByArtistId(artistId: string, limit: number = 50, offset: number = 0): Promise<Song[]> {
    const result = await pool.query(
      `SELECT id, file_id AS "fileId", file_path AS "filePath",
              cdn_url AS "cdnUrl", title, artist_id AS "artistId",
              album_id AS "albumId", cover_url AS "coverUrl",
              release_year AS "releaseYear", duration_s AS "durationS",
              explicit, play_count AS "playCount", created_at AS "createdAt"
       FROM songs
       WHERE artist_id = $1
       ORDER BY title ASC
       LIMIT $2 OFFSET $3`,
      [artistId, limit, offset]
    );
    return result.rows;
  }

  async searchByTitle(query: string, limit: number = 50, offset: number = 0): Promise<Song[]> {
    const result = await pool.query(
      `SELECT id, file_id AS "fileId", file_path AS "filePath",
              cdn_url AS "cdnUrl", title, artist_id AS "artistId",
              album_id AS "albumId", cover_url AS "coverUrl",
              release_year AS "releaseYear", duration_s AS "durationS",
              explicit, play_count AS "playCount", created_at AS "createdAt"
       FROM songs
       WHERE title ILIKE $1
       ORDER BY play_count DESC
       LIMIT $2 OFFSET $3`,
      [`%${query}%`, limit, offset]
    );
    return result.rows;
  }

  async create(data: CreateSongDTO): Promise<Song> {
    const result = await pool.query(
      `INSERT INTO songs (file_id, file_path, cdn_url, title, artist_id,
                         album_id, cover_url, release_year, duration_s, explicit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, file_id AS "fileId", file_path AS "filePath",
                 cdn_url AS "cdnUrl", title, artist_id AS "artistId",
                 album_id AS "albumId", cover_url AS "coverUrl",
                 release_year AS "releaseYear", duration_s AS "durationS",
                 explicit, play_count AS "playCount", created_at AS "createdAt"`,
      [
        data.fileId,
        data.filePath,
        data.cdnUrl || null,
        data.title,
        data.artistId,
        data.albumId || null,
        data.coverUrl || null,
        data.releaseYear || null,
        data.durationS,
        data.explicit ?? false,
      ]
    );

    return result.rows[0];
  }

  async update(id: string, data: UpdateSongDTO): Promise<Song> {
    const song = await this.getById(id);

    const result = await pool.query(
      `UPDATE songs
       SET title = $1, album_id = $2, cover_url = $3, release_year = $4, cdn_url = $5
       WHERE id = $6
       RETURNING id, file_id AS "fileId", file_path AS "filePath",
                 cdn_url AS "cdnUrl", title, artist_id AS "artistId",
                 album_id AS "albumId", cover_url AS "coverUrl",
                 release_year AS "releaseYear", duration_s AS "durationS",
                 explicit, play_count AS "playCount", created_at AS "createdAt"`,
      [
        data.title ?? song.title,
        data.albumId ?? song.albumId,
        data.coverUrl ?? song.coverUrl,
        data.releaseYear ?? song.releaseYear,
        data.cdnUrl ?? song.cdnUrl,
        id,
      ]
    );

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await pool.query('DELETE FROM songs WHERE id = $1', [id]);
  }

  async incrementPlayCount(id: string): Promise<void> {
    await pool.query(
      `UPDATE songs SET play_count = play_count + 1 WHERE id = $1`,
      [id]
    );
  }

  async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM songs');
    return parseInt(result.rows[0].count, 10);
  }
}

export const songService = new SongService();
