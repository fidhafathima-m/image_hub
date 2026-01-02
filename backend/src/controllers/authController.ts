import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import sgMail from '@sendgrid/mail';
import {
    AuthRequest,
    RegisterBody,
    LoginBody,
    ForgotPasswordBody,
    ResetPasswordBody
} from '../types/index.js';
import User from '../models/UserSchema.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Register User
export const register = async (req: Request<{}, {}, RegisterBody>, res: Response): Promise<void> => {
    try {
        const { userName, email, phoneNumber, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists, please login.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            userName,
            email,
            phoneNumber,
            password: hashPassword,
        });
        await user.save();

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.status(200).json({
            message: 'User registered successfully!',
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                phoneNumber: user.phoneNumber,
            },
        });
    } catch (error: unknown) {
        console.error('Registration error: ', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Login
export const login = async (req: Request<{}, {}, LoginBody>, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.json({
            message: 'Logged In successfully!',
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                phoneNumber: user.phoneNumber,
            },
        });
    } catch (error: unknown) {
        console.error('Login error: ', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Forgot password
export const forgetPassword = async (req: Request<{}, {}, ForgotPasswordBody>, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate reset token
        const resetToken = randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordExpires = new Date(resetTokenExpiry);
        await user.save();

        // Create reset url
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        if (!process.env.EMAIL_USER) {
            throw new Error('EMAIL_USER is not defined');
        }

        // Send email using SendGrid
        const msg = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        };

        await sgMail.send(msg);

        res.json({ message: 'Password reset mail sent' });
    } catch (error: unknown) {
        console.error('Forget Password error: ', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Reset password
export const resetPassword = async (req: Request<{}, {}, ResetPasswordBody>, res: Response): Promise<void> => {
    try {
        const { token, password } = req.body;

        // Hash token
        const hashToken = createHash('sha256').update(token).digest('hex');

        // Find user
        const user = await User.findOne({
            resetPasswordToken: hashToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            res.status(400).json({ error: 'Invalid or expired token' });
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Update password
        user.password = hashPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Password reset successful!' });
    } catch (error: unknown) {
        console.error('Reset Password error: ', error);
        res.status(500).json({ error: 'Server error' });
    }
};