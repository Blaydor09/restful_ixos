import { Router } from 'express';
import { QueryResultRow } from 'pg';
import { z } from 'zod';

import { optionalAuthenticate, authenticate } from '../middleware/auth';
import { query, withTransaction } from '../db/pool';
import { playlistSelect, songSelect } from '../services/sql-fragments';
import { asyncHandler } from '../utils/async-handler';
import { ApiError } from '../utils/api-error';
import { buildPaginationMeta, paginationSchema } from '../utils/pagination';

const router = Router();
const uuidSchema = z.string().uuid();

const playlistBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  coverUrl: z.string().trim().url().optional(),
  visibility: z.enum(['private', 'friends', 'public']).default('private'),
  isMoodBased: z.boolean().default(false),
  moodId: uuidSchema.optional(),
  gradientStart: z.string().trim().length(7).optional(),
  gradientEnd: z.string().trim().length(7).optional(),
  iconName: z.string().trim().max(80).optional(),
});

const playlistUpdateSchema = playlistBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Debes enviar al menos un campo para actualizar',
);

const playlistListSchema = paginationSchema.extend({
  ownerId: uuidSchema.optional(),
});

const addSongSchema = z.object({
  songId: uuidSchema,
  position: z.number().int().min(1).optional(),
});

const reorderSongSchema = z.object({
  songId: uuidSchema,
  position: z.number().int().min(1),
});

type Queryable = {
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ) => Promise<{ rows: T[] }>;
};

async function getPlaylistAccess(queryable: Queryable, playlistId: string) {
  const result = await queryable.query<{
    ownerId: string;
    visibility: 'private' | 'friends' | 'public';
  }>(
    `
      SELECT owner_id AS "ownerId", visibility
      FROM playlists
      WHERE id = $1
      LIMIT 1
    `,
    [playlistId],
  );

  return result.rows[0];
}

async function requirePlaylistOwner(
  queryable: Queryable,
  playlistId: string,
  userId: string,
) {
  const access = await getPlaylistAccess(queryable, playlistId);

  if (!access) {
    throw new ApiError(404, 'Playlist no encontrada');
  }

  if (access.ownerId !== userId) {
    throw new ApiError(403, 'No puedes modificar esta playlist');
  }

  return access;
}

async function shiftPlaylistPositionsUp(
  queryable: Queryable,
  playlistId: string,
  fromPosition: number,
) {
  await queryable.query(
    `
      UPDATE playlist_songs
      SET position = -position
      WHERE playlist_id = $1
        AND position >= $2
    `,
    [playlistId, fromPosition],
  );

  await queryable.query(
    `
      UPDATE playlist_songs
      SET position = ABS(position) + 1
      WHERE playlist_id = $1
        AND position <= -$2
    `,
    [playlistId, fromPosition],
  );
}

async function shiftPlaylistPositionsDown(
  queryable: Queryable,
  playlistId: string,
  fromPosition: number,
) {
  await queryable.query(
    `
      UPDATE playlist_songs
      SET position = -position
      WHERE playlist_id = $1
        AND position > $2
    `,
    [playlistId, fromPosition],
  );

  await queryable.query(
    `
      UPDATE playlist_songs
      SET position = ABS(position) - 1
      WHERE playlist_id = $1
        AND position < -$2
    `,
    [playlistId, fromPosition],
  );
}

router.get(
  '/',
  optionalAuthenticate,
  asyncHandler(async (request, response) => {
    const pagination = playlistListSchema.parse(request.query);
    const mine = request.query.mine === 'true';

    if (mine && !request.user) {
      throw new ApiError(401, 'Debes iniciar sesión para ver tus playlists');
    }

    const where: string[] = [];
    const params: unknown[] = [];

    if (mine) {
      params.push(request.user!.id);
      where.push(`p.owner_id = $${params.length}`);
    } else {
      where.push(`p.visibility = 'public'`);

      if (pagination.ownerId) {
        params.push(pagination.ownerId);
        where.push(`p.owner_id = $${params.length}`);
      }
    }

    const countResult = await query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM playlists p
        WHERE ${where.join(' AND ')}
      `,
      params,
    );

    const playlists = await query(
      `
        SELECT ${playlistSelect}
        FROM playlists p
        JOIN users u ON u.id = p.owner_id
        LEFT JOIN moods m ON m.id = p.mood_id
        WHERE ${where.join(' AND ')}
        ORDER BY p.updated_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, pagination.limit, pagination.offset],
    );

    response.json({
      data: playlists.rows,
      meta: buildPaginationMeta(
        pagination.limit,
        pagination.offset,
        countResult.rows[0]?.total ?? 0,
      ),
    });
  }),
);

