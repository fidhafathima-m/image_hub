// Form field interfaces
export interface FormField {
  name: string;
  value: string;
  error?: string;
  required?: boolean;
}

export interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  message: string;
  custom?: (value: string) => boolean;
}

// Form validation interface
export interface FormValidation {
  [key: string]: ValidationRule[];
}

// Auth form interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Component props interfaces
export interface AuthFormProps {
  onSubmit?: (data: any) => Promise<void>;
  loading?: boolean;
  error?: string;
  success?: boolean;
}

// Route params interfaces
export interface ResetPasswordParams {
  token: string;
}