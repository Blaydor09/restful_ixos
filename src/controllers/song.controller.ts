import { Request, Response } from 'express';
import { z } from 'zod';
import { songService, moodService, songRelationService } from '../services';
import { asyncHandler } from '../utils/async-handler';
import { pagination } from '../utils/pagination';

const createSongSchema = z.object({
  fileId: z.string().trim().min(1),
  filePath: z.string().trim().min(1),
  cdnUrl: z.url().optional(),
  title: z.string().trim().min(1).max(255),
  artistId: z.uuid(),
  albumId: z.uuid().optional(),
  coverUrl: z.url().optional(),
  releaseYear: z.number().int().min(1900).max(2100).optional(),
  durationS: z.number().positive(),
  explicit: z.boolean().optional(),
});

const updateSongSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  albumId: z.uuid().optional(),
  coverUrl: z.url().optional(),
  releaseYear: z.number().int().min(1900).max(2100).optional(),
  cdnUrl: z.url().optional(),
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
    const id = z.uuid().parse(req.params.id);
    const song = await songService.getByIdWithRelations(id);
    res.json(song);
  });

  static getByArtist = asyncHandler(async (req: Request, res: Response) => {
    const artistId = z.uuid().parse(req.params.artistId);
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
    const id = z.uuid().parse(req.params.id);
    const data = updateSongSchema.parse(req.body);
    const song = await songService.update(id, data);
    res.json(song);
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    await songService.delete(id);
    res.status(204).send();
  });

  static getGenres = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    const genres = await songRelationService.getSongGenres(id);
    res.json({ data: genres });
  });

  static addGenre = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    const { genreId } = z.object({ genreId: z.uuid() }).parse(req.body);
    const result = await songRelationService.addSongGenre(id, { genreId });
    res.status(201).json(result);
  });

  static removeGenre = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    const genreId = z.uuid().parse(req.params.genreId);
    await songRelationService.removeSongGenre(id, genreId);
    res.status(204).send();
  });

  static getMoods = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    const moods = await songRelationService.getSongMoods(id);
    res.json({ data: moods });
  });

  static addMood = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    const { moodId, score } = z
      .object({ moodId: z.uuid(), score: z.number().min(0).max(1).optional() })
      .parse(req.body);
    const result = await songRelationService.addSongMood(id, { moodId, score });
    res.status(201).json(result);
  });

  static removeMood = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    const moodId = z.uuid().parse(req.params.moodId);
    await songRelationService.removeSongMood(id, moodId);
    res.status(204).send();
  });
}
