import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Create directory named "uploads" if not there
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Fix typo: storate -> storage
const storage: StorageEngine = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        cb(null, uploadDir);
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, file.fieldname + '-' + suffix + path.extname(sanitizedOriginalName));
    }
});

const fileFilter = (
    req: Request, 
    file: Express.Multer.File, 
    cb: FileFilterCallback
): void => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (mimeType && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// Single file upload middleware
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: fileFilter
});

// Multiple files upload middleware
export const uploadMultiple = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5 MB per file
    },
    fileFilter: fileFilter
});

// Optional: File validation helper function
export const validateFile = (file: Express.Multer.File): { isValid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5 MB
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
        return { 
            isValid: false, 
            error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB` 
        };
    }
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return { 
            isValid: false, 
            error: 'Invalid file type. Allowed types: jpeg, jpg, png, gif, webp' 
        };
    }
    
    return { isValid: true };
};

// Optional: Type definitions for uploaded files
export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer?: Buffer;
}