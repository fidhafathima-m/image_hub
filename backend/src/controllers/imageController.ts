import { Response } from "express";
import { AuthRequest } from "../types/index";
import { IImageService } from "../interfaces/services/IImageService";
import { IImage } from "../interfaces/IImage";

export class ImageController {
  private imageService: IImageService;

  constructor(imageService: IImageService) {
    this.imageService = imageService;
  }

  getImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?._id) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

      const { images, total } = await this.imageService.getImages(
        req.user._id.toString(),
        page,
        limit
      );

      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      res.json({
        success: true,
        images,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore,
        },
      });
    } catch (error: any) {
      console.error("Get images error:", error);
      res.status(500).json({ error: error.message || "Server error" });
    }
  };

  uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const image = await this.imageService.uploadImage(
        req.user._id.toString(),
        req.file,
        title
      );

      res.status(201).json({
        message: "Image uploaded successfully",
        image,
      });
    } catch (error: any) {
      console.error("Upload Image error:", error);
      res.status(500).json({ error: error.message || "Server error" });
    }
  };

  bulkUploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { titles } = req.body;
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

      const images = await this.imageService.bulkUploadImages(
        req.user._id.toString(),
        files,
        titles
      );

      res.status(201).json({
        message: `${files.length} images uploaded`,
        images,
      });
    } catch (error: any) {
      console.error("Bulk upload images error:", error);

      // Clean up uploaded files on error
      if (req.files && Array.isArray(req.files)) {
        // You might want to add cleanup logic here if needed
      }

      res.status(500).json({ error: error.message || "Server error" });
    }
  };

  updateImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const file = req.file as any;

      if (!req.user?._id) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const image = await this.imageService.updateImage(
        id,
        req.user._id.toString(),
        title,
        file
      );

      res.json({
        message: "Image updated successfully!",
        image,
      });
    } catch (error: any) {
      console.error("Update image error:", error);
      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({ error: error.message || "Server error" });
    }
  };

  deleteImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user?._id) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      await this.imageService.deleteImage(id, req.user._id.toString());

      res.json({ message: "Image deleted successfully!" });
    } catch (error: any) {
      console.error("Delete image error:", error);
      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({ error: error.message || "Server error" });
    }
  };

  bulkDeleteImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { imageIds } = req.body;

      if (!req.user?._id) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        res.status(400).json({ error: "Invalid image IDs array" });
        return;
      }

      const deletedCount = await this.imageService.bulkDeleteImages(
        imageIds,
        req.user._id.toString()
      );

      if (deletedCount === 0) {
        res.status(404).json({ error: "No images found" });
        return;
      }

      res.json({
        message: `${deletedCount} images deleted successfully`,
        deletedCount,
      });
    } catch (error: any) {
      console.error("Bulk delete images error:", error);
      res.status(500).json({ error: error.message || "Server error" });
    }
  };

  rearrangeImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { imageOrder } = req.body;

      if (!req.user?._id) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      if (!Array.isArray(imageOrder)) {
        res.status(400).json({ error: "Invalid image order array" });
        return;
      }

      await this.imageService.rearrangeImages(
        req.user._id.toString(),
        imageOrder
      );

      res.json({ message: "Images rearranged successfully" });
    } catch (error: any) {
      console.error("Rearrange image error:", error);
      res.status(500).json({ error: error.message || "Server error" });
    }
  };

  getImageStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?._id) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const stats = await this.imageService.getImageStats(
        req.user._id.toString()
      );

      res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      console.error("Get image stats error:", error);
      res.status(500).json({ error: error.message || "Server error" });
    }
  };
}
