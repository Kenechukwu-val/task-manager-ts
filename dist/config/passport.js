"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_github2_1 = require("passport-github2");
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Google OAuth Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Try to find user by Google ID
        let user = await User_1.default.findOne({ googleId: profile.id });
        if (!user) {
            // Check if user exists with same email
            user = await User_1.default.findOne({ email: profile.emails?.[0]?.value });
            if (!user) {
                // Create new user
                user = await User_1.default.create({
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value,
                    googleId: profile.id,
                    avatar: profile.photos?.[0]?.value,
                    provider: 'google',
                    isEmailVerified: true, // Google emails are verified
                });
            }
            else {
                // Link Google to existing account
                user.googleId = profile.id;
                user.avatar = profile.photos?.[0]?.value;
                user.provider = 'google';
                await user.save();
            }
        }
        else {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
        }
        done(null, user);
    }
    catch (err) {
        console.error('Google OAuth Error:', err.message);
        done(err);
    }
}));
// GitHub OAuth Strategy
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User_1.default.findOne({ githubId: profile.id });
        if (!user) {
            const email = profile.emails?.[0]?.value;
            if (email) {
                user = await User_1.default.findOne({ email });
            }
            if (!user) {
                // Create new user from GitHub
                user = await User_1.default.create({
                    name: profile.displayName || profile.username || 'GitHub User',
                    email: email || `${profile.username}@github.placeholder.com`,
                    githubId: profile.id,
                    avatar: profile.photos?.[0]?.value,
                    provider: 'github',
                    isEmailVerified: true,
                });
            }
            else {
                // Link GitHub to existing account
                user.githubId = profile.id;
                user.avatar = profile.photos?.[0]?.value;
                user.provider = 'github';
                await user.save();
            }
        }
        else {
            user.lastLogin = new Date();
            await user.save();
        }
        done(null, user);
    }
    catch (err) {
        console.error('GitHub OAuth Error:', err.message);
        done(err);
    }
}));
exports.default = passport_1.default;
