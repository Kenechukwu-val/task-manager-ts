"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validate_1 = require("../middlewares/validate");
const zod_1 = require("zod");
const passport_1 = __importDefault(require("passport"));
const socialAuthController_1 = require("../controllers/socialAuthController");
const router = express_1.default.Router();
// ======================
// Traditional Email/Password Routes
// ======================
// Zod schemas for validation
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').trim(),
    email: zod_1.z.string()
        .trim()
        .toLowerCase()
        .pipe(zod_1.z.email('Invalid email')),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .trim()
        .toLowerCase()
        .pipe(zod_1.z.email('Invalid email')),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
// Routes
router.post('/register', (0, validate_1.validate)(registerSchema), authController_1.register);
router.post('/login', (0, validate_1.validate)(loginSchema), authController_1.login);
// ======================
// Social Login Routes (OAuth)
// ======================
//Google OAuth Routes
router.get('/google', (req, res, next) => {
    // Store redirect_uri in session/cookie for callback
    const redirect = req.query.redirect;
    console.log('Google login initiated with redirect:', redirect);
    if (redirect) {
        res.cookie('oauth_redirect', redirect, { httpOnly: false, maxAge: 600000 }); // 10 min expiry
    }
    next();
}, passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
}));
router.get('/google/callback', passport_1.default.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=google_failed'
}), (req, res) => {
    // Get redirect from cookie and pass to callback handler
    const redirect = req.cookies.oauth_redirect;
    console.log('Google callback - redirect from cookie:', redirect);
    // Note: We don't set req.query.redirect anymore - controller reads from cookies directly
    (0, socialAuthController_1.googleCallback)(req, res);
});
//Github OAuth Routes
router.get('/github', (req, res, next) => {
    // Store redirect_uri in session/cookie for callback
    const redirect = req.query.redirect;
    console.log('GitHub login initiated with redirect:', redirect);
    if (redirect) {
        res.cookie('oauth_redirect', redirect, { httpOnly: false, maxAge: 600000 }); // 10 min expiry
    }
    next();
}, passport_1.default.authenticate('github', {
    scope: ['user:email']
}));
router.get('/github/callback', passport_1.default.authenticate('github', {
    session: false,
    failureRedirect: '/login?error=github_failed'
}), (req, res) => {
    // Get redirect from cookie and pass to callback handler
    const redirect = req.cookies.oauth_redirect;
    console.log('GitHub callback - redirect from cookie:', redirect);
    if (redirect) {
        req.query.redirect = redirect;
        res.clearCookie('oauth_redirect');
    }
    (0, socialAuthController_1.githubCallback)(req, res);
});
//Get current user route (for testing purposes)
router.get('/me', (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.json({ success: true, user: req.userId });
});
exports.default = router;
