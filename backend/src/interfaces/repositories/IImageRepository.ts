import { IImage } from '../IImage';

export interface IImageRepository {
  create(imageData: Partial<IImage>): Promise<IImage>;
  findById(id: string): Promise<IImage | null>;
  findByUserId(userId: string, page?: number, limit?: number): Promise<{ images: IImage[]; total: number }>;
  update(id: string, updateData: Partial<IImage>): Promise<IImage | null>;
  delete(id: string): Promise<boolean>;
  deleteMany(ids: string[]): Promise<number>;
  findHighestOrder(userId: string): Promise<IImage | null>;
  updateOrder(images: Array<{id: string, order: number}>): Promise<void>;
  getStats(userId: string): Promise<{totalImages: number, totalSize: number, recentUploads: number}>;
}