import express, { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload, uploadMultiple } from '../middleware/upload.js';
import { imageController } from '../config/container.js';

const router: Router = express.Router();

// All routes require authentication
router.use(auth);
router.get('/', imageController.getImages);
router.get('/stats', imageController.getImageStats);
router.post('/upload', upload.single('image'), imageController.uploadImage);
router.post('/bulk-upload', uploadMultiple.array('images', 100), imageController.bulkUploadImages);
router.put('/:id', upload.single('image'), imageController.updateImage);
router.delete('/:id', imageController.deleteImage);
router.post('/bulk-delete', imageController.bulkDeleteImages);
router.put('/rearrange/order', imageController.rearrangeImages);

export default router;