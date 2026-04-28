import { Router } from 'express';
import { z } from 'zod';

import { query } from '../db/pool';
import { songSelect } from '../services/sql-fragments';
import { asyncHandler } from '../utils/async-handler';
import { buildPaginationMeta, paginationSchema } from '../utils/pagination';
import { ApiError } from '../utils/api-error';

const router = Router();
const uuidSchema = z.uuid();

const songsQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
  artistId: uuidSchema.optional(),
  albumId: uuidSchema.optional(),
  genreId: uuidSchema.optional(),
  moodId: uuidSchema.optional(),
  sort: z.enum(['popular', 'newest', 'title']).default('popular'),
});

const artistsQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
  country: z.string().trim().regex(/^[A-Za-z]{2}$/).optional(),
  sort: z.enum(['popular', 'name', 'newest']).default('popular'),
});

const albumsQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
  artistId: uuidSchema.optional(),
  sort: z.enum(['newest', 'title']).default('newest'),
});

const idParamsSchema = z.object({
  id: uuidSchema,
});

router.get(
  '/home',
  asyncHandler(async (_request, response) => {
    const [trendingSongs, moods, publicPlaylists, artists, plans] = await Promise.all([
      query(
        `
          SELECT ${songSelect()}
          FROM songs s
          JOIN artists ar ON ar.id = s.artist_id
          LEFT JOIN albums al ON al.id = s.album_id
          WHERE s.streamable = TRUE
          ORDER BY s.play_count DESC, s.created_at DESC
          LIMIT 12
        `,
      ),
      query(
        `
          SELECT
            m.*,
            COUNT(sm.song_id)::int AS "songCount"
          FROM moods m
          LEFT JOIN song_moods sm ON sm.mood_id = m.id
          GROUP BY m.id
          ORDER BY m.sort_order ASC, m.display_name ASC
        `,
      ),
      query(
        `
          SELECT
            p.id,
            p.name,
            p.description,
            p.cover_url AS "coverUrl",
            p.visibility,
            p.total_songs AS "totalSongs",
            p.total_duration_s AS "totalDurationS",
            json_build_object(
              'id', u.id,
              'username', u.username,
              'displayName', COALESCE(u.display_name, u.username),
              'avatarUrl', u.avatar_url
            ) AS owner
          FROM playlists p
          JOIN users u ON u.id = p.owner_id
          WHERE p.visibility = 'public'
          ORDER BY p.updated_at DESC
          LIMIT 8
        `,
      ),
      query(
        `
          SELECT
            id,
            name,
            bio,
            image_url AS "imageUrl",
            verified,
            monthly_listeners AS "monthlyListeners"
          FROM artists
          ORDER BY monthly_listeners DESC, created_at DESC
          LIMIT 8
        `,
      ),
      query(
        `
          SELECT
            id,
            name,
            price_usd AS "priceUsd",
            description,
            features
          FROM subscription_plans
          WHERE is_active = TRUE
          ORDER BY price_usd ASC
        `,
      ),
    ]);

    response.json({
      data: {
        trendingSongs: trendingSongs.rows,
        moods: moods.rows,
        playlists: publicPlaylists.rows,
        featuredArtists: artists.rows,
        plans: plans.rows,
      },
    });
  }),
);

