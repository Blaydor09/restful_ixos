import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import { Artist, CreateArtistDTO, UpdateArtistDTO } from '../models/artist.model';

export class ArtistService {
  async getAll(limit: number = 50, offset: number = 0): Promise<Artist[]> {
    const result = await pool.query(
      `SELECT id, name, image_url AS "imageUrl", created_at AS "createdAt"
       FROM artists
       ORDER BY name ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getById(id: string): Promise<Artist> {
    const result = await pool.query(
      `SELECT id, name, image_url AS "imageUrl", created_at AS "createdAt"
       FROM artists
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Artist not found');
    }

    return result.rows[0];
  }

  async getByName(name: string): Promise<Artist | null> {
    const result = await pool.query(
      `SELECT id, name, image_url AS "imageUrl", created_at AS "createdAt"
       FROM artists
       WHERE name ILIKE $1
       LIMIT 1`,
      [`%${name}%`]
    );

    return result.rows[0] || null;
  }

  async create(data: CreateArtistDTO): Promise<Artist> {
    const result = await pool.query(
      `INSERT INTO artists (name, image_url)
       VALUES ($1, $2)
       RETURNING id, name, image_url AS "imageUrl", created_at AS "createdAt"`,
      [data.name, data.imageUrl || null]
    );

    return result.rows[0];
  }

  async update(id: string, data: UpdateArtistDTO): Promise<Artist> {
    const artist = await this.getById(id);

    const result = await pool.query(
      `UPDATE artists
       SET name = $1, image_url = $2
       WHERE id = $3
       RETURNING id, name, image_url AS "imageUrl", created_at AS "createdAt"`,
      [data.name ?? artist.name, data.imageUrl ?? artist.imageUrl, id]
    );

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.getById(id); // Verify exists

    await pool.query('DELETE FROM artists WHERE id = $1', [id]);
  }

  async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM artists');
    return parseInt(result.rows[0].count, 10);
  }
}

export const artistService = new ArtistService();
