import { Request, Response } from 'express';
import { z } from 'zod';
import { likedSongService, songService } from '../services';
import { asyncHandler } from '../utils/async-handler';
import { pagination } from '../utils/pagination';

const addLikedSongSchema = z.object({
  songId: z.uuid(),
});

export class LikedSongController {
  static getLikedSongs = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit, offset } = pagination(req);
    const songs = await likedSongService.getLikedSongs(userId, limit, offset);
    const count = await likedSongService.getLikedCount(userId);

    res.json({
      data: songs,
      pagination: { limit, offset, total: count },
    });
  });

  static isLiked = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const songId = z.uuid().parse(req.params.songId);
    const liked = await likedSongService.isLiked(userId, songId);

    res.json({ liked });
  });

  static addLikedSong = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { songId } = addLikedSongSchema.parse(req.body);
    
    // Verify song exists
    await songService.getById(songId);

    const result = await likedSongService.addLikedSong(userId, { songId });
    res.status(201).json(result);
  });

  static removeLikedSong = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const songId = z.uuid().parse(req.params.songId);
    await likedSongService.removeLikedSong(userId, songId);
    res.status(204).send();
  });
}
