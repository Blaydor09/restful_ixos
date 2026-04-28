import { Router } from 'express';
import { z } from 'zod';

import { query, withTransaction } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { songSelect } from '../services/sql-fragments';
import { asyncHandler } from '../utils/async-handler';
import { ApiError } from '../utils/api-error';
import { buildPaginationMeta, paginationSchema } from '../utils/pagination';

const router = Router();
const uuidSchema = z.uuid();

const streamQualitySchema = z.enum(['low', 'normal', 'high', 'lossless']);

const profileUpdateSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80).optional(),
    avatarUrl: z.url().optional(),
    bio: z.string().trim().max(300).optional(),
    country: z.string().trim().regex(/^[A-Za-z]{2}$/).optional(),
    preferredLanguage: z.string().trim().regex(/^[A-Za-z]{2}$/).optional(),
    dateOfBirth: z.string().date().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar datos para actualizar');

const preferencesSchema = z
  .object({
    streamQuality: streamQualitySchema.optional(),
    downloadQuality: streamQualitySchema.optional(),
    eqLow: z.number().min(-12).max(12).optional(),
    eqMid: z.number().min(-12).max(12).optional(),
    eqHigh: z.number().min(-12).max(12).optional(),
    showExplicit: z.boolean().optional(),
    autoplay: z.boolean().optional(),
    crossfadeMs: z.number().int().min(0).max(12000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar datos para actualizar');

const historyBodySchema = z.object({
  songId: uuidSchema,
  durationS: z.number().int().min(0),
  completed: z.boolean().default(false),
  sourceType: z.string().trim().max(40).optional(),
  moodId: uuidSchema.optional(),
});

const queueItemSchema = z.object({
  songId: uuidSchema,
  sourceType: z.string().trim().max(40).optional(),
  sourceId: uuidSchema.optional(),
});

const queueReplaceSchema = z.object({
  items: z.array(queueItemSchema).max(200),
});

const downloadBodySchema = z.object({
  songId: uuidSchema,
  quality: streamQualitySchema.default('high'),
  fileSizeBytes: z.number().int().positive().optional(),
  localPath: z.string().trim().max(500).optional(),
  status: z.enum(['pending', 'downloading', 'completed', 'failed', 'deleted']).default('pending'),
  downloadedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

const downloadUpdateSchema = z
  .object({
    quality: streamQualitySchema.optional(),
    fileSizeBytes: z.number().int().positive().optional(),
    localPath: z.string().trim().max(500).optional(),
    status: z.enum(['pending', 'downloading', 'completed', 'failed', 'deleted']).optional(),
    downloadedAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Debes enviar datos para actualizar');

const playerStateSchema = z.object({
  currentSongId: uuidSchema.nullish(),
  positionS: z.number().int().min(0),
  repeat: z.enum(['none', 'one', 'all']),
  shuffle: z.boolean(),
  volume: z.number().min(0).max(1),
});

const moodSessionSchema = z.object({
  moodId: uuidSchema,
});

const recommendationQuerySchema = z.object({
  moodId: uuidSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

router.use(authenticate);

async function loadProfile(userId: string) {
  const result = await query(
    `
      SELECT
        u.id,
        u.username,
        u.email,
        COALESCE(u.display_name, u.username) AS "displayName",
        u.avatar_url AS "avatarUrl",
        u.bio,
        u.country,
        u.preferred_language AS "preferredLanguage",
        u.date_of_birth AS "dateOfBirth",
        u.created_at AS "createdAt",
        u.updated_at AS "updatedAt",
        u.last_login_at AS "lastLoginAt",
        COALESCE(premium.is_premium, FALSE) AS "isPremium",
        CASE
          WHEN subscription.subscription_id IS NULL THEN NULL
          ELSE json_build_object(
            'id', subscription.subscription_id,
            'startDate', subscription.start_date,
            'endDate', subscription.end_date,
            'autoRenew', subscription.auto_renew,
            'isActive', subscription.is_active,
            'plan', json_build_object(
              'id', subscription.plan_id,
              'name', subscription.plan_name,
              'priceUsd', subscription.price_usd,
              'features', subscription.features
            )
          )
        END AS subscription
      FROM users u
      LEFT JOIN user_is_premium premium ON premium.user_id = u.id
      LEFT JOIN LATERAL (
        SELECT
          us.id AS subscription_id,
          us.start_date,
          us.end_date,
          us.auto_renew,
          us.is_active,
          sp.id AS plan_id,
          sp.name AS plan_name,
          sp.price_usd,
          sp.features
        FROM user_subscriptions us
        JOIN subscription_plans sp ON sp.id = us.plan_id
        WHERE us.user_id = u.id
          AND us.is_active = TRUE
        ORDER BY us.created_at DESC
        LIMIT 1
      ) subscription ON TRUE
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0];
}

async function ensurePreferences(userId: string) {
  await query(
    `
      INSERT INTO user_preferences (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `,
    [userId],
  );

  const result = await query(
    `
      SELECT
        user_id AS "userId",
        stream_quality AS "streamQuality",
        download_quality AS "downloadQuality",
        eq_low AS "eqLow",
        eq_mid AS "eqMid",
        eq_high AS "eqHigh",
        show_explicit AS "showExplicit",
        autoplay,
        crossfade_ms AS "crossfadeMs",
        updated_at AS "updatedAt"
      FROM user_preferences
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0];
}

function buildUpdateFragments(
  payload: Record<string, unknown>,
  columnMap: Record<string, string>,
) {
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const [key, column] of Object.entries(columnMap)) {
    const value = payload[key];
    if (value !== undefined) {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    }
  }

  return { updates, values };
}

router.get(
  '/profile',
  asyncHandler(async (request, response) => {
    const profile = await loadProfile(request.user!.id);

    if (!profile) {
      throw new ApiError(404, 'Usuario no encontrado');
    }

    response.json({
      data: profile,
    });
  }),
);

router.patch(
  '/profile',
  asyncHandler(async (request, response) => {
    const payload = profileUpdateSchema.parse(request.body);
    const columnMap: Record<string, string> = {
      displayName: 'display_name',
      avatarUrl: 'avatar_url',
      bio: 'bio',
      country: 'country',
      preferredLanguage: 'preferred_language',
      dateOfBirth: 'date_of_birth',
    };

    const { updates, values } = buildUpdateFragments(payload, columnMap);
    values.push(request.user!.id);

    await query(
      `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
      `,
      values,
    );

    response.json({
      data: await loadProfile(request.user!.id),
    });
  }),
);

router.get(
  '/preferences',
  asyncHandler(async (request, response) => {
    response.json({
      data: await ensurePreferences(request.user!.id),
    });
  }),
);

router.put(
  '/preferences',
  asyncHandler(async (request, response) => {
    const payload = preferencesSchema.parse(request.body);
    const columnMap: Record<string, string> = {
      streamQuality: 'stream_quality',
      downloadQuality: 'download_quality',
      eqLow: 'eq_low',
      eqMid: 'eq_mid',
      eqHigh: 'eq_high',
      showExplicit: 'show_explicit',
      autoplay: 'autoplay',
      crossfadeMs: 'crossfade_ms',
    };

    await ensurePreferences(request.user!.id);

    const { updates, values } = buildUpdateFragments(payload, columnMap);
    values.push(request.user!.id);

    await query(
      `
        UPDATE user_preferences
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE user_id = $${values.length}
      `,
      values,
    );

    response.json({
      data: await ensurePreferences(request.user!.id),
    });
  }),
);

router.post(
  '/moods/sessions',
  asyncHandler(async (request, response) => {
    const payload = moodSessionSchema.parse(request.body);

    const result = await withTransaction(async (client) => {
      await client.query(
        `
          UPDATE user_mood_sessions
          SET ended_at = NOW()
          WHERE user_id = $1
            AND ended_at IS NULL
        `,
        [request.user!.id],
      );

      const created = await client.query(
        `
          INSERT INTO user_mood_sessions (user_id, mood_id)
          VALUES ($1, $2)
          RETURNING id, started_at AS "startedAt", ended_at AS "endedAt"
        `,
        [request.user!.id, payload.moodId],
      );

      return created.rows[0];
    });

    response.status(201).json({
      data: result,
    });
  }),
);

router.get(
  '/moods/sessions',
  asyncHandler(async (request, response) => {
    const pagination = paginationSchema.parse(request.query);

    const countResult = await query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM user_mood_sessions
        WHERE user_id = $1
      `,
      [request.user!.id],
    );

    const result = await query(
      `
        SELECT
          ums.id,
          ums.started_at AS "startedAt",
          ums.ended_at AS "endedAt",
          json_build_object(
            'id', m.id,
            'name', m.name,
            'displayName', m.display_name,
            'iconName', m.icon_name,
            'gradientStart', m.gradient_start,
            'gradientEnd', m.gradient_end
          ) AS mood
        FROM user_mood_sessions ums
        JOIN moods m ON m.id = ums.mood_id
        WHERE ums.user_id = $1
        ORDER BY ums.started_at DESC
        LIMIT $2 OFFSET $3
      `,
      [request.user!.id, pagination.limit, pagination.offset],
    );

    response.json({
      data: result.rows,
      meta: buildPaginationMeta(
        pagination.limit,
        pagination.offset,
        countResult.rows[0]?.total ?? 0,
      ),
    });
  }),
);

router.get(
  '/likes',
  asyncHandler(async (request, response) => {
    const pagination = paginationSchema.parse(request.query);

    const countResult = await query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM liked_songs
        WHERE user_id = $1
      `,
      [request.user!.id],
    );

    const result = await query(
      `
        SELECT
          ls.liked_at AS "likedAt",
          ${songSelect('TRUE')}
        FROM liked_songs ls
        JOIN songs s ON s.id = ls.song_id
        JOIN artists ar ON ar.id = s.artist_id
        LEFT JOIN albums al ON al.id = s.album_id
        WHERE ls.user_id = $1
        ORDER BY ls.liked_at DESC
        LIMIT $2 OFFSET $3
      `,
      [request.user!.id, pagination.limit, pagination.offset],
    );

    response.json({
      data: result.rows,
      meta: buildPaginationMeta(
        pagination.limit,
        pagination.offset,
        countResult.rows[0]?.total ?? 0,
      ),
    });
  }),
);

router.post(
  '/likes/:songId',
  asyncHandler(async (request, response) => {
    const songId = uuidSchema.parse(request.params.songId);

    await query(
      `
        INSERT INTO liked_songs (user_id, song_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, song_id) DO NOTHING
      `,
      [request.user!.id, songId],
    );

    response.status(201).json({
      message: 'Canción marcada como favorita',
    });
  }),
);

router.delete(
  '/likes/:songId',
  asyncHandler(async (request, response) => {
    const songId = uuidSchema.parse(request.params.songId);

    await query(
      `
        DELETE FROM liked_songs
        WHERE user_id = $1
          AND song_id = $2
      `,
      [request.user!.id, songId],
    );

    response.status(204).send();
  }),
);

router.get(
  '/downloads',
  asyncHandler(async (request, response) => {
    const pagination = paginationSchema.parse(request.query);

    const countResult = await query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM downloads
        WHERE user_id = $1
      `,
      [request.user!.id],
    );

    const result = await query(
      `
        SELECT
          d.id AS "downloadId",
          d.quality,
          d.file_size_bytes AS "fileSizeBytes",
          d.local_path AS "localPath",
          d.status,
          d.downloaded_at AS "downloadedAt",
          d.expires_at AS "expiresAt",
          ${songSelect(
            'EXISTS (SELECT 1 FROM liked_songs ls WHERE ls.song_id = s.id AND ls.user_id = $1)',
          )}
        FROM downloads d
        JOIN songs s ON s.id = d.song_id
        JOIN artists ar ON ar.id = s.artist_id
        LEFT JOIN albums al ON al.id = s.album_id
        WHERE d.user_id = $1
        ORDER BY d.downloaded_at DESC NULLS LAST, d.id DESC
        LIMIT $2 OFFSET $3
      `,
      [request.user!.id, pagination.limit, pagination.offset],
    );

    response.json({
      data: result.rows,
      meta: buildPaginationMeta(
        pagination.limit,
        pagination.offset,
        countResult.rows[0]?.total ?? 0,
      ),
    });
  }),
);

router.post(
  '/downloads',
  asyncHandler(async (request, response) => {
    const payload = downloadBodySchema.parse(request.body);

    await query(
      `
        INSERT INTO downloads (
          user_id,
          song_id,
          quality,
          file_size_bytes,
          local_path,
          status,
          downloaded_at,
          expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id, song_id)
        DO UPDATE SET
          quality = EXCLUDED.quality,
          file_size_bytes = EXCLUDED.file_size_bytes,
          local_path = EXCLUDED.local_path,
          status = EXCLUDED.status,
          downloaded_at = EXCLUDED.downloaded_at,
          expires_at = EXCLUDED.expires_at
      `,
      [
        request.user!.id,
        payload.songId,
        payload.quality,
        payload.fileSizeBytes ?? null,
        payload.localPath ?? null,
        payload.status,
        payload.downloadedAt ?? null,
        payload.expiresAt ?? null,
      ],
    );

    response.status(201).json({
      message: 'Descarga registrada correctamente',
    });
  }),
);

router.patch(
  '/downloads/:id',
  asyncHandler(async (request, response) => {
    const downloadId = uuidSchema.parse(request.params.id);
    const payload = downloadUpdateSchema.parse(request.body);
    const columnMap: Record<string, string> = {
      quality: 'quality',
      fileSizeBytes: 'file_size_bytes',
      localPath: 'local_path',
      status: 'status',
      downloadedAt: 'downloaded_at',
      expiresAt: 'expires_at',
    };

    const { updates, values } = buildUpdateFragments(payload, columnMap);
    values.push(request.user!.id, downloadId);

    const result = await query(
      `
        UPDATE downloads
        SET ${updates.join(', ')}
        WHERE user_id = $${values.length - 1}
          AND id = $${values.length}
        RETURNING id
      `,
      values,
    );

    if (!result.rows[0]) {
      throw new ApiError(404, 'Descarga no encontrada');
    }

    response.json({
      message: 'Descarga actualizada correctamente',
    });
  }),
);

router.get(
  '/queue',
  asyncHandler(async (request, response) => {
    const result = await query(
      `
        SELECT
          uq.id AS "queueId",
          uq.position,
          uq.source_type AS "sourceType",
          uq.source_id AS "sourceId",
          uq.added_at AS "addedAt",
          ${songSelect(
            'EXISTS (SELECT 1 FROM liked_songs ls WHERE ls.song_id = s.id AND ls.user_id = $1)',
          )}
        FROM user_queue uq
        JOIN songs s ON s.id = uq.song_id
        JOIN artists ar ON ar.id = s.artist_id
        LEFT JOIN albums al ON al.id = s.album_id
        WHERE uq.user_id = $1
        ORDER BY uq.position ASC
      `,
      [request.user!.id],
    );

    response.json({
      data: result.rows,
    });
  }),
);

router.post(
  '/queue',
  asyncHandler(async (request, response) => {
    const payload = queueItemSchema.parse(request.body);

    await withTransaction(async (client) => {
      const maxPositionResult = await client.query<{ maxPosition: number }>(
        `
          SELECT COALESCE(MAX(position), 0)::int AS "maxPosition"
          FROM user_queue
          WHERE user_id = $1
        `,
        [request.user!.id],
      );

      const nextPosition = (maxPositionResult.rows[0]?.maxPosition ?? 0) + 1;

      await client.query(
        `
          INSERT INTO user_queue (user_id, song_id, position, source_type, source_id)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          request.user!.id,
          payload.songId,
          nextPosition,
          payload.sourceType ?? null,
          payload.sourceId ?? null,
        ],
      );
    });

    response.status(201).json({
      message: 'Canción agregada a la cola',
    });
  }),
);

router.put(
  '/queue',
  asyncHandler(async (request, response) => {
    const payload = queueReplaceSchema.parse(request.body);

    await withTransaction(async (client) => {
      await client.query(`DELETE FROM user_queue WHERE user_id = $1`, [request.user!.id]);

      for (const [index, item] of payload.items.entries()) {
        await client.query(
          `
            INSERT INTO user_queue (user_id, song_id, position, source_type, source_id)
            VALUES ($1, $2, $3, $4, $5)
          `,
          [
            request.user!.id,
            item.songId,
            index + 1,
            item.sourceType ?? null,
            item.sourceId ?? null,
          ],
        );
      }
    });

    response.json({
      message: 'Cola actualizada correctamente',
    });
  }),
);

router.delete(
  '/queue/:id',
  asyncHandler(async (request, response) => {
    const queueId = uuidSchema.parse(request.params.id);

    await withTransaction(async (client) => {
      const current = await client.query<{ position: number }>(
        `
          SELECT position
          FROM user_queue
          WHERE id = $1 AND user_id = $2
          LIMIT 1
        `,
        [queueId, request.user!.id],
      );

      const row = current.rows[0];

      if (!row) {
        throw new ApiError(404, 'Elemento de cola no encontrado');
      }

      await client.query(`DELETE FROM user_queue WHERE id = $1 AND user_id = $2`, [
        queueId,
        request.user!.id,
      ]);

      await client.query(
        `
          UPDATE user_queue
          SET position = position - 1
          WHERE user_id = $1
            AND position > $2
        `,
        [request.user!.id, row.position],
      );
    });

    response.status(204).send();
  }),
);

router.get(
  '/player-state',
  asyncHandler(async (request, response) => {
    const result = await query(
      `
        SELECT
          ps.user_id AS "userId",
          ps.position_s AS "positionS",
          ps.repeat,
          ps.shuffle,
          ps.volume,
          ps.updated_at AS "updatedAt",
          CASE
            WHEN s.id IS NULL THEN NULL
            ELSE json_build_object(
              'id', s.id,
              'title', s.title,
              'artworkUrl', COALESCE(s.cover_url, al.cover_url),
              'cdnUrl', s.cdn_url,
              'previewUrl', s.preview_url,
              'durationS', s.duration_s,
              'artist', json_build_object(
                'id', ar.id,
                'name', ar.name
              )
            )
          END AS "currentSong"
        FROM player_state ps
        LEFT JOIN songs s ON s.id = ps.current_song_id
        LEFT JOIN artists ar ON ar.id = s.artist_id
        LEFT JOIN albums al ON al.id = s.album_id
        WHERE ps.user_id = $1
        LIMIT 1
      `,
      [request.user!.id],
    );

    response.json({
      data:
        result.rows[0] ?? {
          userId: request.user!.id,
          positionS: 0,
          repeat: 'none',
          shuffle: false,
          volume: 1,
          currentSong: null,
        },
    });
  }),
);

router.put(
  '/player-state',
  asyncHandler(async (request, response) => {
    const payload = playerStateSchema.parse(request.body);

    await query(
      `
        INSERT INTO player_state (
          user_id,
          current_song_id,
          position_s,
          repeat,
          shuffle,
          volume
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id)
        DO UPDATE SET
          current_song_id = EXCLUDED.current_song_id,
          position_s = EXCLUDED.position_s,
          repeat = EXCLUDED.repeat,
          shuffle = EXCLUDED.shuffle,
          volume = EXCLUDED.volume,
          updated_at = NOW()
      `,
      [
        request.user!.id,
        payload.currentSongId ?? null,
        payload.positionS,
        payload.repeat,
        payload.shuffle,
        payload.volume,
      ],
    );

    response.json({
      message: 'Estado del reproductor actualizado',
    });
  }),
);

router.get(
  '/history',
  asyncHandler(async (request, response) => {
    const pagination = paginationSchema.parse(request.query);

    const countResult = await query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM listening_history
        WHERE user_id = $1
      `,
      [request.user!.id],
    );

    const result = await query(
      `
        SELECT
          lh.id AS "historyId",
          lh.listened_at AS "listenedAt",
          lh.duration_s AS "listenedDurationS",
          lh.completed,
          lh.source_type AS "sourceType",
          lh.mood_id AS "moodId",
          ${songSelect(
            'EXISTS (SELECT 1 FROM liked_songs ls WHERE ls.song_id = s.id AND ls.user_id = $1)',
          )}
        FROM listening_history lh
        JOIN songs s ON s.id = lh.song_id
        JOIN artists ar ON ar.id = s.artist_id
        LEFT JOIN albums al ON al.id = s.album_id
        WHERE lh.user_id = $1
        ORDER BY lh.listened_at DESC
        LIMIT $2 OFFSET $3
      `,
      [request.user!.id, pagination.limit, pagination.offset],
    );

    response.json({
      data: result.rows,
      meta: buildPaginationMeta(
        pagination.limit,
        pagination.offset,
        countResult.rows[0]?.total ?? 0,
      ),
    });
  }),
);

router.post(
  '/history',
  asyncHandler(async (request, response) => {
    const payload = historyBodySchema.parse(request.body);

    const result = await query(
      `
        INSERT INTO listening_history (
          user_id,
          song_id,
          duration_s,
          completed,
          source_type,
          mood_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, listened_at AS "listenedAt"
      `,
      [
        request.user!.id,
        payload.songId,
        payload.durationS,
        payload.completed,
        payload.sourceType ?? null,
        payload.moodId ?? null,
      ],
    );

    response.status(201).json({
      data: result.rows[0],
    });
  }),
);

router.get(
  '/recommendations',
  asyncHandler(async (request, response) => {
    const filters = recommendationQuerySchema.parse(request.query);

    const recommendationRows = await query(
      `
        SELECT
          sim.score AS "recommendationScore",
          ${songSelect(
            'EXISTS (SELECT 1 FROM liked_songs ls WHERE ls.song_id = s.id AND ls.user_id = $1)',
          )}
        FROM similarity sim
        JOIN songs s ON s.id = sim.song_id
        JOIN artists ar ON ar.id = s.artist_id
        LEFT JOIN albums al ON al.id = s.album_id
        WHERE sim.user_id = $1
        ORDER BY sim.score DESC
        LIMIT $2
      `,
      [request.user!.id, filters.limit],
    );

    if (recommendationRows.rows.length > 0) {
      response.json({
        data: recommendationRows.rows,
        meta: {
          source: 'similarity',
          count: recommendationRows.rows.length,
        },
      });
      return;
    }

    const moodId =
      filters.moodId ??
      (
        await query<{ moodId: string }>(
          `
            SELECT mood_id AS "moodId"
            FROM user_mood_sessions
            WHERE user_id = $1
            ORDER BY COALESCE(ended_at, NOW()) DESC, started_at DESC
            LIMIT 1
          `,
          [request.user!.id],
        )
      ).rows[0]?.moodId;

    if (!moodId) {
      response.json({
        data: [],
        meta: {
          source: 'none',
          count: 0,
        },
      });
      return;
    }

    const fallbackRows = await query(
      `
        SELECT
          sm.score AS "recommendationScore",
          ${songSelect(
            'EXISTS (SELECT 1 FROM liked_songs ls WHERE ls.song_id = s.id AND ls.user_id = $1)',
          )}
        FROM song_moods sm
        JOIN songs s ON s.id = sm.song_id
        JOIN artists ar ON ar.id = s.artist_id
        LEFT JOIN albums al ON al.id = s.album_id
        WHERE sm.mood_id = $2
          AND s.streamable = TRUE
        ORDER BY sm.score DESC, s.play_count DESC
        LIMIT $3
      `,
      [request.user!.id, moodId, filters.limit],
    );

    response.json({
      data: fallbackRows.rows,
      meta: {
        source: 'mood',
        moodId,
        count: fallbackRows.rows.length,
      },
    });
  }),
);

router.get(
  '/notifications',
  asyncHandler(async (request, response) => {
    const pagination = paginationSchema.parse(request.query);

    const countResult = await query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM notifications
        WHERE user_id = $1
      `,
      [request.user!.id],
    );

    const result = await query(
      `
        SELECT
          id,
          type,
          title,
          content,
          is_read AS "isRead",
          deep_link AS "deepLink",
          created_at AS "createdAt"
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [request.user!.id, pagination.limit, pagination.offset],
    );

    response.json({
      data: result.rows,
      meta: buildPaginationMeta(
        pagination.limit,
        pagination.offset,
        countResult.rows[0]?.total ?? 0,
      ),
    });
  }),
);

router.patch(
  '/notifications/:id/read',
  asyncHandler(async (request, response) => {
    const notificationId = uuidSchema.parse(request.params.id);

    const result = await query(
      `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [notificationId, request.user!.id],
    );

    if (!result.rows[0]) {
      throw new ApiError(404, 'Notificación no encontrada');
    }

    response.json({
      message: 'Notificación marcada como leída',
    });
  }),
);

router.get(
  '/subscription',
  asyncHandler(async (request, response) => {
    const profile = await loadProfile(request.user!.id);

    response.json({
      data: profile?.subscription ?? null,
    });
  }),
);

export default router;

