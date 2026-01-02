import express, { Router } from 'express';
import { 
    register, 
    login, 
    forgetPassword, 
    resetPassword 
} from '../controllers/authController';

const router: Router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - User login
router.post('/login', login);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', forgetPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', resetPassword);

export default router;
