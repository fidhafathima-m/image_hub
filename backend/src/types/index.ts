import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';

// JWT Payload Interface
export interface JwtUserPayload extends JwtPayload {
    userId: mongoose.Types.ObjectId;
}

// Request with User Interface
export interface AuthRequest extends Request {
    user?: {
        _id: mongoose.Types.ObjectId;
        userName: string;
        email: string;
        phoneNumber?: string;
    };
}

// File Interface
export interface MulterFile {
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

// SendGrid Message Interface
export interface SendGridMessage {
    to: string;
    from: string;
    subject: string;
    html: string;
}

// Request Body Types
export interface RegisterBody {
    userName: string;
    email: string;
    phoneNumber?: string;
    password: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface ForgotPasswordBody {
    email: string;
}

export interface ResetPasswordBody {
    token: string;
    password: string;
}

export interface ImageUploadBody {
    title: string;
}

export interface BulkUploadBody {
    titles: string[];
}

export interface UpdateImageBody {
    title?: string;
}

export interface RearrangeImagesBody {
    imageOrder: string[];
}