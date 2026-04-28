import { Router } from 'express';
import { MoodController } from '../controllers';

const router = Router();

// GET all moods
router.get('/', MoodController.getAll);

// GET mood by ID
router.get('/:id', MoodController.getById);

// GET songs by mood
router.get('/:id/songs', MoodController.getSongs);

// POST create mood
router.post('/', MoodController.create);

// PUT update mood
router.put('/:id', MoodController.update);

// DELETE mood
router.delete('/:id', MoodController.delete);

export default router;
