"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const socialAuthController_1 = require("../controllers/socialAuthController");
const validate_1 = require("../middlewares/validate");
const zod_1 = require("zod");
const router = express_1.default.Router();
// ======================
// Traditional Email/Password Routes
// ======================
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').trim(),
    email: zod_1.z.string()
        .trim()
        .toLowerCase()
        .pipe(zod_1.z.email('Invalid email address')),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .trim()
        .toLowerCase()
        .pipe(zod_1.z.email('Invalid email address')),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
router.post('/register', (0, validate_1.validate)(registerSchema), authController_1.register);
router.post('/login', (0, validate_1.validate)(loginSchema), authController_1.login);
// ======================
// Social Login Routes (OAuth)
// ======================
// Google OAuth Routes
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
}));
router.get('/google/callback', passport_1.default.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=google_failed'
}), socialAuthController_1.googleCallback);
// GitHub OAuth Routes
router.get('/github', passport_1.default.authenticate('github', {
    scope: ['user:email']
}));
router.get('/github/callback', passport_1.default.authenticate('github', {
    session: false,
    failureRedirect: '/login?error=github_failed'
}), socialAuthController_1.githubCallback);
exports.default = router;
