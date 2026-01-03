import { Model, Types } from 'mongoose';
import { IImage } from '../interfaces/IImage.js';
import { IImageRepository } from '../interfaces/repositories/IImageRepository.js';
import ImageModel from '../models/ImageSchema.js';
import { BaseRepository } from './base.repository.js';

export class ImageRepository extends BaseRepository<IImage> implements IImageRepository {
  constructor() {
    super(ImageModel as unknown as Model<IImage>);
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10): 
    Promise<{ images: IImage[]; total: number }> {
    
    const skip = (page - 1) * limit;
    const adjustedLimit = Math.min(50, Math.max(1, limit));
    
    const [images, total] = await Promise.all([
      this.model
        .find({ user: userId })
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(adjustedLimit),
      this.model.countDocuments({ user: userId })
    ]);

    return { images, total };
  }

  async findHighestOrder(userId: string): Promise<IImage | null> {
    return this.model.findOne({ user: userId }).sort({ order: -1 });
  }

  async updateOrder(images: Array<{id: string, order: number}>): Promise<void> {
    const bulkOps = images.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { order } }
      }
    }));
    
    await this.model.bulkWrite(bulkOps);
  }

  async deleteMany(ids: string[]): Promise<number> {
    const result = await this.model.deleteMany({ _id: { $in: ids } });
    return result.deletedCount || 0;
  }

  async getStats(userId: string): Promise<{totalImages: number, totalSize: number, recentUploads: number}> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = await this.model.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          totalSize: { $sum: { $ifNull: ["$bytes", 0] } },
          recentUploads: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", oneWeekAgo] }, 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || { totalImages: 0, totalSize: 0, recentUploads: 0 };
  }
}