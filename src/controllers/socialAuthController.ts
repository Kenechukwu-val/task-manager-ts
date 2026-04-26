import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Generate JWT after successful OAuth
const generateToken = (user: any) => {
    return jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const googleCallback = (req: Request, res: Response) => {
    const user = req.user as any;

    if (!user) {
        return res.redirect('/login?error=auth_failed');
    }

    const token = generateToken(user);

    // In production, you would redirect to your frontend with the token
    // For now, we'll return JSON so you can test easily
    res.json({
        success: true,
        message: 'Google login successful',
        token,
        user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
        },
    });
};

export const githubCallback = (req: Request, res: Response) => {
    const user = req.user as any;

    if (!user) {
        return res.redirect('/login?error=auth_failed');
    }

    const token = generateToken(user);

    res.json({
    success: true,
    message: 'GitHub login successful',
    token,
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
        },
    });
};