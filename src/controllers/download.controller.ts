import { Request, Response } from 'express';
import { z } from 'zod';
import { downloadService, songService } from '../services';
import { asyncHandler } from '../utils/async-handler';
import { pagination } from '../utils/pagination';

const createDownloadSchema = z.object({
  songId: z.string().uuid(),
});

const updateDownloadSchema = z.object({
  status: z.enum(['pending', 'downloading', 'completed', 'failed']).optional(),
  fileSizeBytes: z.number().int().positive().optional(),
  localPath: z.string().optional(),
});

export class DownloadController {
  static getDownloads = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit, offset } = pagination(req);
    const downloads = await downloadService.getDownloads(userId, limit, offset);

    res.json({
      data: downloads,
      pagination: { limit, offset },
    });
  });

  static getDownloadById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const download = await downloadService.getDownloadById(id);

    // Verify ownership
    const userId = req.user?.id;
    if (download.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(download);
  });

  static createDownload = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { songId } = createDownloadSchema.parse(req.body);
    
    // Verify song exists
    await songService.getById(songId);

    const download = await downloadService.createDownload(userId, { songId });
    res.status(201).json(download);
  });

  static updateDownload = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const download = await downloadService.getDownloadById(id);
    if (download.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const data = updateDownloadSchema.parse(req.body);
    const updated = await downloadService.updateDownload(id, data);
    res.json(updated);
  });

  static deleteDownload = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const download = await downloadService.getDownloadById(id);
    if (download.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await downloadService.deleteDownload(id);
    res.status(204).send();
  });

  static getDownloadsByStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status } = z.object({ status: z.enum(['pending', 'downloading', 'completed', 'failed']) }).parse(req.query);
    const downloads = await downloadService.getDownloadsByStatus(userId, status);

    res.json({ data: downloads });
  });
}
