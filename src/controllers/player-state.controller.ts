import { Request, Response } from 'express';
import { z } from 'zod';
import { playerStateService } from '../services';
import { asyncHandler } from '../utils/async-handler';

const updatePlayerStateSchema = z.object({
  currentSongId: z.string().uuid().nullable().optional(),
  positionS: z.number().min(0).optional(),
  repeat: z.enum(['none', 'one', 'all']).optional(),
  shuffle: z.boolean().optional(),
});

export class PlayerStateController {
  static getPlayerState = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const state = await playerStateService.getPlayerState(userId);
    res.json(state);
  });

  static updatePlayerState = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = updatePlayerStateSchema.parse(req.body);
    const state = await playerStateService.updatePlayerState(userId, data);
    res.json(state);
  });

  static setCurrentSong = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { songId, position } = z
      .object({ songId: z.string().uuid().nullable(), position: z.number().min(0).optional() })
      .parse(req.body);

    const state = await playerStateService.setCurrentSong(userId, songId, position);
    res.json(state);
  });

  static setRepeatMode = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { repeat } = z.object({ repeat: z.enum(['none', 'one', 'all']) }).parse(req.body);
    const state = await playerStateService.setRepeatMode(userId, repeat);
    res.json(state);
  });

  static setShuffle = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { shuffle } = z.object({ shuffle: z.boolean() }).parse(req.body);
    const state = await playerStateService.setShuffle(userId, shuffle);
    res.json(state);
  });

  static setPosition = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { positionS } = z.object({ positionS: z.number().min(0) }).parse(req.body);
    const state = await playerStateService.setPosition(userId, positionS);
    res.json(state);
  });
}
