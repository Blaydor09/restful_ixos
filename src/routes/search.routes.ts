import { Router } from 'express';
import { z } from 'zod';

import { query } from '../db/pool';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

const searchSchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const { q, limit } = searchSchema.parse(request.query);

    const result = await query(
      `
        SELECT
          entity_type AS "entityType",
          entity_id AS "entityId",
          primary_text AS "primaryText",
          secondary_text AS "secondaryText",
          image_url AS "imageUrl",
          popularity
        FROM search_index
        WHERE
          sv @@ websearch_to_tsquery('spanish', unaccent($1))
          OR unaccent(primary_text) ILIKE '%' || unaccent($1) || '%'
          OR COALESCE(unaccent(secondary_text), '') ILIKE '%' || unaccent($1) || '%'
        ORDER BY
          CASE
            WHEN unaccent(primary_text) ILIKE unaccent($1) || '%' THEN 0
            ELSE 1
          END,
          popularity DESC,
          primary_text ASC
        LIMIT $2
      `,
      [q, limit],
    );

    response.json({
      data: result.rows,
      meta: {
        query: q,
        count: result.rows.length,
      },
    });
  }),
);

export default router;