router.get(
  '/songs',
  asyncHandler(async (request, response) => {
    const filters = songsQuerySchema.parse(request.query);
    const where: string[] = ['s.streamable = TRUE'];
    const params: unknown[] = [];

    if (filters.artistId) {
      params.push(filters.artistId);
      where.push(`s.artist_id = $${params.length}`);
    }

    if (filters.albumId) {
      params.push(filters.albumId);
      where.push(`s.album_id = $${params.length}`);
    }

    if (filters.genreId) {
      params.push(filters.genreId);
      where.push(
        `EXISTS (
          SELECT 1
          FROM song_genres sg
          WHERE sg.song_id = s.id
            AND sg.genre_id = $${params.length}
        )`,
      );
    }

    if (filters.moodId) {
      params.push(filters.moodId);
      where.push(
        `EXISTS (
          SELECT 1
          FROM song_moods sm
          WHERE sm.song_id = s.id
            AND sm.mood_id = $${params.length}
        )`,
      );
    }

    if (filters.search) {
      params.push(filters.search);
      where.push(
        `(
          unaccent(s.title) ILIKE '%' || unaccent($${params.length}) || '%'
          OR unaccent(ar.name) ILIKE '%' || unaccent($${params.length}) || '%'
          OR s.search_vector @@ websearch_to_tsquery('spanish', unaccent($${params.length}))
        )`,
      );
    }

    const orderBy =
      filters.sort === 'title'
        ? 's.title ASC'
        : filters.sort === 'newest'
          ? 's.created_at DESC'
          : 's.play_count DESC, s.created_at DESC';

    const countResult = await query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM songs s
        JOIN artists ar ON ar.id = s.artist_id
        LEFT JOIN albums al ON al.id = s.album_id
        WHERE ${where.join(' AND ')}
      `,
      params,
    );

    const dataParams = [...params, filters.limit, filters.offset];
    const limitPosition = dataParams.length - 1;
    const offsetPosition = dataParams.length;

    const songs = await query(
      `
        SELECT ${songSelect()}
        FROM songs s
        JOIN artists ar ON ar.id = s.artist_id
        LEFT JOIN albums al ON al.id = s.album_id
        WHERE ${where.join(' AND ')}
        ORDER BY ${orderBy}
        LIMIT $${limitPosition} OFFSET $${offsetPosition}
      `,
      dataParams,
    );

    response.json({
      data: songs.rows,
      meta: buildPaginationMeta(filters.limit, filters.offset, countResult.rows[0]?.total ?? 0),
    });
  }),
);

router.get(
  '/songs/:id',
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);

    const result = await query(
      `
        SELECT ${songSelect()}
        FROM songs s
        JOIN artists ar ON ar.id = s.artist_id
        LEFT JOIN albums al ON al.id = s.album_id
        WHERE s.id = $1
          AND s.streamable = TRUE
        LIMIT 1
      `,
      [id],
    );

    const song = result.rows[0];

    if (!song) {
      throw new ApiError(404, 'Canción no encontrada');
    }

    response.json({
      data: song,
    });
  }),
);

router.get(
  '/artists',
  asyncHandler(async (request, response) => {
    const filters = artistsQuerySchema.parse(request.query);
    const where: string[] = ['1 = 1'];
    const params: unknown[] = [];

    if (filters.search) {
      params.push(filters.search);
      where.push(
        `(
          unaccent(name) ILIKE '%' || unaccent($${params.length}) || '%'
          OR search_vector @@ websearch_to_tsquery('spanish', unaccent($${params.length}))
        )`,
      );
    }

    if (filters.country) {
      params.push(filters.country.toUpperCase());
      where.push(`country = $${params.length}`);
    }

    const orderBy =
      filters.sort === 'name'
        ? 'name ASC'
        : filters.sort === 'newest'
          ? 'created_at DESC'
          : 'monthly_listeners DESC, created_at DESC';

    const countResult = await query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM artists
        WHERE ${where.join(' AND ')}
      `,
      params,
    );

    const artists = await query(
      `
        SELECT
          id,
          name,
          bio,
          image_url AS "imageUrl",
          country,
          verified,
          monthly_listeners AS "monthlyListeners",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM artists
        WHERE ${where.join(' AND ')}
        ORDER BY ${orderBy}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, filters.limit, filters.offset],
    );

    response.json({
      data: artists.rows,
      meta: buildPaginationMeta(filters.limit, filters.offset, countResult.rows[0]?.total ?? 0),
    });
  }),
);

router.get(
  '/artists/:id',
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);

    const [artistResult, topSongsResult, albumsResult] = await Promise.all([
      query(
        `
          SELECT
            id,
            name,
            bio,
            image_url AS "imageUrl",
            country,
            verified,
            monthly_listeners AS "monthlyListeners",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
          FROM artists
          WHERE id = $1
          LIMIT 1
        `,
        [id],
      ),
      query(
        `
          SELECT ${songSelect()}
          FROM songs s
          JOIN artists ar ON ar.id = s.artist_id
          LEFT JOIN albums al ON al.id = s.album_id
          WHERE s.artist_id = $1
            AND s.streamable = TRUE
          ORDER BY s.play_count DESC, s.created_at DESC
          LIMIT 10
        `,
        [id],
      ),
      query(
        `
          SELECT
            id,
            title,
            release_date AS "releaseDate",
            release_year AS "releaseYear",
            cover_url AS "coverUrl",
            total_tracks AS "totalTracks",
            label,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
          FROM albums
          WHERE artist_id = $1
          ORDER BY release_date DESC NULLS LAST, created_at DESC
        `,
        [id],
      ),
    ]);

    const artist = artistResult.rows[0];

    if (!artist) {
      throw new ApiError(404, 'Artista no encontrado');
    }

    response.json({
      data: {
        ...artist,
        topSongs: topSongsResult.rows,
        albums: albumsResult.rows,
      },
    });
  }),
);

router.get(
  '/albums',
  asyncHandler(async (request, response) => {
    const filters = albumsQuerySchema.parse(request.query);
    const where: string[] = ['1 = 1'];
    const params: unknown[] = [];

    if (filters.artistId) {
      params.push(filters.artistId);
      where.push(`al.artist_id = $${params.length}`);
    }

    if (filters.search) {
      params.push(filters.search);
      where.push(
        `(
          unaccent(al.title) ILIKE '%' || unaccent($${params.length}) || '%'
          OR unaccent(ar.name) ILIKE '%' || unaccent($${params.length}) || '%'
          OR al.search_vector @@ websearch_to_tsquery('spanish', unaccent($${params.length}))
        )`,
      );
    }

    const countResult = await query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM albums al
        JOIN artists ar ON ar.id = al.artist_id
        WHERE ${where.join(' AND ')}
      `,
      params,
    );

    const albums = await query(
      `
        SELECT
          al.id,
          al.title,
          al.release_date AS "releaseDate",
          al.release_year AS "releaseYear",
          al.cover_url AS "coverUrl",
          al.total_tracks AS "totalTracks",
          al.label,
          al.created_at AS "createdAt",
          al.updated_at AS "updatedAt",
          json_build_object(
            'id', ar.id,
            'name', ar.name,
            'imageUrl', ar.image_url
          ) AS artist
        FROM albums al
        JOIN artists ar ON ar.id = al.artist_id
        WHERE ${where.join(' AND ')}
        ORDER BY ${
          filters.sort === 'title'
            ? 'al.title ASC'
            : 'al.release_date DESC NULLS LAST, al.created_at DESC'
        }
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, filters.limit, filters.offset],
    );

    response.json({
      data: albums.rows,
      meta: buildPaginationMeta(filters.limit, filters.offset, countResult.rows[0]?.total ?? 0),
    });
  }),
);

router.get(
  '/albums/:id',
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);

    const [albumResult, songsResult] = await Promise.all([
      query(
        `
          SELECT
            al.id,
            al.title,
            al.release_date AS "releaseDate",
            al.release_year AS "releaseYear",
            al.cover_url AS "coverUrl",
            al.total_tracks AS "totalTracks",
            al.label,
            al.created_at AS "createdAt",
            al.updated_at AS "updatedAt",
            json_build_object(
              'id', ar.id,
              'name', ar.name,
              'imageUrl', ar.image_url
            ) AS artist
          FROM albums al
          JOIN artists ar ON ar.id = al.artist_id
          WHERE al.id = $1
          LIMIT 1
        `,
        [id],
      ),
      query(
        `
          SELECT ${songSelect()}
          FROM songs s
          JOIN artists ar ON ar.id = s.artist_id
          LEFT JOIN albums al ON al.id = s.album_id
          WHERE s.album_id = $1
          ORDER BY s.track_number ASC NULLS LAST, s.title ASC
        `,
        [id],
      ),
    ]);

    const album = albumResult.rows[0];

    if (!album) {
      throw new ApiError(404, 'Álbum no encontrado');
    }

    response.json({
      data: {
        ...album,
        songs: songsResult.rows,
      },
    });
  }),
);

router.get(
  '/genres',
  asyncHandler(async (_request, response) => {
    const result = await query(
      `
        SELECT
          g.id,
          g.name,
          g.description,
          g.color_hex AS "colorHex",
          g.icon_name AS "iconName",
          COUNT(sg.song_id)::int AS "songCount"
        FROM genres g
        LEFT JOIN song_genres sg ON sg.genre_id = g.id
        GROUP BY g.id
        ORDER BY g.name ASC
      `,
    );

    response.json({
      data: result.rows,
    });
  }),
);

router.get(
  '/moods',
  asyncHandler(async (_request, response) => {
    const result = await query(
      `
        SELECT
          m.id,
          m.name,
          m.display_name AS "displayName",
          m.description,
          m.icon_name AS "iconName",
          m.gradient_start AS "gradientStart",
          m.gradient_end AS "gradientEnd",
          m.sort_order AS "sortOrder",
          m.energy_min AS "energyMin",
          m.energy_max AS "energyMax",
          m.valence_min AS "valenceMin",
          m.valence_max AS "valenceMax",
          m.bpm_min AS "bpmMin",
          m.bpm_max AS "bpmMax",
          COUNT(sm.song_id)::int AS "songCount"
        FROM moods m
        LEFT JOIN song_moods sm ON sm.mood_id = m.id
        GROUP BY m.id
        ORDER BY m.sort_order ASC, m.display_name ASC
      `,
    );

    response.json({
      data: result.rows,
    });
  }),
);

router.get(
  '/plans',
  asyncHandler(async (_request, response) => {
    const result = await query(
      `
        SELECT
          id,
          name,
          price_usd AS "priceUsd",
          description,
          features,
          is_active AS "isActive",
          created_at AS "createdAt"
        FROM subscription_plans
        WHERE is_active = TRUE
        ORDER BY price_usd ASC
      `,
    );

    response.json({
      data: result.rows,
    });
  }),
);

export default router;

