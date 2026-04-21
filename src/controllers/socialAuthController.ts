import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET as string;

//Generate JWT after successful OAuth
const generateToken = (user: any) => {
    return jwt.sign(
        {
            userId: user._id,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const googleCallback = (req: Request, res: Response) => {
    const user = req.user as any; // Assuming user is attached to req by Passport

    if (!user) {
        return res.redirect('/login?error=auth_failed');
    }

    const token = generateToken(user);

    // Redirect to frontend with token
    // res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);

    res.json({
        success: true,
        message: 'Google Login successful',
        token, 
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            provider: user.provider
        },
    });
};

export const githubCallback = (req: Request, res: Response) => {
    const user = req.user as any; // Assuming user is attached to req by Passport

    if (!user) {
        return res.redirect('/login?error=auth_failed');
    }

    const token = generateToken(user);

    // Redirect to frontend with token
    // res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);

    res.json({
        success: true,
        message: 'GitHub Login successful',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            provider: user.provider
        },
    });
};