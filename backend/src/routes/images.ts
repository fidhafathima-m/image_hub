import express, { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload, uploadMultiple } from '../middleware/upload.js'; // Changed to uploadMultiple
import { 
    getImages, 
    uploadImage, 
    bulkUploadImages, 
    updateImage, 
    deleteImage, 
    rearrangeImages 
} from '../controllers/imageController';

const router: Router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/images - Get all images for authenticated user
router.get('/', getImages);

// POST /api/images/upload - Upload single image
router.post('/upload', upload.single('image'), uploadImage);

// POST /api/images/bulk-upload - Upload multiple images
router.post('/bulk-upload', uploadMultiple.array('images', 100), bulkUploadImages);

// PUT /api/images/:id - Update image (title and/or file)
router.put('/:id', upload.single('image'), updateImage);

// DELETE /api/images/:id - Delete image
router.delete('/:id', deleteImage);

// PUT /api/images/rearrange/order - Rearrange image order
router.put('/rearrange/order', rearrangeImages);

export default router;
