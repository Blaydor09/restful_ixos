import { Router } from 'express';
import { DownloadController } from '../controllers';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET user's downloads
router.get('/', DownloadController.getDownloads);

// GET downloads by status
router.get('/status/:status', DownloadController.getDownloadsByStatus);

// GET download by ID
router.get('/:id', DownloadController.getDownloadById);

// POST create download
router.post('/', DownloadController.createDownload);

// PUT update download
router.put('/:id', DownloadController.updateDownload);

// DELETE download
router.delete('/:id', DownloadController.deleteDownload);

export default router;
