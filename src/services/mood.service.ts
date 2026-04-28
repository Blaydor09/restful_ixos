import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import { Mood, CreateMoodDTO, UpdateMoodDTO } from '../models/mood.model';

export class MoodService {
  async getAll(): Promise<Mood[]> {
    const result = await pool.query(
      `SELECT id, name, display_name AS "displayName", icon_name AS "iconName",
              gradient_start AS "gradientStart", gradient_end AS "gradientEnd",
              sort_order AS "sortOrder"
       FROM moods
       ORDER BY sort_order ASC`
    );
    return result.rows;
  }

  async getById(id: string): Promise<Mood> {
    const result = await pool.query(
      `SELECT id, name, display_name AS "displayName", icon_name AS "iconName",
              gradient_start AS "gradientStart", gradient_end AS "gradientEnd",
              sort_order AS "sortOrder"
       FROM moods
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Mood not found');
    }

    return result.rows[0];
  }

  async getByName(name: string): Promise<Mood | null> {
    const result = await pool.query(
      `SELECT id, name, display_name AS "displayName", icon_name AS "iconName",
              gradient_start AS "gradientStart", gradient_end AS "gradientEnd",
              sort_order AS "sortOrder"
       FROM moods
       WHERE name = $1`,
      [name]
    );

    return result.rows[0] || null;
  }

  async getSongsByMood(moodId: string, limit: number = 50, offset: number = 0) {
    const result = await pool.query(
      `SELECT s.id, s.title, a.name as artist_name, sm.score
       FROM song_moods sm
       JOIN songs s ON s.id = sm.song_id
       JOIN artists a ON a.id = s.artist_id
       WHERE sm.mood_id = $1
       ORDER BY sm.score DESC, s.play_count DESC
       LIMIT $2 OFFSET $3`,
      [moodId, limit, offset]
    );

    return result.rows;
  }

  async create(data: CreateMoodDTO): Promise<Mood> {
    const result = await pool.query(
      `INSERT INTO moods (name, display_name, icon_name, gradient_start, gradient_end, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, display_name AS "displayName", icon_name AS "iconName",
                 gradient_start AS "gradientStart", gradient_end AS "gradientEnd",
                 sort_order AS "sortOrder"`,
      [
        data.name,
        data.displayName,
        data.iconName,
        data.gradientStart,
        data.gradientEnd,
        data.sortOrder ?? 0,
      ]
    );

    return result.rows[0];
  }

  async update(id: string, data: UpdateMoodDTO): Promise<Mood> {
    const mood = await this.getById(id);

    const result = await pool.query(
      `UPDATE moods
       SET display_name = $1, icon_name = $2, gradient_start = $3,
           gradient_end = $4, sort_order = $5
       WHERE id = $6
       RETURNING id, name, display_name AS "displayName", icon_name AS "iconName",
                 gradient_start AS "gradientStart", gradient_end AS "gradientEnd",
                 sort_order AS "sortOrder"`,
      [
        data.displayName ?? mood.displayName,
        data.iconName ?? mood.iconName,
        data.gradientStart ?? mood.gradientStart,
        data.gradientEnd ?? mood.gradientEnd,
        data.sortOrder ?? mood.sortOrder,
        id,
      ]
    );

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await pool.query('DELETE FROM moods WHERE id = $1', [id]);
  }
}

export const moodService = new MoodService();
