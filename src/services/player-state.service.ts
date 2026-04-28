import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import {
  PlayerState,
  UpdatePlayerStateDTO,
  RepeatMode,
} from '../models/player-state.model';

export class PlayerStateService {
  async getPlayerState(userId: string): Promise<PlayerState> {
    const result = await pool.query(
      `SELECT user_id AS "userId", current_song_id AS "currentSongId",
              position_s AS "positionS", repeat, shuffle, updated_at AS "updatedAt"
       FROM player_state
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default state if not exists
      return this.createDefaultState(userId);
    }

    return result.rows[0];
  }

  private async createDefaultState(userId: string): Promise<PlayerState> {
    const result = await pool.query(
      `INSERT INTO player_state (user_id, position_s, repeat, shuffle)
       VALUES ($1, 0, 'none', FALSE)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING user_id AS "userId", current_song_id AS "currentSongId",
                 position_s AS "positionS", repeat, shuffle, updated_at AS "updatedAt"`,
      [userId]
    );

    // If already existed, fetch it
    if (result.rows.length === 0) {
      return this.getPlayerState(userId);
    }

    return result.rows[0];
  }

  async updatePlayerState(userId: string, data: UpdatePlayerStateDTO): Promise<PlayerState> {
    const current = await this.getPlayerState(userId);

    const result = await pool.query(
      `UPDATE player_state
       SET current_song_id = $1, position_s = $2, repeat = $3, shuffle = $4, updated_at = NOW()
       WHERE user_id = $5
       RETURNING user_id AS "userId", current_song_id AS "currentSongId",
                 position_s AS "positionS", repeat, shuffle, updated_at AS "updatedAt"`,
      [
        data.currentSongId ?? current.currentSongId,
        data.positionS ?? current.positionS,
        data.repeat ?? current.repeat,
        data.shuffle ?? current.shuffle,
        userId,
      ]
    );

    return result.rows[0];
  }

  async setCurrentSong(userId: string, songId: string | null, position: number = 0): Promise<PlayerState> {
    return this.updatePlayerState(userId, {
      currentSongId: songId,
      positionS: position,
    });
  }

  async setRepeatMode(userId: string, mode: RepeatMode): Promise<PlayerState> {
    return this.updatePlayerState(userId, { repeat: mode });
  }

  async setShuffle(userId: string, shuffle: boolean): Promise<PlayerState> {
    return this.updatePlayerState(userId, { shuffle });
  }

  async setPosition(userId: string, positionS: number): Promise<PlayerState> {
    return this.updatePlayerState(userId, { positionS });
  }
}

export const playerStateService = new PlayerStateService();
