import { Router } from 'express';
import { ArtistController } from '../controllers';

const router = Router();

// GET all artists
router.get('/', ArtistController.getAll);

// GET artist by ID
router.get('/:id', ArtistController.getById);

// POST create artist
router.post('/', ArtistController.create);

// PUT update artist
router.put('/:id', ArtistController.update);

// DELETE artist
router.delete('/:id', ArtistController.delete);

export default router;
