import express, { Router } from 'express';
import { authController } from '../config/container';

const router: Router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgetPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
