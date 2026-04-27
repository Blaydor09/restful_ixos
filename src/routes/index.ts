import { Router } from 'express';

import authRoutes from './auth.routes';
import catalogRoutes from './catalog.routes';
import meRoutes from './me.routes';
import playlistsRoutes from './playlists.routes';
import searchRoutes from './search.routes';

const router = Router();

router.get('/', (_request, response) => {
  response.json({
    service: 'Mood Music API',
    version: 'v1',
    status: 'ok',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      catalog: '/api/v1/catalog',
      search: '/api/v1/search',
      playlists: '/api/v1/playlists',
      me: '/api/v1/me',
    },
  });
});

router.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/catalog', catalogRoutes);
router.use('/api/v1/playlists', playlistsRoutes);
router.use('/api/v1/me', meRoutes);
router.use('/api/v1/search', searchRoutes);

export default router;
