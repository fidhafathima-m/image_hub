// API Request/Response Types
export interface RegisterRequest {
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    userName: string;
    email: string;
    phoneNumber?: string;
  };
}

export interface ImageUploadRequest {
  title: string;
  image: File;
}

export interface BulkUploadRequest {
  files: File[];
  titles: string[];
}

export interface UpdateImageRequest {
  id: string;
  data: {
    title?: string;
    image?: File;
  };
}

export interface DeleteImageRequest {
  id: string;
}

export interface RearrangeImagesRequest {
  imageOrder: string[];
}

export interface ImageResponse {
  _id: string;
  title: string;
  url: string;
  fileName: string;
  originalName?: string;
  size?: number;
  mimetype?: string;
  order: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImagesResponse {
    success: boolean;
    images: ImageResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}

export interface ApiError {
  message: string;
  error?: string;
  status?: number;
  isUnauthorized?: boolean;
}

// Axios Instance Types
export interface AxiosInstanceConfig {
  baseURL: string;
  headers: Record<string, string>;
  timeout?: number;
}

export interface CustomAxiosError extends Error {
  isUnauthorized?: boolean;
  response?: {
    status: number;
    data: any;
  };
}