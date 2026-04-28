import { Request, Response } from 'express';
import { z } from 'zod';
import { moodService } from '../services';
import { asyncHandler } from '../utils/async-handler';
import { pagination } from '../utils/pagination';

const createMoodSchema = z.object({
  name: z.string().trim().min(1).max(255),
  displayName: z.string().trim().min(1).max(255),
  iconName: z.string().trim().min(1).max(255),
  gradientStart: z.string().regex(/^#[0-9A-F]{6}$/i),
  gradientEnd: z.string().regex(/^#[0-9A-F]{6}$/i),
  sortOrder: z.number().int().optional(),
});

const updateMoodSchema = z.object({
  displayName: z.string().trim().min(1).max(255).optional(),
  iconName: z.string().trim().min(1).max(255).optional(),
  gradientStart: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  gradientEnd: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  sortOrder: z.number().int().optional(),
});

export class MoodController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const moods = await moodService.getAll();
    res.json({ data: moods });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    const mood = await moodService.getById(id);
    res.json(mood);
  });

  static getSongs = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    const { limit, offset } = pagination(req);
    const songs = await moodService.getSongsByMood(id, limit, offset);

    res.json({
      data: songs,
      pagination: { limit, offset },
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const data = createMoodSchema.parse(req.body);
    const mood = await moodService.create(data);
    res.status(201).json(mood);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    const data = updateMoodSchema.parse(req.body);
    const mood = await moodService.update(id, data);
    res.json(mood);
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const id = z.uuid().parse(req.params.id);
    await moodService.delete(id);
    res.status(204).send();
  });
}
