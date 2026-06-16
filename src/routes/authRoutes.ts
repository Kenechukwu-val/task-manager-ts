import express from 'express';
import { register, login } from '../controllers/authController';
import { supabaseCallback, socialLogin } from '../controllers/socialAuthController';
import { supabase } from '../config/supabase';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = express.Router();

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
router.get('/callback', supabaseCallback);
router.post('/social-login', socialLogin);

router.get('/google', async (req, res) => {
    const { data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'http://localhost:5000/api/auth/callback' }
    });
    if (data.url) res.redirect(data.url);
    else res.status(500).json({ success: false, message: 'OAuth initiation failed' });
});

router.get('/github', async (req, res) => {
    const { data } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: 'http://localhost:5000/api/auth/callback' }
    });
    if (data.url) res.redirect(data.url);
    else res.status(500).json({ success: false, message: 'OAuth initiation failed' });
});

export default router;