import { Router } from 'express';
import { LikedSongController } from '../controllers';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET user's liked songs
router.get('/', LikedSongController.getLikedSongs);

// GET is song liked
router.get('/:songId', LikedSongController.isLiked);

// POST add liked song
router.post('/', LikedSongController.addLikedSong);

// DELETE remove liked song
router.delete('/:songId', LikedSongController.removeLikedSong);

export default router;
