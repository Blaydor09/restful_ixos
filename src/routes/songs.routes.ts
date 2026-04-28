import { Router } from 'express';
import { SongController } from '../controllers';

const router = Router();

// GET all songs
router.get('/', SongController.getAll);

// GET search songs
router.get('/search', SongController.search);

// GET song by ID
router.get('/:id', SongController.getById);

// GET artist songs
router.get('/artist/:artistId', SongController.getByArtist);

// POST create song
router.post('/', SongController.create);

// PUT update song
router.put('/:id', SongController.update);

// DELETE song
router.delete('/:id', SongController.delete);

// Song Genres
router.get('/:id/genres', SongController.getGenres);
router.post('/:id/genres', SongController.addGenre);
router.delete('/:id/genres/:genreId', SongController.removeGenre);

// Song Moods
router.get('/:id/moods', SongController.getMoods);
router.post('/:id/moods', SongController.addMood);
router.delete('/:id/moods/:moodId', SongController.removeMood);

export default router;