router.get(
  '/:id',
  optionalAuthenticate,
  asyncHandler(async (request, response) => {
    const playlistId = uuidSchema.parse(request.params.id);
    const access = await getPlaylistAccess({ query }, playlistId);

    if (!access) {
      throw new ApiError(404, 'Playlist no encontrada');
    }

    if (access.visibility !== 'public' && access.ownerId !== request.user?.id) {
      throw new ApiError(403, 'No tienes permisos para ver esta playlist');
    }

    const [playlistResult, songsResult] = await Promise.all([
      query(
        `
          SELECT ${playlistSelect}
          FROM playlists p
          JOIN users u ON u.id = p.owner_id
          LEFT JOIN moods m ON m.id = p.mood_id
          WHERE p.id = $1
          LIMIT 1
        `,
        [playlistId],
      ),
      query(
        `
          SELECT
            ps.id AS "playlistSongId",
            ps.position,
            ps.added_at AS "addedAt",
            ${songSelect()}
          FROM playlist_songs ps
          JOIN songs s ON s.id = ps.song_id
          JOIN artists ar ON ar.id = s.artist_id
          LEFT JOIN albums al ON al.id = s.album_id
          WHERE ps.playlist_id = $1
          ORDER BY ps.position ASC
        `,
        [playlistId],
      ),
    ]);

    const playlist = playlistResult.rows[0];

    if (!playlist) {
      throw new ApiError(404, 'Playlist no encontrada');
    }

    response.json({
      data: {
        ...playlist,
        songs: songsResult.rows,
      },
    });
  }),
);

router.post(
  '/',
  authenticate,
  asyncHandler(async (request, response) => {
    const payload = playlistBodySchema.parse(request.body);

    const created = await withTransaction(async (client) => {
      const insertResult = await client.query<{ id: string }>(
        `
          INSERT INTO playlists (
            owner_id,
            name,
            description,
            cover_url,
            visibility,
            is_mood_based,
            mood_id,
            gradient_start,
            gradient_end,
            icon_name
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `,
        [
          request.user!.id,
          payload.name,
          payload.description ?? null,
          payload.coverUrl ?? null,
          payload.visibility,
          payload.isMoodBased,
          payload.moodId ?? null,
          payload.gradientStart ?? null,
          payload.gradientEnd ?? null,
          payload.iconName ?? null,
        ],
      );

      return insertResult.rows[0]?.id;
    });

    const result = await query(
      `
        SELECT ${playlistSelect}
        FROM playlists p
        JOIN users u ON u.id = p.owner_id
        LEFT JOIN moods m ON m.id = p.mood_id
        WHERE p.id = $1
        LIMIT 1
      `,
      [created],
    );

    response.status(201).json({
      data: result.rows[0],
    });
  }),
);

router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (request, response) => {
    const playlistId = uuidSchema.parse(request.params.id);
    const payload = playlistUpdateSchema.parse(request.body);

    const columnMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      coverUrl: 'cover_url',
      visibility: 'visibility',
      isMoodBased: 'is_mood_based',
      moodId: 'mood_id',
      gradientStart: 'gradient_start',
      gradientEnd: 'gradient_end',
      iconName: 'icon_name',
    };

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const [key, column] of Object.entries(columnMap)) {
      const value = payload[key as keyof typeof payload];
      if (value !== undefined) {
        values.push(value);
        updates.push(`${column} = $${values.length}`);
      }
    }

    await withTransaction(async (client) => {
      await requirePlaylistOwner(client, playlistId, request.user!.id);

      values.push(playlistId);
      await client.query(
        `
          UPDATE playlists
          SET ${updates.join(', ')}
          WHERE id = $${values.length}
        `,
        values,
      );
    });

    const result = await query(
      `
        SELECT ${playlistSelect}
        FROM playlists p
        JOIN users u ON u.id = p.owner_id
        LEFT JOIN moods m ON m.id = p.mood_id
        WHERE p.id = $1
        LIMIT 1
      `,
      [playlistId],
    );

    response.json({
      data: result.rows[0],
    });
  }),
);

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (request, response) => {
    const playlistId = uuidSchema.parse(request.params.id);

    await withTransaction(async (client) => {
      await requirePlaylistOwner(client, playlistId, request.user!.id);
      await client.query(`DELETE FROM playlists WHERE id = $1`, [playlistId]);
    });

    response.status(204).send();
  }),
);

