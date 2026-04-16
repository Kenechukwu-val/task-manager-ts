import express from 'express';
import { register, login } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = express.Router();

// Zod schemas for validation
const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;