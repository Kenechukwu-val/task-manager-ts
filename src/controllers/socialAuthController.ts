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
        return res.redirect('/test-socket.html?error=google-failed');
    }

    const token = generateToken(user);

    //Redirect to frontend with token
    res.redirect(`/test-socket.html?token=${encodeURIComponent(token)}&name=${encodeURIComponent(user.name || user.email)}`);

};

export const githubCallback = (req: Request, res: Response) => {
    const user = req.user as any;

    if (!user) {
        return res.redirect('/test-socket.html?error=github-failed');
    }

    const token = generateToken(user);

    //Redirect to frontend with token
    res.redirect(`/test-socket.html?token=${encodeURIComponent(token)}&name=${encodeURIComponent(user.name || user.email)}`);
};