router.post(
  '/:id/songs',
  authenticate,
  asyncHandler(async (request, response) => {
    const playlistId = uuidSchema.parse(request.params.id);
    const payload = addSongSchema.parse(request.body);

    await withTransaction(async (client) => {
      await requirePlaylistOwner(client, playlistId, request.user!.id);

      const songExists = await client.query<{ id: string }>(
        `SELECT id FROM songs WHERE id = $1 LIMIT 1`,
        [payload.songId],
      );

      if (!songExists.rows[0]) {
        throw new ApiError(404, 'La canción no existe');
      }

      const maxPositionResult = await client.query<{ maxPosition: number }>(
        `
          SELECT COALESCE(MAX(position), 0)::int AS "maxPosition"
          FROM playlist_songs
          WHERE playlist_id = $1
        `,
        [playlistId],
      );

      const maxPosition = maxPositionResult.rows[0]?.maxPosition ?? 0;
      const desiredPosition = Math.min(
        Math.max(payload.position ?? maxPosition + 1, 1),
        maxPosition + 1,
      );

      if (desiredPosition <= maxPosition) {
        await shiftPlaylistPositionsUp(client, playlistId, desiredPosition);
      }

      await client.query(
        `
          INSERT INTO playlist_songs (playlist_id, song_id, position, added_by)
          VALUES ($1, $2, $3, $4)
        `,
        [playlistId, payload.songId, desiredPosition, request.user!.id],
      );
    });

    response.status(201).json({
      message: 'Canción agregada a la playlist',
    });
  }),
);

router.patch(
  '/:id/songs/reorder',
  authenticate,
  asyncHandler(async (request, response) => {
    const playlistId = uuidSchema.parse(request.params.id);
    const payload = reorderSongSchema.parse(request.body);

    await withTransaction(async (client) => {
      await requirePlaylistOwner(client, playlistId, request.user!.id);

      const currentRow = await client.query<{ id: string; position: number }>(
        `
          SELECT id, position
          FROM playlist_songs
          WHERE playlist_id = $1 AND song_id = $2
          LIMIT 1
        `,
        [playlistId, payload.songId],
      );

      const playlistSong = currentRow.rows[0];

      if (!playlistSong) {
        throw new ApiError(404, 'La canción no está en la playlist');
      }

      const totalRows = await client.query<{ total: number }>(
        `
          SELECT COUNT(*)::int AS total
          FROM playlist_songs
          WHERE playlist_id = $1
        `,
        [playlistId],
      );

      const total = totalRows.rows[0]?.total ?? 1;
      const newPosition = Math.min(Math.max(payload.position, 1), total);

      if (playlistSong.position === newPosition) {
        return;
      }

      await client.query(`UPDATE playlist_songs SET position = 0 WHERE id = $1`, [playlistSong.id]);

      if (newPosition < playlistSong.position) {
        await client.query(
          `
            UPDATE playlist_songs
            SET position = -position
            WHERE playlist_id = $1
              AND position >= $2
              AND position < $3
          `,
          [playlistId, newPosition, playlistSong.position],
        );

        await client.query(
          `
            UPDATE playlist_songs
            SET position = ABS(position) + 1
            WHERE playlist_id = $1
              AND position <= -$2
              AND position > -$3
          `,
          [playlistId, newPosition, playlistSong.position],
        );
      } else {
        await client.query(
          `
            UPDATE playlist_songs
            SET position = -position
            WHERE playlist_id = $1
              AND position > $2
              AND position <= $3
          `,
          [playlistId, playlistSong.position, newPosition],
        );

        await client.query(
          `
            UPDATE playlist_songs
            SET position = ABS(position) - 1
            WHERE playlist_id = $1
              AND position < -$2
              AND position >= -$3
          `,
          [playlistId, playlistSong.position, newPosition],
        );
      }

      await client.query(`UPDATE playlist_songs SET position = $1 WHERE id = $2`, [
        newPosition,
        playlistSong.id,
      ]);
    });

    response.json({
      message: 'Playlist reordenada correctamente',
    });
  }),
);

router.delete(
  '/:id/songs/:songId',
  authenticate,
  asyncHandler(async (request, response) => {
    const playlistId = uuidSchema.parse(request.params.id);
    const songId = uuidSchema.parse(request.params.songId);

    await withTransaction(async (client) => {
      await requirePlaylistOwner(client, playlistId, request.user!.id);

      const currentRow = await client.query<{ position: number }>(
        `
          SELECT position
          FROM playlist_songs
          WHERE playlist_id = $1 AND song_id = $2
          LIMIT 1
        `,
        [playlistId, songId],
      );

      const playlistSong = currentRow.rows[0];

      if (!playlistSong) {
        throw new ApiError(404, 'La canción no está en la playlist');
      }

      await client.query(
        `
          DELETE FROM playlist_songs
          WHERE playlist_id = $1 AND song_id = $2
        `,
        [playlistId, songId],
      );

      await shiftPlaylistPositionsDown(client, playlistId, playlistSong.position);
    });

    response.status(204).send();
  }),
);

export default router;
