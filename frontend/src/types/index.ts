// User Types
export interface User {
  id: string;
  userName: string;
  email: string;
  phoneNumber?: string;
}

// Auth Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: Boolean | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updatedUser: Partial<User>) => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface RegisterData {
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Image Types
export interface Image {
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

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Route Props
export interface PrivateRouteProps {
  children: React.ReactNode;
}

export interface ResetPasswordRouteParams {
  token: string;
}

// Component Props
export interface LayoutProps {
  children: React.ReactNode;
}

export interface PageProps {
  // Add common page props here
}