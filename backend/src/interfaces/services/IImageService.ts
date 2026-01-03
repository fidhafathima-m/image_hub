import { IImage } from "../IImage.js";

export interface IImageService {
  getImages(userId: string, page: number, limit: number): Promise<{ images: IImage[]; total: number }>;
  uploadImage(userId: string, file: any, title?: string): Promise<IImage>;
  bulkUploadImages(
    userId: string,
    files: any[],
    titles: string[]
  ): Promise<IImage[]>;
  updateImage(
    id: string,
    userId: string,
    title?: string,
    file?: any
  ): Promise<IImage>;
  deleteImage(id: string, userId: string): Promise<void>;
  bulkDeleteImages(imageIds: string[], userId: string): Promise<number>;
  rearrangeImages(
    userId: string,
    imageOrder: Array<{ id: string; order: number }>
  ): Promise<void>;
  getImageStats(userId: string): Promise<{ totalSizeMB: number; totalImages: number; totalSize: number; recentUploads: number }>;
}
