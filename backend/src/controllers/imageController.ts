import { Response } from "express";
import Image, { IImage } from "../models/ImageSchema.js";
import cloudinary from "../config/cloudinary.js";
import {
  AuthRequest,
  ImageUploadBody,
  BulkUploadBody,
  UpdateImageBody,
  RearrangeImagesBody,
  MulterFile,
} from "../types/index.js";

export const getImages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const images = await Image.find({ user: req.user._id }).sort({
      order: 1,
      createdAt: -1,
    });

    res.json(images);
  } catch (error: unknown) {
    console.error("Get images error: ", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const uploadImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title } = req.body;

    if (!req.user?._id) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const file = req.file as any;

    // ✅ multer-storage-cloudinary fields
    const publicId = file.filename;
    const url = file.path;
    const format = file.mimetype.split("/")[1];
    const bytes = file.size;

    // Get highest order
    const highestOrderImage = await Image.findOne({ user: req.user._id }).sort({
      order: -1,
    });
    const order = highestOrderImage ? highestOrderImage.order + 1 : 0;

    const thumbnailUrl = cloudinary.url(publicId, {
      width: 300,
      height: 300,
      crop: "fill",
      quality: "auto",
      format: "webp",
    });

    const image = new Image({
      user: req.user._id,
      title,
      publicId,
      url,
      thumbnailUrl,
      format,
      bytes,
      width: file.width,
      height: file.height,
      order,
    });

    await image.save();

    res.status(201).json({
      message: "Image uploaded successfully",
      image,
    });
  } catch (error) {
    console.error("Upload Image error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Bulk upload with Cloudinary
export const bulkUploadImages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { titles } = req.body as BulkUploadBody;
    const files = req.files as any[];

    if (!req.user?._id) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!files || files.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    if (!titles || titles.length !== files.length) {
      res.status(400).json({ error: "Title count must match file count" });
      return;
    }

    // Get highest order
    const highestOrderImage = await Image.findOne({ user: req.user._id }).sort({
      order: -1,
    });

    let order = highestOrderImage ? highestOrderImage.order + 1 : 0;
    const images: IImage[] = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = titles[i];

      // Create thumbnail URL
      const thumbnailUrl = cloudinary.url(file.public_id, {
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto",
        format: "webp",
      });

      const image = new Image({
        user: req.user._id,
        title,
        publicId: file.filename,
        url: file.path,
        format: file.mimetype.split("/")[1],
        bytes: file.size,
        width: file.width,
        height: file.height,
        order,
      });

      await image.save();
      images.push(image);
    }

    res.status(201).json({
      message: `${files.length} images uploaded`,
      images,
    });
  } catch (error: unknown) {
    console.error("Bulk upload images error: ", error);

    // Clean up any uploaded files on Cloudinary if error occurs
    if (req.files && Array.isArray(req.files)) {
      const cleanupPromises = (req.files as any[]).map((file) =>
        cloudinary.uploader.destroy(file.filename).catch((cleanupError) => {
          console.error("Failed to cleanup Cloudinary file:", cleanupError);
        })
      );
      await Promise.all(cleanupPromises);
    }

    res.status(500).json({ error: "Server error" });
  }
};

// Update image (title and/or file) with Cloudinary
export const updateImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title } = req.body as UpdateImageBody;
    const file = req.file as any;

    if (!req.user?._id) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    // Find image
    const image = await Image.findOne({ _id: id, user: req.user._id });

    if (!image) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    // If new file uploaded
    if (file) {
      // Delete old image from Cloudinary
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (error) {
        console.error("Failed to delete old image from Cloudinary:", error);
      }

      // Create thumbnail URL
      const thumbnailUrl = cloudinary.url(file.filename, {
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto",
        format: "webp",
      });

      // Update with new file info
      image.publicId = file.filename;
      image.url = file.path;
      image.format = file.mimetype.split("/")[1];
      image.bytes = file.size;
      image.thumbnailUrl = thumbnailUrl;
      image.width = file.width;
      image.height = file.height;
    }

    // Update title if provided
    if (title) {
      image.title = title;
    }

    await image.save();

    res.json({
      message: "Image updated successfully!",
      image,
    });
  } catch (error: unknown) {
    console.error("Update image error: ", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete image with Cloudinary
export const deleteImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?._id) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    // Find and delete image
    const image = await Image.findOneAndDelete({ _id: id, user: req.user._id });

    if (!image) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
      // Continue anyway - at least DB record is deleted
    }

    res.json({ message: "Image deleted successfully!" });
  } catch (error: unknown) {
    console.error("Delete image error: ", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Bulk delete images with Cloudinary
export const bulkDeleteImages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { imageIds } = req.body as { imageIds: string[] };

    if (!req.user?._id) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      res.status(400).json({ error: "Invalid image IDs array" });
      return;
    }

    // Find images to delete
    const images = await Image.find({
      _id: { $in: imageIds },
      user: req.user._id,
    });

    if (images.length === 0) {
      res.status(404).json({ error: "No images found" });
      return;
    }

    // Delete from Cloudinary
    const cloudinaryDeletePromises = images.map((image) =>
      cloudinary.uploader.destroy(image.publicId).catch((error) => {
        console.error(
          `Failed to delete image ${image.publicId} from Cloudinary:`,
          error
        );
        return null; // Continue even if Cloudinary deletion fails
      })
    );

    // Delete from database
    const dbDeleteResult = await Image.deleteMany({
      _id: { $in: imageIds },
      user: req.user._id,
    });

    // Wait for Cloudinary deletions
    await Promise.all(cloudinaryDeletePromises);

    res.json({
      message: `${images.length} images deleted successfully`,
      deletedCount: dbDeleteResult.deletedCount,
    });
  } catch (error: unknown) {
    console.error("Bulk delete images error: ", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Rearrange image order (unchanged - works the same with Cloudinary)
export const rearrangeImages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { imageOrder } = req.body as RearrangeImagesBody;

    if (!req.user?._id) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!Array.isArray(imageOrder)) {
      res.status(400).json({ error: "Invalid image order array" });
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
    res.json({ message: "Images rearranged successfully" });
  } catch (error: unknown) {
    console.error("Rearrange image error: ", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get image statistics
export const getImageStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const stats = await Image.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          totalSize: { $sum: { $ifNull: ["$bytes", 0] } },
          recentUploads: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    "$createdAt",
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          totalImages: 1,
          totalSize: 1,
          recentUploads: 1,
          totalSizeMB: {
            $round: [{ $divide: ["$totalSize", 1024 * 1024] }, 2],
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalImages: 0,
      totalSize: 0,
      recentUploads: 0,
      totalSizeMB: 0,
    };

    res.json({
      success: true,
      stats: {
        ...result,
        totalSizeMB: result.totalSizeMB ?? 0
      },
    });
  } catch (error: unknown) {
    console.error("Get image stats error: ", error);
    res.status(500).json({ error: "Server error" });
  }
};
