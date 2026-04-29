import cors, { CorsOptions } from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import type { NextFunction, Request, Response } from 'express';

import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import routes from './routes';

function normalizeIncomingUrl(request: Request, _response: Response, next: NextFunction) {
  const [rawPath, query] = request.url.split('?', 2);
  const path = rawPath ?? request.url;
  const normalizedPath = path.replace(/\/{2,}/g, '/');

  if (normalizedPath !== path) {
    const normalizedUrl = query ? `${normalizedPath}?${query}` : normalizedPath;
    request.url = normalizedUrl;
    (request as Request & { originalUrl?: string }).originalUrl = normalizedUrl;
  }

  next();
}

function patternToRegExp(pattern: string) {
  const escaped = pattern.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\*/g, '.*')}$`, 'i');
}

function isAllowedOrigin(origin: string) {
  return env.CORS_ORIGIN.some((allowedOrigin) => {
    if (allowedOrigin === '*' || allowedOrigin === origin) {
      return true;
    }

    return allowedOrigin.includes('*') && patternToRegExp(allowedOrigin).test(origin);
  });
}

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origen bloqueado por CORS'));
  },
};

export const app = express();

app.use(normalizeIncomingUrl);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);
