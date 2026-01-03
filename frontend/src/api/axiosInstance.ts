import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_URL, ERROR_MESSAGES } from '../utils/constants';
import { CustomAxiosError } from '../types/api.js';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  withCredentials: true
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced token refresh logic
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosResponse | CustomAxiosError> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const refreshToken = localStorage.getItem('refreshToken');

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token endpoint
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        localStorage.setItem('token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update Authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear all auth data
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other error cases
    const customError: CustomAxiosError = new Error(error.message) as CustomAxiosError;
    
    if (error.response?.status === 403) {
      customError.message = ERROR_MESSAGES.FORBIDDEN;
      // Redirect to home or login if forbidden
      window.location.href = '/';
    }
    
    if (error.response?.status === 404) {
      customError.message = ERROR_MESSAGES.NOT_FOUND;
    }
    
    if (error.response?.status === 500) {
      customError.message = ERROR_MESSAGES.SERVER_ERROR;
    }

    customError.response = error.response;
    return Promise.reject(customError);
  }
);

export default axiosInstance;

// Helper functions
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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