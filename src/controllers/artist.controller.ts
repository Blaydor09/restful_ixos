import { Request, Response } from 'express';
import { z } from 'zod';
import { artistService } from '../services';
import { asyncHandler } from '../utils/async-handler';
import { pagination } from '../utils/pagination';

const createArtistSchema = z.object({
  name: z.string().trim().min(1).max(255),
  imageUrl: z.string().url().optional(),
});

const updateArtistSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  imageUrl: z.string().url().optional(),
});

export class ArtistController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset } = pagination(req);
    const artists = await artistService.getAll(limit, offset);
    const count = await artistService.count();

    res.json({
      data: artists,
      pagination: { limit, offset, total: count },
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const artist = await artistService.getById(id);
    res.json(artist);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const data = createArtistSchema.parse(req.body);
    const artist = await artistService.create(data);
    res.status(201).json(artist);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateArtistSchema.parse(req.body);
    const artist = await artistService.update(id, data);
    res.json(artist);
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await artistService.delete(id);
    res.status(204).send();
  });
}
