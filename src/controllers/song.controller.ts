import { Request, Response } from 'express';
import { z } from 'zod';
import { songService, moodService, songRelationService } from '../services';
import { asyncHandler } from '../utils/async-handler';
import { pagination } from '../utils/pagination';

const createSongSchema = z.object({
  fileId: z.string().trim().min(1),
  filePath: z.string().trim().min(1),
  cdnUrl: z.string().url().optional(),
  title: z.string().trim().min(1).max(255),
  artistId: z.string().uuid(),
  albumId: z.string().uuid().optional(),
  coverUrl: z.string().url().optional(),
  releaseYear: z.number().int().min(1900).max(2100).optional(),
  durationS: z.number().positive(),
  explicit: z.boolean().optional(),
});

const updateSongSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  albumId: z.string().uuid().optional(),
  coverUrl: z.string().url().optional(),
  releaseYear: z.number().int().min(1900).max(2100).optional(),
  cdnUrl: z.string().url().optional(),
});

export class SongController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset } = pagination(req);
    const songs = await songService.getAll(limit, offset);
    const count = await songService.count();

    res.json({
      data: songs,
      pagination: { limit, offset, total: count },
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const song = await songService.getByIdWithRelations(id);
    res.json(song);
  });

  static getByArtist = asyncHandler(async (req: Request, res: Response) => {
    const { artistId } = req.params;
    const { limit, offset } = pagination(req);
    const songs = await songService.getByArtistId(artistId, limit, offset);

    res.json({
      data: songs,
      pagination: { limit, offset },
    });
  });

  static search = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    const { limit, offset } = pagination(req);

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const songs = await songService.searchByTitle(q, limit, offset);
    res.json({ data: songs, query: q });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const data = createSongSchema.parse(req.body);
    const song = await songService.create(data);
    res.status(201).json(song);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateSongSchema.parse(req.body);
    const song = await songService.update(id, data);
    res.json(song);
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await songService.delete(id);
    res.status(204).send();
  });

  static getGenres = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const genres = await songRelationService.getSongGenres(id);
    res.json({ data: genres });
  });

  static addGenre = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { genreId } = z.object({ genreId: z.string().uuid() }).parse(req.body);
    const result = await songRelationService.addSongGenre(id, { genreId });
    res.status(201).json(result);
  });

  static removeGenre = asyncHandler(async (req: Request, res: Response) => {
    const { id, genreId } = req.params;
    await songRelationService.removeSongGenre(id, genreId);
    res.status(204).send();
  });

  static getMoods = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const moods = await songRelationService.getSongMoods(id);
    res.json({ data: moods });
  });

  static addMood = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { moodId, score } = z
      .object({ moodId: z.string().uuid(), score: z.number().min(0).max(1).optional() })
      .parse(req.body);
    const result = await songRelationService.addSongMood(id, { moodId, score });
    res.status(201).json(result);
  });

  static removeMood = asyncHandler(async (req: Request, res: Response) => {
    const { id, moodId } = req.params;
    await songRelationService.removeSongMood(id, moodId);
    res.status(204).send();
  });
}
