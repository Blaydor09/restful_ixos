import { Router } from 'express';
import { ListeningHistoryController } from '../controllers';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET listening history
router.get('/', ListeningHistoryController.getHistory);

// GET recent moods
router.get('/moods/recent', ListeningHistoryController.getRecentMoods);

// GET top songs
router.get('/songs/top', ListeningHistoryController.getTopSongs);

// GET total listening time
router.get('/stats/time', ListeningHistoryController.getTotalListeningTime);

// POST add to history
router.post('/', ListeningHistoryController.addToHistory);

export default router;
