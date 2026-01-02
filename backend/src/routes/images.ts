import express, { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload, uploadMultiple } from '../middleware/upload.js';
import { 
    getImages, 
    uploadImage, 
    bulkUploadImages, 
    updateImage, 
    deleteImage,
    bulkDeleteImages,
    rearrangeImages,
    getImageStats
} from '../controllers/imageController.js';

const router: Router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/images - Get all images
router.get('/', getImages);

// GET /api/images/stats - Get image statistics
router.get('/stats', getImageStats);

// POST /api/images/upload - Upload single image
router.post('/upload', upload.single('image'), uploadImage);

// POST /api/images/bulk-upload - Upload multiple images
router.post('/bulk-upload', uploadMultiple.array('images', 100), bulkUploadImages);

// PUT /api/images/:id - Update image
router.put('/:id', upload.single('image'), updateImage);

// DELETE /api/images/:id - Delete single image
router.delete('/:id', deleteImage);

// POST /api/images/bulk-delete - Bulk delete images
router.post('/bulk-delete', bulkDeleteImages);

// PUT /api/images/rearrange/order - Rearrange images
router.put('/rearrange/order', rearrangeImages);

export default router;