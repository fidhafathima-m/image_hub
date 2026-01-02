import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    publicId: string; // Cloudinary public ID
    url: string;
    thumbnailUrl?: string; // Optimized thumbnail URL
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    originalName?: string; // Keep for reference
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const imageSchema = new Schema<IImage>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    publicId: {
        type: String,
        required: true,
        unique: true,
    },
    url: {
        type: String,
        required: true,
    },
    thumbnailUrl: {
        type: String,
    },
    format: {
        type: String,
        required: true,
        enum: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
    },
    bytes: {
        type: Number,
        required: true,
        min: 1,
    },
    width: {
        type: Number,
    },
    height: {
        type: Number,
    },
    originalName: {
        type: String,
        maxlength: 255,
    },
    order: {
        type: Number,
        default: 0,
        min: 0,
    }
}, {
    timestamps: true,
});

// Indexes for better performance
imageSchema.index({ user: 1, order: 1 });
imageSchema.index({ createdAt: -1 });
imageSchema.index({ publicId: 1 });


export default mongoose.model<IImage>('Image', imageSchema);