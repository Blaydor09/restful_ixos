import { Request, Response } from 'express';
import { z } from 'zod';
import { playlistService } from '../services';
import { asyncHandler } from '../utils/async-handler';
import { pagination } from '../utils/pagination';

const createPlaylistSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
  coverUrl: z.string().url().optional(),
  visibility: z.enum(['private', 'public']).optional(),
  moodId: z.string().uuid().optional(),
});

const updatePlaylistSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().optional(),
  coverUrl: z.string().url().optional(),
  visibility: z.enum(['private', 'public']).optional(),
  moodId: z.string().uuid().optional(),
});

const addSongSchema = z.object({
  songId: z.string().uuid(),
});

export class PlaylistController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset } = pagination(req);
    const playlists = await playlistService.getAll(limit, offset);

    res.json({
      data: playlists,
      pagination: { limit, offset },
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const playlist = await playlistService.getByIdWithSongs(id);
    res.json(playlist);
  });

  static getByUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit, offset } = pagination(req);
    const playlists = await playlistService.getByOwnerId(userId, limit, offset);

    res.json({
      data: playlists,
      pagination: { limit, offset },
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = createPlaylistSchema.parse(req.body);
    const playlist = await playlistService.create(userId, data);
    res.status(201).json(playlist);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const playlist = await playlistService.getById(id);
    if (playlist.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const data = updatePlaylistSchema.parse(req.body);
    const updated = await playlistService.update(id, data);
    res.json(updated);
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const playlist = await playlistService.getById(id);
    if (playlist.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await playlistService.delete(id);
    res.status(204).send();
  });

  static addSong = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const playlist = await playlistService.getById(id);
    if (playlist.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { songId } = addSongSchema.parse(req.body);
    await playlistService.addSong(id, songId);
    res.status(201).json({ message: 'Song added to playlist' });
  });

  static removeSong = asyncHandler(async (req: Request, res: Response) => {
    const { id, songId } = req.params;
    const userId = req.user?.id;

    const playlist = await playlistService.getById(id);
    if (playlist.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await playlistService.removeSong(id, songId);
    res.status(204).send();
  });

  static reorderSong = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { songId, position } = z.object({ songId: z.string().uuid(), position: z.number().int().positive() }).parse(req.body);
    const userId = req.user?.id;

    const playlist = await playlistService.getById(id);
    if (playlist.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await playlistService.reorderSong(id, songId, position);
    res.json({ message: 'Song reordered' });
  });
}
