import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import { Genre, CreateGenreDTO, UpdateGenreDTO } from '../models/genre.model';

export class GenreService {
  async getAll(): Promise<Genre[]> {
    const result = await pool.query(
      `SELECT id, name, color_hex AS "colorHex"
       FROM genres
       ORDER BY name ASC`
    );
    return result.rows;
  }

  async getById(id: string): Promise<Genre> {
    const result = await pool.query(
      `SELECT id, name, color_hex AS "colorHex"
       FROM genres
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404,'Genre not found');
    }

    return result.rows[0];
  }

  async getByName(name: string): Promise<Genre | null> {
    const result = await pool.query(
      `SELECT id, name, color_hex AS "colorHex"
       FROM genres
       WHERE name ILIKE $1
       LIMIT 1`,
      [name]
    );

    return result.rows[0] || null;
  }

  async create(data: CreateGenreDTO): Promise<Genre> {
    const result = await pool.query(
      `INSERT INTO genres (name, color_hex)
       VALUES ($1, $2)
       RETURNING id, name, color_hex AS "colorHex"`,
      [data.name, data.colorHex]
    );

    return result.rows[0];
  }

  async update(id: string, data: UpdateGenreDTO): Promise<Genre> {
    const genre = await this.getById(id);

    const result = await pool.query(
      `UPDATE genres
       SET name = $1, color_hex = $2
       WHERE id = $3
       RETURNING id, name, color_hex AS "colorHex"`,
      [data.name ?? genre.name, data.colorHex ?? genre.colorHex, id]
    );

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await pool.query('DELETE FROM genres WHERE id = $1', [id]);
  }
}

export const genreService = new GenreService();
