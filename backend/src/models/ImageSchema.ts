import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for Image document
export interface IImage extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    url: string;
    fileName: string;
    order: number;
    originalName?: string;
    size?: number;
    mimetype?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Image model (static methods if any)
export interface IImageModel extends Model<IImage> {
    // You can add static methods here if needed
    // Example: findByUser(userId: string): Promise<IImage[]>;
}

const imageSchema = new Schema<IImage, IImageModel>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Added index for better query performance
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    url: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                return /^\/uploads\/[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9]+)?$/.test(v);
            },
            message: (props: { value: string }) => `${props.value} is not a valid upload URL!`
        }
    },
    fileName: {
        type: String,
        required: true,
        unique: true, // Ensure file names are unique
    },
    order: {
        type: Number,
        default: 0,
        min: 0,
    },
    originalName: {
        type: String,
        maxlength: [255, 'Original name cannot be more than 255 characters'],
    },
    size: {
        type: Number,
        min: 1,
        max: 5 * 1024 * 1024, // 5MB max
    },
    mimetype: {
        type: String,
        enum: {
            values: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            message: '{VALUE} is not a supported image type',
        },
    }
}, {
    timestamps: true,
});

// Add indexes for better query performance
imageSchema.index({ user: 1, order: 1 });
imageSchema.index({ createdAt: -1 });

// Virtual for full file path (if needed)
imageSchema.virtual('fullPath').get(function(this: IImage) {
    return process.cwd() + '/uploads/' + this.fileName;
});

// Virtual for relative URL (if needed)
imageSchema.virtual('absoluteUrl').get(function(this: IImage) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return baseUrl + this.url;
});

// Static method example: Find images by user with pagination
imageSchema.statics.findByUser = async function(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return await this.find({ user: userId })
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

// Instance method example: Get image metadata
imageSchema.methods.getMetadata = function(): Record<string, any> {
    return {
        title: this.title,
        size: this.size ? `${(this.size / 1024).toFixed(2)} KB` : 'Unknown',
        type: this.mimetype || 'Unknown',
        uploadedAt: this.createdAt,
        url: this.url,
    };
};

const Image = mongoose.model<IImage, IImageModel>('Image', imageSchema);
export default Image;