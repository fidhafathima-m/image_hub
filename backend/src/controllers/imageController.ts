import { Response } from "express";
import { AuthRequest } from "../types/index";
import { IImageService } from "../interfaces/services/IImageService";
import { ErrorMessages, HttpStatus, SuccessMessages } from "../constants";

export class ImageController {
  private _imageService: IImageService;

  constructor(imageService: IImageService) {
    this._imageService = imageService;
  }

  getImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?._id) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED});
        return;
      }

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

      const { images, total } = await this._imageService.getImages(
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
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message || ErrorMessages.SERVER_ERROR });
    }
  };

  uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title } = req.body;

      if (!req.user?._id) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED});
        return;
      }

      if (!req.file) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: ErrorMessages.NO_FILE_UPLOADED });
        return;
      }

      const image = await this._imageService.uploadImage(
        req.user._id.toString(),
        req.file,
        title
      );

      res.status(HttpStatus.CREATED).json({
        message: SuccessMessages.IMAGE_UPLOADED,
        image,
      });
    } catch (error: any) {
      console.error("Upload Image error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message || ErrorMessages.SERVER_ERROR});
    }
  };

  bulkUploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { titles } = req.body;
      const files = req.files as any[];

      if (!req.user?._id) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED});
        return;
      }

      if (!files || files.length === 0) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: ErrorMessages.NO_FILE_UPLOADED });
        return;
      }

      if (!titles || titles.length !== files.length) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: ErrorMessages.TITLE_COUNT_MISMATCH });
        return;
      }

      const images = await this._imageService.bulkUploadImages(
        req.user._id.toString(),
        files,
        titles
      );

      res.status(HttpStatus.CREATED).json({
        message: `${files.length} images uploaded`,
        images,
      });
    } catch (error: any) {
      console.error("Bulk upload images error:", error);

      // Clean up uploaded files on error
      if (req.files && Array.isArray(req.files)) {
        // You might want to add cleanup logic here if needed
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message || ErrorMessages.SERVER_ERROR});
    }
  };

  updateImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const file = req.file as any;

      if (!req.user?._id) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
        return;
      }

      const image = await this._imageService.updateImage(
        id,
        req.user._id.toString(),
        title,
        file
      );

      res.json({
        message: SuccessMessages.IMAGE_UPDATED,
        image,
      });
    } catch (error: any) {
      console.error("Update image error:", error);
      const status = error.message.includes("not found") ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(status).json({ error: error.message || ErrorMessages.SERVER_ERROR});
    }
  };

  deleteImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user?._id) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
        return;
      }

      await this._imageService.deleteImage(id, req.user._id.toString());

      res.json({ message: SuccessMessages.IMAGE_DELETED });
    } catch (error: any) {
      console.error("Delete image error:", error);
      const status = error.message.includes("not found") ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(status).json({ error: error.message || ErrorMessages.SERVER_ERROR});
    }
  };

  bulkDeleteImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { imageIds } = req.body;

      if (!req.user?._id) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
        return;
      }

      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: ErrorMessages.INVALID_IMAGE_IDS});
        return;
      }

      const deletedCount = await this._imageService.bulkDeleteImages(
        imageIds,
        req.user._id.toString()
      );

      if (deletedCount === 0) {
        res.status(HttpStatus.NOT_FOUND).json({ error: ErrorMessages.IMAGE_NOT_FOUND });
        return;
      }

      res.json({
        message: `${deletedCount} images deleted successfully`,
        deletedCount,
      });
    } catch (error: any) {
      console.error("Bulk delete images error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message || ErrorMessages.SERVER_ERROR});
    }
  };

  rearrangeImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { imageOrder } = req.body;

      if (!req.user?._id) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
        return;
      }

      if (!Array.isArray(imageOrder)) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: ErrorMessages.INVALID_IMAGE_ORDERS});
        return;
      }

      await this._imageService.rearrangeImages(
        req.user._id.toString(),
        imageOrder
      );

      res.json({ message: SuccessMessages.IMAGES_REARRANGED });
    } catch (error: any) {
      console.error("Rearrange image error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message || ErrorMessages.SERVER_ERROR});
    }
  };

  getImageStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?._id) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
        return;
      }

      const stats = await this._imageService.getImageStats(
        req.user._id.toString()
      );

      res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      console.error("Get image stats error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message || ErrorMessages.SERVER_ERROR});
    }
  };
}
