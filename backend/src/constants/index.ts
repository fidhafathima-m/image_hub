// 1. HTTP STATUS CODES
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// 2. ERROR MESSAGES
export enum ErrorMessages {
  // Authentication
  USER_NOT_FOUND = 'User not found',
  USER_ALREADY_EXISTS = 'User already exists',
  INVALID_CREDENTIALS = 'Invalid credentials',
  INVALID_TOKEN = 'Invalid or expired token',
  UNAUTHORIZED = 'Unauthorized access',
  PASSWORD_RESET_EXPIRED = 'Password reset token has expired',
  
  // Images
  NO_FILE_UPLOADED = 'No file uploaded',
  FILE_TOO_LARGE = 'File size exceeds limit',
  INVALID_FILE_TYPE = 'Invalid file type',
  IMAGE_NOT_FOUND = 'Image not found',
  INVALID_IMAGE_IDS = 'Invalid image IDs array',
  INVALID_IMAGE_ORDERS = 'Invalid image order array',
  TITLE_COUNT_MISMATCH = 'Title count must match file count',
  
  // General
  SERVER_ERROR = 'Server error',
  VALIDATION_ERROR = 'Validation error',
}

// 3. SUCCESS MESSAGES
export enum SuccessMessages {
  // Authentication
  REGISTER_SUCCESS = 'User registered successfully!',
  LOGIN_SUCCESS = 'Logged In successfully!',
  PASSWORD_RESET_SENT = 'Password reset mail sent',
  PASSWORD_RESET_SUCCESS = 'Password reset successful!',
  
  // Images
  IMAGE_UPLOADED = 'Image uploaded successfully',
  BULK_IMAGES_UPLOADED = 'images uploaded',
  IMAGE_UPDATED = 'Image updated successfully!',
  IMAGE_DELETED = 'Image deleted successfully!',
  BULK_IMAGES_DELETED = 'images deleted successfully',
  IMAGES_REARRANGED = 'Images rearranged successfully',
}