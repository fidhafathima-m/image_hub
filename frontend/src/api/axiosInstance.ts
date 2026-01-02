import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_URL } from '../utils/constants';
import { CustomAxiosError } from '../types/api.js';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000, // 30 seconds timeout
    withCredentials: true // Include credentials if needed
});

// Add token to requests
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('token');
        if (token) {
            if (!config.headers) {
                config.headers = {} as any;
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error);
    }
);

// Handle token expiration and other response errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        // You can transform response data here if needed
        return response;
    },
    (error: AxiosError): Promise<CustomAxiosError> => {
        const customError: CustomAxiosError = new Error(error.message) as CustomAxiosError;
        
        if (error.response?.status === 401) {
            customError.isUnauthorized = true;
            // Optionally clear local storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if we're not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        if (error.response?.status === 403) {
            customError.message = 'Access forbidden. You do not have permission to perform this action.';
        }
        
        if (error.response?.status === 404) {
            customError.message = 'Resource not found.';
        }
        
        if (error.response?.status === 500) {
            customError.message = 'Server error. Please try again later.';
        }
        
        customError.response = error.response;
        return Promise.reject(customError);
    }
);

export default axiosInstance;

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function for file uploads
export const getMultipartHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data'
    };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
};