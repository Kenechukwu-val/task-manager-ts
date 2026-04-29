"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubCallback = exports.googleCallback = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
// Generate JWT after successful OAuth
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
};
const googleCallback = (req, res) => {
    const user = req.user;
    if (!user) {
        return res.redirect('/test-socket.html?error=google-failed');
    }
    const token = generateToken(user);
    //Redirect to frontend with token
    res.redirect(`/test-socket.html?token=${encodeURIComponent(token)}&name=${encodeURIComponent(user.name || user.email)}`);
};
exports.googleCallback = googleCallback;
const githubCallback = (req, res) => {
    const user = req.user;
    if (!user) {
        return res.redirect('/test-socket.html?error=github-failed');
    }
    const token = generateToken(user);
    //Redirect to frontend with token
    res.redirect(`/test-socket.html?token=${encodeURIComponent(token)}&name=${encodeURIComponent(user.name || user.email)}`);
};
exports.githubCallback = githubCallback;
