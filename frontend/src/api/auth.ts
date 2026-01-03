import axiosInstance from "./axiosInstance.js";
import {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  ApiError,
  RefreshTokenResponse,
} from "../types/api";
import { AUTH_ROUTE_PATHS } from "../utils/constants.js";

export const authAPI = {
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post(
        AUTH_ROUTE_PATHS.REGISTER,
        userData
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Registration failed",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },

  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post(
        AUTH_ROUTE_PATHS.LOGIN,
        credentials
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Login failed",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post(AUTH_ROUTE_PATHS.RESFRESH_TOKEN, {
      refreshToken,
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const requestData: ForgotPasswordRequest = { email };
      const response = await axiosInstance.post(
        AUTH_ROUTE_PATHS.FORGOT_PASSWORD,
        requestData
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Failed to send reset email",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    try {
      const requestData: ResetPasswordRequest = { token, password };
      const response = await axiosInstance.post(
        AUTH_ROUTE_PATHS.RESET_PASSWORD,
        requestData
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.error || "Failed to reset password",
        error: error.response?.data,
        status: error.response?.status,
      } as ApiError;
    }
  },

  // Optional: Logout (client-side)
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear axios headers
    delete axiosInstance.defaults.headers.common["Authorization"];
  },
};

// Export type for auth API
export type AuthAPI = typeof authAPI;

// Helper function to store auth data
export const storeAuthData = (accessToken: string, refreshToken: string, user: any): void => {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};
// Helper function to clear auth data
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Helper function to check if user is authenticated
export const getTokens = (): { accessToken: string | null; refreshToken: string | null } => {
  return {
    accessToken: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken')
  };
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Helper function to get current user
export const getCurrentUser = (): any | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};
