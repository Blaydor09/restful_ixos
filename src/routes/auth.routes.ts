import { Router } from 'express';
import { z } from 'zod';

import { withTransaction } from '../db/pool';
import { asyncHandler } from '../utils/async-handler';
import {
  comparePassword,
  getTokenExpiration,
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/auth';
import { ApiError } from '../utils/api-error';

const router = Router();

const registerSchema = z.object({
  username: z.string().trim().min(3).max(40),
  email: z.email(),
  password: z.string().min(8).max(100),
  displayName: z.string().trim().min(1).max(80).optional(),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  password: z.string().min(8).max(100),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

type BasicUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
};

async function storeRefreshToken(
  client: {
    query: <T>(text: string, params?: unknown[]) => Promise<{ rows: T[] }>;
  },
  userId: string,
  refreshToken: string,
  userAgent?: string,
  ipAddress?: string,
) {
  await client.query(
    `
      INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      userId,
      hashToken(refreshToken),
      userAgent ?? null,
      ipAddress ?? null,
      getTokenExpiration(refreshToken),
    ],
  );
}

router.post(
  '/register',
  asyncHandler(async (request, response) => {
    const payload = registerSchema.parse(request.body);

    const result = await withTransaction(async (client) => {
      const passwordHash = await hashPassword(payload.password);

      const createdUser = await client.query<BasicUser>(
        `
          INSERT INTO users (username, email, display_name, password_hash, last_login_at)
          VALUES ($1, $2, $3, $4, NOW())
          RETURNING
            id,
            username,
            email,
            password_hash,
            COALESCE(display_name, username) AS "displayName",
            avatar_url AS "avatarUrl",
            created_at AS "createdAt"
        `,
        [payload.username, payload.email, payload.displayName ?? payload.username, passwordHash],
      );

      const user = createdUser.rows[0];

      if (!user) {
        throw new ApiError(500, 'No se pudo crear el usuario');
      }

      // await client.query(
      //   `
      //     INSERT INTO user_preferences (user_id)
      //     VALUES ($1)
      //     ON CONFLICT (user_id) DO NOTHING
      //   `,
      //   [user.id],
      // );

      // const freePlan = await client.query<{ id: string }>(
      //   `
      //     SELECT id
      //     FROM subscription_plans
      //     WHERE price_usd = 0 AND is_active = TRUE
      //     ORDER BY created_at ASC
      //     LIMIT 1
      //   `,
      // );

      // if (freePlan.rows[0]) {
      //   await client.query(
      //     `
      //       INSERT INTO user_subscriptions (user_id, plan_id)
      //       VALUES ($1, $2)
      //     `,
      //     [user.id, freePlan.rows[0].id],
      //   );
      // }

      const authUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      // const accessToken = signAccessToken(authUser);
      // const refreshToken = signRefreshToken(authUser);

      // await storeRefreshToken(
      //   client,
      //   user.id,
      //   refreshToken,
      //   request.get('user-agent'),
      //   request.ip,
      // );

      return {
        user
      };
    });

    response.status(201).json(result);
  }),
);

router.post(
  '/login',
  asyncHandler(async (request, response) => {
    const payload = loginSchema.parse(request.body);

    //identificador es correo o usuario
    const result = await withTransaction(async (client) => {
      const userResult = await client.query<
        BasicUser & {
          passwordHash: string | null;
        }
      >(
        `
          SELECT
            id,
            username,
            email,
            COALESCE(display_name, username) AS "displayName",
            avatar_url AS "avatarUrl",
            created_at AS "createdAt",
            password_hash AS "passwordHash"
          FROM users
          WHERE lower(email) = lower($1) OR lower(username) = lower($1)
          LIMIT 1
        `,
        [payload.identifier],
      );

      const user = userResult.rows[0];

      if (!user?.passwordHash) {
        throw new ApiError(401, 'Credenciales inválidas');
      }

      const passwordMatches = await comparePassword(payload.password, user.passwordHash);

      if (!passwordMatches) {
        throw new ApiError(401, 'Credenciales inválidas');
      }

      await client.query(
        `
          UPDATE users
          SET last_login_at = NOW()
          WHERE id = $1
        `,
        [user.id],
      );

      await client.query(
        `
          DELETE FROM refresh_tokens
          WHERE user_id = $1
            AND (expires_at <= NOW() OR revoked_at IS NOT NULL)
        `,
        [user.id],
      );

      const authUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      const accessToken = signAccessToken(authUser);
      const refreshToken = signRefreshToken(authUser);

      await storeRefreshToken(
        client,
        user.id,
        refreshToken,
        request.get('user-agent'),
        request.ip,
      );

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      };
    });

    response.json(result);
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (request, response) => {
    const payload = refreshSchema.parse(request.body);
    const refreshUser = verifyRefreshToken(payload.refreshToken);

    const result = await withTransaction(async (client) => {
      const storedToken = await client.query<{ id: string }>(
        `
          SELECT id
          FROM refresh_tokens
          WHERE token_hash = $1
            AND user_id = $2
            AND revoked_at IS NULL
            AND expires_at > NOW()
          LIMIT 1
        `,
        [hashToken(payload.refreshToken), refreshUser.id],
      );

      if (!storedToken.rows[0]) {
        throw new ApiError(401, 'El refresh token ya no es válido');
      }

      await client.query(
        `
          UPDATE refresh_tokens
          SET revoked_at = NOW()
          WHERE id = $1
        `,
        [storedToken.rows[0].id],
      );

      const userResult = await client.query<BasicUser>(
        `
          SELECT
            id,
            username,
            email,
            COALESCE(display_name, username) AS "displayName",
            avatar_url AS "avatarUrl",
            created_at AS "createdAt"
          FROM users
          WHERE id = $1
          LIMIT 1
        `,
        [refreshUser.id],
      );

      const user = userResult.rows[0];

      if (!user) {
        throw new ApiError(404, 'El usuario ya no existe');
      }

      const authUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      const accessToken = signAccessToken(authUser);
      const refreshToken = signRefreshToken(authUser);

      await storeRefreshToken(
        client,
        user.id,
        refreshToken,
        request.get('user-agent'),
        request.ip,
      );

      return {
        user,
        accessToken,
        refreshToken,
      };
    });

    response.json(result);
  }),
);

router.post(
  '/logout',
  asyncHandler(async (request, response) => {
    const payload = refreshSchema.parse(request.body);

    await withTransaction(async (client) => {
      await client.query(
        `
          UPDATE refresh_tokens
          SET revoked_at = NOW()
          WHERE token_hash = $1
            AND revoked_at IS NULL
        `,
        [hashToken(payload.refreshToken)],
      );
    });

    response.status(204).send();
  }),
);

export default router;

