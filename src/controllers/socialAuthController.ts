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
    const user = req.user as any;

    console.log('=== GOOGLE CALLBACK ===');
    console.log('User:', user ? `${user.name} (${user.email})` : 'None');

    if (!user) {
        const redirectUri = (req as any).cookies?.oauth_redirect;
        console.log('No user, redirecting to:', redirectUri);
        if (redirectUri) {
            res.clearCookie('oauth_redirect');
            return res.redirect(`${redirectUri}?success=false&message=Authentication failed`);
        }
        return res.redirect('/login?error=auth_failed');
    }

    const token = generateToken(user);
    
    // Get redirect URI from cookie (not from req.query, which contains OAuth provider params)
    const redirectUri = (req as any).cookies?.oauth_redirect;
    
    console.log('Token generated:', token ? 'Yes' : 'No');
    console.log('Redirect URI from cookie:', redirectUri);
    
    if (redirectUri) {
        // Redirect to callback page with token as query parameter
        const finalUrl = `${redirectUri}?success=true&token=${token}&provider=google`;
        console.log('Redirecting to:', finalUrl);
        res.clearCookie('oauth_redirect');
        return res.redirect(finalUrl);
    }

    // Fallback to JSON response (for backward compatibility)
    console.log('No redirect URI, sending JSON response');
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

    console.log('=== GITHUB CALLBACK ===');
    console.log('User:', user ? `${user.name} (${user.email})` : 'None');
    console.log('Query params:', req.query);

    if (!user) {
        const redirectUri = req.query.redirect_uri || req.query.redirect;
        console.log('No user, redirecting to:', redirectUri);
        if (redirectUri) {
            return res.redirect(`${redirectUri}?success=false&message=Authentication failed`);
        }
        return res.redirect('/login?error=auth_failed');
    }

    const token = generateToken(user);
    
    // Check if a redirect URI was provided
    const redirectUri = req.query.redirect_uri || req.query.redirect;
    
    console.log('Token generated:', token ? 'Yes' : 'No');
    console.log('Redirect URI:', redirectUri);
    
    if (redirectUri) {
        // Redirect to callback page with token as query parameter
        const finalUrl = `${redirectUri}?success=true&token=${token}&provider=github`;
        console.log('Redirecting to:', finalUrl);
        return res.redirect(finalUrl);
    }

    // Fallback to JSON response (for backward compatibility)
    console.log('No redirect URI, sending JSON response');
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