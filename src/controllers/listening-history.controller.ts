import { Request, Response } from 'express';
import { z } from 'zod';
import { listeningHistoryService } from '../services';
import { asyncHandler } from '../utils/async-handler';
import { pagination } from '../utils/pagination';

const createListeningHistorySchema = z.object({
  songId: z.string().uuid(),
  moodId: z.string().uuid().optional(),
  durationS: z.number().positive(),
  completed: z.boolean().optional(),
});

export class ListeningHistoryController {
  static getHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit, offset } = pagination(req);
    const history = await listeningHistoryService.getHistory(userId, limit, offset);

    res.json({
      data: history,
      pagination: { limit, offset },
    });
  });

  static addToHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = createListeningHistorySchema.parse(req.body);
    const record = await listeningHistoryService.addToHistory(userId, data);
    res.status(201).json(record);
  });

  static getRecentMoods = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { days } = z.object({ days: z.number().int().positive().optional() }).parse(req.query);
    const moods = await listeningHistoryService.getRecentMoods(userId, days ?? 7);

    res.json({ data: moods });
  });

  static getTopSongs = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { days, limit } = z
      .object({ days: z.number().int().positive().optional(), limit: z.number().int().positive().optional() })
      .parse(req.query);
    const songs = await listeningHistoryService.getTopSongs(userId, days ?? 30, limit ?? 50);

    res.json({ data: songs });
  });

  static getTotalListeningTime = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { days } = z.object({ days: z.number().int().positive().optional() }).parse(req.query);
    const totalTime = await listeningHistoryService.getTotalListeningTime(userId, days ?? 30);

    res.json({ totalTimeSeconds: totalTime });
  });
}
