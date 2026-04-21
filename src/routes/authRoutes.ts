import express from 'express';
import { register, login } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { z } from 'zod';
import passport from 'passport';
import { googleCallback, githubCallback } from '../controllers/socialAuthController';

const router = express.Router();

// ======================
// Traditional Email/Password Routes
// ======================

// Zod schemas for validation
const registerSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string()
        .trim()
        .toLowerCase()
        .pipe(z.email('Invalid email')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .pipe(z.email('Invalid email')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// ======================
// Social Login Routes (OAuth)
// ======================

//Google OAuth Routes
router.get('/google',
    passport.authenticate('google',{ 
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

//Github OAuth Routes
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

//Get current user route (for testing purposes)
router.get('/me', (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.json({ success: true,user: req.userId });
});

export default router;