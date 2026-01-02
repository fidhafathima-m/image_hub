import axiosInstance from './axiosInstance.js';
import { getMultipartHeaders } from './axiosInstance.js';
import { BASE_URL } from '../utils/constants.js';
import {
    ImageResponse,
    ApiError
} from '../types/api';

export const imagesAPI = {
    getImages: async (): Promise<ImageResponse[]> => {
        try {
            const response = await axiosInstance.get('/images');
            return response.data;
        } catch (error: any) {
            throw {
                message: error.response?.data?.error || 'Failed to fetch images',
                error: error.response?.data,
                status: error.response?.status
            } as ApiError;
        }
    },

    uploadImage: async (formData: FormData): Promise<{ message: string; image: ImageResponse }> => {
        try {
            const response = await axiosInstance.post('/images/upload', formData, {
                headers: getMultipartHeaders()
            });
            return response.data;
        } catch (error: any) {
            throw {
                message: error.response?.data?.error || 'Failed to upload image',
                error: error.response?.data,
                status: error.response?.status
            } as ApiError;
        }
    },

    bulkUploadImages: async (files: File[], titles: string[]): Promise<{ message: string; images: ImageResponse[] }> => {
        try {
            const formData = new FormData();

            files.forEach((file) => {
                formData.append('images', file);
            });

            titles.forEach((title) => {
                formData.append('titles', title);
            });

            const response = await axiosInstance.post('/images/bulk-upload', formData, {
                headers: getMultipartHeaders()
            });
            return response.data;
        } catch (error: any) {
            throw {
                message: error.response?.data?.error || 'Failed to upload images',
                error: error.response?.data,
                status: error.response?.status
            } as ApiError;
        }
    },

    updateImage: async (id: string, data: { title?: string; image?: File }): Promise<{ message: string; image: ImageResponse }> => {
        try {
            const formData = new FormData();

            if (data.title) {
                formData.append('title', data.title);
            }

            if (data.image) {
                formData.append('image', data.image);
            }

            const response = await axiosInstance.put(`/images/${id}`, formData, {
                headers: getMultipartHeaders()
            });
            return response.data;
        } catch (error: any) {
            throw {
                message: error.response?.data?.error || 'Failed to update image',
                error: error.response?.data,
                status: error.response?.status
            } as ApiError;
        }
    },

    deleteImage: async (id: string): Promise<{ message: string }> => {
        try {
            const response = await axiosInstance.delete(`/images/${id}`);
            return response.data;
        } catch (error: any) {
            throw {
                message: error.response?.data?.error || 'Failed to delete image',
                error: error.response?.data,
                status: error.response?.status
            } as ApiError;
        }
    },

    rearrangeImages: async (imageOrder: string[]): Promise<{ message: string }> => {
        try {
            const response = await axiosInstance.put('/images/rearrange/order', {
                imageOrder,
            });
            return response.data;
        } catch (error: any) {
            throw {
                message: error.response?.data?.error || 'Failed to rearrange images',
                error: error.response?.data,
                status: error.response?.status
            } as ApiError;
        }
    },

    getImageUrl: (fileName: string): string => {
        return `${BASE_URL}/uploads/${fileName}`;
    },

    // Optional: Get image by ID
    getImageById: async (id: string): Promise<ImageResponse> => {
        try {
            // If you have a GET /images/:id endpoint
            const response = await axiosInstance.get(`/images/${id}`);
            return response.data;
        } catch (error: any) {
            throw {
                message: error.response?.data?.error || 'Failed to fetch image',
                error: error.response?.data,
                status: error.response?.status
            } as ApiError;
        }
    },

    // Optional: Search images
    searchImages: async (query: string): Promise<ImageResponse[]> => {
        try {
            // If you have a search endpoint
            const response = await axiosInstance.get(`/images/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error: any) {
            throw {
                message: error.response?.data?.error || 'Failed to search images',
                error: error.response?.data,
                status: error.response?.status
            } as ApiError;
        }
    }
};

// Export type for images API
export type ImagesAPI = typeof imagesAPI;

// Helper function to create form data for single image upload
export const createImageFormData = (title: string, image: File): FormData => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    return formData;
};

// Helper function to validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Allowed types: JPEG, JPG, PNG, GIF, WebP'
        };
    }

    return { valid: true };
};

// Helper function to get image preview URL
export const getImagePreviewUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};