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
    (req, res, next) => {
        // Store redirect_uri in session/cookie for callback
        const redirect = req.query.redirect;
        console.log('Google login initiated with redirect:', redirect);
        if (redirect) {
            res.cookie('oauth_redirect', redirect, { httpOnly: false, maxAge: 600000 }); // 10 min expiry
        }
        next();
    },
    passport.authenticate('google',{ 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/callback', 
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/login?error=google_failed'  
    }),
    (req, res) => {
        // Get redirect from cookie and pass to callback handler
        const redirect = req.cookies.oauth_redirect;
        console.log('Google callback - redirect from cookie:', redirect);
        if (redirect) {
            req.query.redirect = redirect;
            res.clearCookie('oauth_redirect');
        }
        googleCallback(req, res);
    }
);

//Github OAuth Routes
router.get('/github',
    (req, res, next) => {
        // Store redirect_uri in session/cookie for callback
        const redirect = req.query.redirect;
        console.log('GitHub login initiated with redirect:', redirect);
        if (redirect) {
            res.cookie('oauth_redirect', redirect, { httpOnly: false, maxAge: 600000 }); // 10 min expiry
        }
        next();
    },
    passport.authenticate('github', { 
        scope: ['user:email'] 
    })
);

router.get('/github/callback', 
    passport.authenticate('github', {
        session: false,
        failureRedirect: '/login?error=github_failed'  
    }),
    (req, res) => {
        // Get redirect from cookie and pass to callback handler
        const redirect = req.cookies.oauth_redirect;
        console.log('GitHub callback - redirect from cookie:', redirect);
        if (redirect) {
            req.query.redirect = redirect;
            res.clearCookie('oauth_redirect');
        }
        githubCallback(req, res);
    }
);

//Get current user route (for testing purposes)
router.get('/me', (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.json({ success: true,user: req.userId });
});

export default router;