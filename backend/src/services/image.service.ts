import cloudinary from "../config/cloudinary";
import { IImage } from "../interfaces/IImage";
import { IImageRepository } from "../interfaces/repositories/IImageRepository";

export class ImageService {
  private _imageRepository: IImageRepository;

  constructor(imageRepository: IImageRepository) {
    this._imageRepository = imageRepository;
  }

  async getImages(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ images: IImage[]; total: number }> {
    return this._imageRepository.findByUserId(userId, page, limit);
  }

  async uploadImage(
    userId: string,
    file: any,
    title?: string
  ): Promise<IImage> {
    // Get highest order
    const highestOrderImage = await this._imageRepository.findHighestOrder(
      userId
    );
    const order = highestOrderImage ? highestOrderImage.order + 1 : 0;

    // Create thumbnail URL
    const thumbnailUrl = cloudinary.url(file.filename, {
      width: 300,
      height: 300,
      crop: "fill",
      quality: "auto",
      format: "webp",
    });

    const imageData = {
      user: userId,
      title,
      publicId: file.filename,
      url: file.path,
      thumbnailUrl,
      format: file.mimetype.split("/")[1],
      bytes: file.size,
      width: file.width,
      height: file.height,
      order,
    };

    return this._imageRepository.create(imageData);
  }

  async bulkUploadImages(
    userId: string,
    files: any[],
    titles: string[]
  ): Promise<IImage[]> {
    const highestOrderImage = await this._imageRepository.findHighestOrder(
      userId
    );
    let order = highestOrderImage ? highestOrderImage.order + 1 : 0;

    const images: IImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = titles[i];

      const thumbnailUrl = cloudinary.url(file.filename, {
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto",
        format: "webp",
      });

      const imageData = {
        user: userId,
        title,
        publicId: file.filename,
        url: file.path,
        thumbnailUrl,
        format: file.mimetype.split("/")[1],
        bytes: file.size,
        width: file.width,
        height: file.height,
        order,
      };

      const image = await this._imageRepository.create(imageData);
      images.push(image);
      order++;
    }

    return images;
  }

  async updateImage(
    id: string,
    userId: string,
    title?: string,
    file?: any
  ): Promise<IImage> {
    const image = await this._imageRepository.findById(id);
    if (!image || image.user.toString() !== userId) {
      throw new Error("Image not found");
    }

    const updateData: any = {};

    if (title) {
      updateData.title = title;
    }

    if (file) {
      // Delete old image from Cloudinary
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (error) {
        console.error("Failed to delete old image from Cloudinary:", error);
      }

      // Create new thumbnail
      const thumbnailUrl = cloudinary.url(file.filename, {
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto",
        format: "webp",
      });

      updateData.publicId = file.filename;
      updateData.url = file.path;
      updateData.format = file.mimetype.split("/")[1];
      updateData.bytes = file.size;
      updateData.thumbnailUrl = thumbnailUrl;
      updateData.width = file.width;
      updateData.height = file.height;
    }

    const updatedImage = await this._imageRepository.update(id, updateData);
    if (!updatedImage) {
      throw new Error("Failed to update image");
    }

    return updatedImage;
  }

  async deleteImage(id: string, userId: string): Promise<void> {
    const image = await this._imageRepository.findById(id);
    if (!image || image.user.toString() !== userId) {
      throw new Error("Image not found");
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
    }

    // Delete from database
    await this._imageRepository.delete(id);
  }

  async bulkDeleteImages(imageIds: string[], userId: string): Promise<number> {
    // Verify all images belong to user
    const images = await Promise.all(
      imageIds.map((id) => this._imageRepository.findById(id))
    );

    const validImages = images.filter(
      (img) => img && img.user.toString() === userId
    );

    // Delete from Cloudinary
    const cloudinaryDeletes = validImages.map((image) =>
      cloudinary.uploader.destroy(image!.publicId).catch((error) => {
        console.error(
          `Failed to delete image ${image!.publicId} from Cloudinary:`,
          error
        );
        return null;
      })
    );

    await Promise.all(cloudinaryDeletes);

    // Delete from database
    return this._imageRepository.deleteMany(imageIds);
  }

  async rearrangeImages(
    userId: string,
    imageOrder: Array<{ id: string; order: number }>
  ): Promise<void> {

    // Verify all images belong to user
    const images = await Promise.all(
      imageOrder.map((item) => this._imageRepository.findById(item.id))
    );

    const allBelongToUser = images.every((img) => {
      if (!img) {
        return false;
      }

      const imageUserId = img.user.toString();
      const requestUserId = userId.toString();

      return imageUserId === requestUserId;
    });

    if (!allBelongToUser) {
      throw new Error("Some images do not belong to user");
    }

    await this._imageRepository.updateOrder(imageOrder);
  }

  async getImageStats(userId: string): Promise<{
    totalSizeMB: number;
    totalImages: number;
    totalSize: number;
    recentUploads: number;
  }> {
    const stats = await this._imageRepository.getStats(userId);

    return {
      ...stats,
      totalSizeMB: Math.round((stats.totalSize / (1024 * 1024)) * 100) / 100,
    };
  }
}
