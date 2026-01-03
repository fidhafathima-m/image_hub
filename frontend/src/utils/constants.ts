/// <reference types="vite/client" />

// API Configuration
export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const BASE_URL: string = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// Constants for better maintainability
export const UPLOAD_LIMITS = {
  MAX_FILES: 100,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] as const,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please login to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.'
} as const;

// Route Paths
export const AUTH_ROUTE_PATHS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    RESFRESH_TOKEN: "/auth/refresh-token"
} as const;

export const IMAGE_ROUTE_PATHS = {
    GET_IMAGES: (page: number, limit: number) => `/images?page=${page}&limit=${limit}`,
    UPLOAD_IMAGE: '/images/upload',
    BULK_UPLOAD_IMAGES: '/images/bulk-upload',
    UPDATE_IMAGE: (id: string) => `/images/${id}`,
    DELETE_IMAGE: (id: string) => `/images/${id}`,
    BULK_DELETE_IMAGES: '/images/bulk-delete',
    REARRANGE_IMAGES: '/images/rearrange/order',
    GET_IMAGE_STATS: '/images/stats'
} as const;

export type RoutePaths = typeof AUTH_ROUTE_PATHS[keyof typeof AUTH_ROUTE_PATHS];