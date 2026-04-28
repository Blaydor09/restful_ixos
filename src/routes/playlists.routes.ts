import { Router } from 'express';
import { PlaylistController } from '../controllers';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', PlaylistController.getAll);
router.get('/user/my-playlists', requireAuth, PlaylistController.getByUser);
router.get('/:id', PlaylistController.getById);

// Protected routes
router.use(requireAuth);

router.post('/', PlaylistController.create);
router.put('/:id', PlaylistController.update);
router.delete('/:id', PlaylistController.delete);

// Playlist songs
router.post('/:id/songs', PlaylistController.addSong);
router.patch('/:id/songs/reorder', PlaylistController.reorderSong);
router.delete('/:id/songs/:songId', PlaylistController.removeSong);

export default router;
