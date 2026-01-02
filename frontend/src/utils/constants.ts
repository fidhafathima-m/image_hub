/// <reference types="vite/client" />

// API Configuration
export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const BASE_URL: string = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language'
} as const;

// Validation Constants
export const VALIDATION = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 50
    },
    PASSWORD: {
        MIN_LENGTH: 6,
        MAX_LENGTH: 100
    },
    EMAIL: {
        MAX_LENGTH: 100
    },
    PHONE: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 15
    },
    TITLE: {
        MAX_LENGTH: 100
    }
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    MAX_FILES: 10
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

// Success Messages
export const SUCCESS_MESSAGES = {
    REGISTER_SUCCESS: 'Registration successful!',
    LOGIN_SUCCESS: 'Login successful!',
    LOGOUT_SUCCESS: 'Logged out successfully!',
    UPLOAD_SUCCESS: 'Image uploaded successfully!',
    UPDATE_SUCCESS: 'Image updated successfully!',
    DELETE_SUCCESS: 'Image deleted successfully!'
} as const;

// Route Paths
export const ROUTE_PATHS = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password'
} as const;

export type LocalStorageKeys = typeof LOCAL_STORAGE_KEYS[keyof typeof LOCAL_STORAGE_KEYS];
export type RoutePaths = typeof ROUTE_PATHS[keyof typeof ROUTE_PATHS];