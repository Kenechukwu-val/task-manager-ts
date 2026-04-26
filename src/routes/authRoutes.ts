import express from 'express';
import passport from 'passport';
import { register, login } from '../controllers/authController';
import { googleCallback, githubCallback } from '../controllers/socialAuthController';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = express.Router();

// ======================
// Traditional Email/Password Routes
// ======================

const registerSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string()
        .trim()
        .toLowerCase()
        .pipe(z.email('Invalid email address')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .pipe(z.email('Invalid email address')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// ======================
// Social Login Routes (OAuth)
// ======================

// Google OAuth Routes
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/callback', 
    passport.authenticate('google', { 
        session: false, 
        failureRedirect: '/login?error=google_failed' 
    }), 
    googleCallback
);

// GitHub OAuth Routes
router.get('/github', 
    passport.authenticate('github', { 
        scope: ['user:email'] 
    })
);

router.get('/github/callback', 
    passport.authenticate('github', { 
        session: false, 
        failureRedirect: '/login?error=github_failed' 
    }), 
    githubCallback
);

// Optional: Get current user (protected route)
router.get('/me', (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    // You can expand this later to return full user data
    res.json({ 
        success: true, 
        userId: req.userId 
    });
});

export default router;