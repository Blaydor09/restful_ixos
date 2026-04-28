import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import {
  Playlist,
  CreatePlaylistDTO,
  UpdatePlaylistDTO,
  PlaylistWithSongs,
} from '../models/playlist.model';

export class PlaylistService {
  async getAll(limit: number = 50, offset: number = 0): Promise<Playlist[]> {
    const result = await pool.query(
      `SELECT id, owner_id AS "ownerId", name, description, cover_url AS "coverUrl",
              visibility, mood_id AS "moodId", total_songs AS "totalSongs",
              total_duration_s AS "totalDurationS", created_at AS "createdAt"
       FROM playlists
       WHERE visibility = 'public'
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getById(id: string): Promise<Playlist> {
    const result = await pool.query(
      `SELECT id, owner_id AS "ownerId", name, description, cover_url AS "coverUrl",
              visibility, mood_id AS "moodId", total_songs AS "totalSongs",
              total_duration_s AS "totalDurationS", created_at AS "createdAt"
       FROM playlists
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Playlist not found');
    }

    return result.rows[0];
  }

  async getByIdWithSongs(id: string): Promise<PlaylistWithSongs> {
    const playlist = await this.getById(id);

    const songsResult = await pool.query(
      `SELECT ps.song_id AS id, s.title, s.artist_id AS "artistId",
              s.duration_s AS "durationS", ps.position
       FROM playlist_songs ps
       JOIN songs s ON s.id = ps.song_id
       WHERE ps.playlist_id = $1
       ORDER BY ps.position ASC`,
      [id]
    );

    return {
      ...playlist,
      songs: songsResult.rows,
    };
  }

  async getByOwnerId(ownerId: string, limit: number = 50, offset: number = 0): Promise<Playlist[]> {
    const result = await pool.query(
      `SELECT id, owner_id AS "ownerId", name, description, cover_url AS "coverUrl",
              visibility, mood_id AS "moodId", total_songs AS "totalSongs",
              total_duration_s AS "totalDurationS", created_at AS "createdAt"
       FROM playlists
       WHERE owner_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [ownerId, limit, offset]
    );
    return result.rows;
  }

  async create(ownerId: string, data: CreatePlaylistDTO): Promise<Playlist> {
    const result = await pool.query(
      `INSERT INTO playlists (owner_id, name, description, cover_url, visibility, mood_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, owner_id AS "ownerId", name, description, cover_url AS "coverUrl",
                 visibility, mood_id AS "moodId", total_songs AS "totalSongs",
                 total_duration_s AS "totalDurationS", created_at AS "createdAt"`,
      [
        ownerId,
        data.name,
        data.description || null,
        data.coverUrl || null,
        data.visibility || 'private',
        data.moodId || null,
      ]
    );

    return result.rows[0];
  }

  async update(id: string, data: UpdatePlaylistDTO): Promise<Playlist> {
    const playlist = await this.getById(id);

    const result = await pool.query(
      `UPDATE playlists
       SET name = $1, description = $2, cover_url = $3, visibility = $4, mood_id = $5
       WHERE id = $6
       RETURNING id, owner_id AS "ownerId", name, description, cover_url AS "coverUrl",
                 visibility, mood_id AS "moodId", total_songs AS "totalSongs",
                 total_duration_s AS "totalDurationS", created_at AS "createdAt"`,
      [
        data.name ?? playlist.name,
        data.description ?? playlist.description,
        data.coverUrl ?? playlist.coverUrl,
        data.visibility ?? playlist.visibility,
        data.moodId ?? playlist.moodId,
        id,
      ]
    );

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await pool.query('DELETE FROM playlists WHERE id = $1', [id]);
  }

  async addSong(playlistId: string, songId: string): Promise<void> {
    // Get the next position
    const posResult = await pool.query(
      `SELECT MAX(position) as max_position FROM playlist_songs WHERE playlist_id = $1`,
      [playlistId]
    );

    const nextPosition = (posResult.rows[0].max_position ?? 0) + 1;

    await pool.query(
      `INSERT INTO playlist_songs (playlist_id, song_id, position)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [playlistId, songId, nextPosition]
    );
  }

  async removeSong(playlistId: string, songId: string): Promise<void> {
    await pool.query(
      `DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2`,
      [playlistId, songId]
    );
  }

  async reorderSong(playlistId: string, songId: string, newPosition: number): Promise<void> {
    await pool.query(
      `UPDATE playlist_songs SET position = $1 WHERE playlist_id = $2 AND song_id = $3`,
      [newPosition, playlistId, songId]
    );
  }
}

export const playlistService = new PlaylistService();
