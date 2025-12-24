import express from "express"
const router = express.Router();
import {auth} from "../middleware/auth.js"
import {upload} from "../middleware/upload.js"
import {getImages, uploadImage, bulkUploadImages, updateImage, deleteImage, rearrangeImages} from "../controllers/imageController.js"

// All routes require authentication
router.use(auth);

router.get('/', getImages);
router.post('/upload', upload.single('image'), uploadImage);
router.post('/bulk-upload', upload.array('images', 100), bulkUploadImages);
router.put('/:id', upload.single('image'), updateImage);
router.delete('/:id', deleteImage);
router.put('/rearrange/order', rearrangeImages);

export default router