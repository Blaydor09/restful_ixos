import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env';
import { ApiError } from '../utils/api-error';

export function notFoundHandler(_request: Request, response: Response) {
  response.status(404).json({
    error: {
      message: 'Ruta no encontrada',
    },
  });
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        message: 'Datos inválidos',
        details: error.flatten(),
      },
    });
    return;
  }

  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  if (typeof error === 'object' && error !== null && 'code' in error) {
    const databaseError = error as { code?: string; detail?: string };

    if (databaseError.code === '23505') {
      response.status(409).json({
        error: {
          message: 'El recurso ya existe o viola una restricción única',
          details: databaseError.detail,
        },
      });
      return;
    }

    if (databaseError.code === '23503') {
      response.status(400).json({
        error: {
          message: 'La relación solicitada no existe en la base de datos',
          details: databaseError.detail,
        },
      });
      return;
    }

    if (databaseError.code === '22P02') {
      response.status(400).json({
        error: {
          message: 'Algún identificador tiene un formato inválido',
          details: databaseError.detail,
        },
      });
      return;
    }
  }

  if (env.NODE_ENV !== 'test') {
    console.error(error);
  }

  response.status(500).json({
    error: {
      message: 'Ocurrió un error interno en el servidor',
    },
  });
}

