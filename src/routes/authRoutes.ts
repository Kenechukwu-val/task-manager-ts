import express from 'express';
import { register, login } from '../controllers/authController';
import { supabaseCallback } from '../controllers/socialAuthController';
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

export default router;