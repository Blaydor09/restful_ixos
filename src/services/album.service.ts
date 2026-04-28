import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import { Album, CreateAlbumDTO, UpdateAlbumDTO } from '../models/album.model';

export class AlbumService {
  async getAll(limit: number = 50, offset: number = 0): Promise<Album[]> {
    const result = await pool.query(
      `SELECT id, title, artist_id AS "artistId", cover_url AS "coverUrl",
              release_year AS "releaseYear", created_at AS "createdAt"
       FROM albums
       ORDER BY title ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getById(id: string): Promise<Album> {
    const result = await pool.query(
      `SELECT id, title, artist_id AS "artistId", cover_url AS "coverUrl",
              release_year AS "releaseYear", created_at AS "createdAt"
       FROM albums
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Album not found');
    }

    return result.rows[0];
  }

  async getByArtistId(artistId: string, limit: number = 50, offset: number = 0): Promise<Album[]> {
    const result = await pool.query(
      `SELECT id, title, artist_id AS "artistId", cover_url AS "coverUrl",
              release_year AS "releaseYear", created_at AS "createdAt"
       FROM albums
       WHERE artist_id = $1
       ORDER BY title ASC
       LIMIT $2 OFFSET $3`,
      [artistId, limit, offset]
    );
    return result.rows;
  }

  async create(data: CreateAlbumDTO): Promise<Album> {
    const result = await pool.query(
      `INSERT INTO albums (title, artist_id, cover_url, release_year)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, artist_id AS "artistId", cover_url AS "coverUrl",
                 release_year AS "releaseYear", created_at AS "createdAt"`,
      [data.title, data.artistId, data.coverUrl || null, data.releaseYear || null]
    );

    return result.rows[0];
  }

  async update(id: string, data: UpdateAlbumDTO): Promise<Album> {
    const album = await this.getById(id);

    const result = await pool.query(
      `UPDATE albums
       SET title = $1, cover_url = $2, release_year = $3
       WHERE id = $4
       RETURNING id, title, artist_id AS "artistId", cover_url AS "coverUrl",
                 release_year AS "releaseYear", created_at AS "createdAt"`,
      [data.title ?? album.title, data.coverUrl ?? album.coverUrl, data.releaseYear ?? album.releaseYear, id]
    );

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await pool.query('DELETE FROM albums WHERE id = $1', [id]);
  }
}

export const albumService = new AlbumService();
