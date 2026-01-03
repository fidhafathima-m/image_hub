import axiosInstance from "./axiosInstance.js";
import { getMultipartHeaders } from "./axiosInstance.js";
import { BASE_URL, IMAGE_ROUTE_PATHS } from "../utils/constants.js";
import { ImageResponse, ApiError, ImagesResponse } from "../types/api";
import { Image } from "../types/index.js";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";

export const imagesAPI = {
  getImages: async (page = 1, limit = 10): Promise<ImagesResponse> => {
    try {
      const response = await axiosInstance.get(
        IMAGE_ROUTE_PATHS.GET_IMAGES(page, limit)
      );

      if (
        response.data.success &&
        response.data.images &&
        response.data.pagination
      ) {
        return response.data;
      } else if (Array.isArray(response.data)) {
        // Fallback for non-paginated response
        return {
          success: true,
          images: response.data,
          pagination: {
            page: 1,
            limit: response.data.length,
            total: response.data.length,
            totalPages: 1,
            hasMore: false,
          },
        };
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Failed to fetch images",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },
  uploadImage: async (
    formData: FormData
  ): Promise<{ message: string; image: ImageResponse }> => {
    try {
      const response = await axiosInstance.post(
        IMAGE_ROUTE_PATHS.UPLOAD_IMAGE,
        formData,
        {
          headers: getMultipartHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Failed to upload image",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },

  bulkUploadImages: async (
    files: File[],
    titles: string[]
  ): Promise<{ message: string; images: ImageResponse[] }> => {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("images", file);
      });

      titles.forEach((title) => {
        formData.append("titles", title);
      });

      const response = await axiosInstance.post(
        IMAGE_ROUTE_PATHS.BULK_UPLOAD_IMAGES,
        formData,
        {
          headers: getMultipartHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Failed to upload images",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },

  updateImage: async (
    id: string,
    data: { title?: string; image?: File }
  ): Promise<{ message: string; image: ImageResponse }> => {
    try {
      const formData = new FormData();

      if (data.title) {
        formData.append("title", data.title);
      }

      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await axiosInstance.put(
        IMAGE_ROUTE_PATHS.UPDATE_IMAGE(id),
        formData,
        {
          headers: getMultipartHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Failed to update image",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },

  deleteImage: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(
        IMAGE_ROUTE_PATHS.DELETE_IMAGE(id)
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Failed to delete image",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },

  bulkDeleteImages: async (
    imageIds: string[]
  ): Promise<{ message: string; deletedCount: number }> => {
    try {
      const response = await axiosInstance.post(
        IMAGE_ROUTE_PATHS.BULK_DELETE_IMAGES,
        {
          imageIds,
        }
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Failed to delete images",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },

  rearrangeImages: async (
    imageOrder: Array<{id: string, order: number}>
  ): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.put(
        IMAGE_ROUTE_PATHS.REARRANGE_IMAGES,
        {
          imageOrder,
        },
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Failed to rearrange images",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },

  getImageUrl: (image: Image): string => {
    // If we have a publicId (Cloudinary), use optimized URL
    if (image.publicId && CLOUDINARY_CLOUD_NAME) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_1200,c_limit,q_auto,f_auto/${image.publicId}`;
    }

    // Fallback to local URL
    return `${BASE_URL}${image.url}`;
  },

  // Get thumbnail URL for Cloudinary
  getThumbnailUrl: (image: Image): string => {
    if (image.publicId && CLOUDINARY_CLOUD_NAME) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_300,c_fill,q_auto,f_webp/${image.publicId}`;
    }

    // If thumbnailUrl exists, use it
    if (image.thumbnailUrl) {
      return image.thumbnailUrl;
    }

    // Fallback to regular image URL
    return imagesAPI.getImageUrl(image);
  },

  // Get optimized URL with custom transformations
  getOptimizedImageUrl: (
    image: Image,
    width?: number,
    height?: number
  ): string => {
    if (image.publicId && CLOUDINARY_CLOUD_NAME) {
      const transformations = [];

      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push("c_limit,q_auto,f_auto");

      const transformStr = transformations.join(",");
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}/${image.publicId}`;
    }

    // Fallback to original URL
    return image.url;
  },

  // Get image stats
  getImageStats: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        IMAGE_ROUTE_PATHS.GET_IMAGE_STATS
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Failed to fetch image stats",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },
};

// Helper function to validate image file for Cloudinary
export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Allowed types: JPEG, JPG, PNG, GIF, WebP",
    };
  }

  return { valid: true };
};

// Helper function to get file size in readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
