import { Router } from 'express';

import authRoutes from './auth.routes';
import artistsRoutes from './artists.routes';
import catalogRoutes from './catalog.routes';
import downloadsRoutes from './downloads.routes';
import likedSongsRoutes from './liked-songs.routes';
import listeningHistoryRoutes from './listening-history.routes';
import meRoutes from './me.routes';
import moodsRoutes from './moods.routes';
import playerStateRoutes from './player-state.routes';
import playlistsRoutes from './playlists.routes';
import searchRoutes from './search.routes';
import songsRoutes from './songs.routes';

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
      songs: '/api/v1/songs',
      artists: '/api/v1/artists',
      moods: '/api/v1/moods',
      search: '/api/v1/search',
      playlists: '/api/v1/playlists',
      likedSongs: '/api/v1/liked-songs',
      downloads: '/api/v1/downloads',
      playerState: '/api/v1/player-state',
      listeningHistory: '/api/v1/listening-history',
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
router.use('/api/v1/songs', songsRoutes);
router.use('/api/v1/artists', artistsRoutes);
router.use('/api/v1/moods', moodsRoutes);
router.use('/api/v1/search', searchRoutes);
router.use('/api/v1/playlists', playlistsRoutes);
router.use('/api/v1/liked-songs', likedSongsRoutes);
router.use('/api/v1/downloads', downloadsRoutes);
router.use('/api/v1/player-state', playerStateRoutes);
router.use('/api/v1/listening-history', listeningHistoryRoutes);
router.use('/api/v1/me', meRoutes);

export default router;
