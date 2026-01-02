import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/UserSchema';
import { AuthRequest, JwtUserPayload } from '../types/index';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            throw new Error('No token provided');
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtUserPayload;
        
        if (!decoded.userId) {
            throw new Error('Invalid token payload');
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new Error('User not found');
        }

        req.user = {
            _id: user._id,
            userName: user.userName,
            email: user.email,
            phoneNumber: user.phoneNumber,
        };

        // Add token to request if needed (optional)
        (req as any).token = token;
        
        next();
    } catch (error: unknown) {
        console.error('Authentication error:', error);
        
        let errorMessage = 'Please authenticate!';
        if (error instanceof Error) {
            if (error.name === 'TokenExpiredError') {
                errorMessage = 'Token has expired';
            } else if (error.name === 'JsonWebTokenError') {
                errorMessage = 'Invalid token';
            }
        }
        
        res.status(401).json({ error: errorMessage });
    }
};
