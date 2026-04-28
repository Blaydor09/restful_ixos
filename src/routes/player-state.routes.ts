import { Router } from 'express';
import { PlayerStateController } from '../controllers';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET player state
router.get('/', PlayerStateController.getPlayerState);

// POST update player state
router.post('/', PlayerStateController.updatePlayerState);

// POST set current song
router.post('/song', PlayerStateController.setCurrentSong);

// POST set repeat mode
router.post('/repeat', PlayerStateController.setRepeatMode);

// POST set shuffle
router.post('/shuffle', PlayerStateController.setShuffle);

// POST set position
router.post('/position', PlayerStateController.setPosition);

export default router;
