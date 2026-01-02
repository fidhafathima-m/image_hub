import { Response } from 'express';
import Image, { IImage } from '../models/ImageSchema';
import path from 'path';
import fs from 'fs';
import {
    AuthRequest,
    ImageUploadBody,
    BulkUploadBody,
    UpdateImageBody,
    RearrangeImagesBody,
    MulterFile
} from '../types/index.js';

export const getImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?._id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const images = await Image.find({ user: req.user._id }).sort({
            order: 1,
            createdAt: -1,
        });

        res.json(images);
    } catch (error: unknown) {
        console.error('Get images error: ', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title } = req.body as ImageUploadBody;
        const file = req.file as MulterFile;

        if (!req.user?._id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        // Get highest order for this user
        const highestOrderImage = await Image.findOne({ user: req.user._id }).sort({
            order: -1,
        });

        const order = highestOrderImage ? highestOrderImage.order + 1 : 0;

        const image = new Image({
            user: req.user._id,
            title,
            url: `/uploads/${file.filename}`,
            fileName: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            order,
        });
        await image.save();
        res.status(201).json({ message: 'Image uploaded successfully', image });
    } catch (error: unknown) {
        console.error('Upload Image error: ', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Bulk upload
export const bulkUploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { titles } = req.body as BulkUploadBody;
        const files = req.files as MulterFile[];

        if (!req.user?._id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        if (!files || files.length === 0) {
            res.status(400).json({ error: 'No files uploaded' });
            return;
        }

        if (!titles || titles.length !== files.length) {
            res.status(400).json({ error: 'Title count must match file count' });
            return;
        }

        // Get highest order
        const highestOrderImage = await Image.findOne({ user: req.user._id }).sort({
            order: -1,
        });

        let order = highestOrderImage ? highestOrderImage.order + 1 : 0;

        const images: IImage[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const title = titles[i];

            const image = new Image({
                user: req.user._id,
                title,
                url: `/uploads/${file.filename}`,
                fileName: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                order,
            });

            await image.save();
            images.push(image);
            order++;
        }

        res.status(201).json({
            message: `${files.length} images uploaded`,
            images,
        });
    } catch (error: unknown) {
        console.error('Bulk upload images error: ', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update image (title and/or name)
export const updateImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title } = req.body as UpdateImageBody;
        const file = req.file as MulterFile;

        if (!req.user?._id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        // Find image
        const image = await Image.findOne({ _id: id, user: req.user._id });

        if (!image) {
            res.status(404).json({ error: 'Image not found' });
            return;
        }

        if (file) {
            const oldFilePath = path.join('uploads', image.fileName);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            image.url = `/uploads/${file.filename}`;
            image.fileName = file.filename;
            image.originalName = file.originalname;
            image.size = file.size;
            image.mimetype = file.mimetype;
        }

        if (title) {
            image.title = title;
        }

        await image.save();

        res.json({
            message: 'Image updated successfully!',
            image,
        });
    } catch (error: unknown) {
        console.error('Update image error: ', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete image
export const deleteImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!req.user?._id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        // Find image
        const image = await Image.findOneAndDelete({ _id: id, user: req.user._id });
        if (!image) {
            res.status(404).json({ error: 'Image not found' });
            return;
        }

        // Delete file from server
        const filePath = path.join(process.cwd(), 'uploads', image.fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: 'Image deleted successfully!' });
    } catch (error: unknown) {
        console.error('Delete image error: ', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Rearrange image order
export const rearrangeImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { imageOrder } = req.body as RearrangeImagesBody;

        if (!req.user?._id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        if (!Array.isArray(imageOrder)) {
            res.status(400).json({ error: 'Invalid image order array' });
            return;
        }

        // Update order for each image
        const updatePromises = imageOrder.map((imageId, index) => {
            return Image.findOneAndUpdate(
                { _id: imageId, user: req.user!._id },
                { order: index },
                { new: true }
            );
        });

        await Promise.all(updatePromises);
        res.json({ message: 'Images rearranged successfully' });
    } catch (error: unknown) {
        console.error('Rearrange image error: ', error);
        res.status(500).json({ error: 'Server error' });
    }
};