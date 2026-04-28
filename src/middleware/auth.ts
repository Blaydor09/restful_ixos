import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/api-error';
import { verifyAccessToken } from '../utils/auth';

function extractBearerToken(request: Request): string | null {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'El header Authorization debe usar Bearer token');
  }

  return token;
}

function createAuthMiddleware(required: boolean) {
  return (request: Request, _response: Response, next: NextFunction) => {
    try {
      const token = extractBearerToken(request);

      if (!token) {
        if (!required) {
          next();
          return;
        }

        throw new ApiError(401, 'Debes iniciar sesión para acceder a este recurso');
      }

      request.user = verifyAccessToken(token);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const authenticate = createAuthMiddleware(true);
export const requireAuth = authenticate;
export const optionalAuthenticate = createAuthMiddleware(false);

