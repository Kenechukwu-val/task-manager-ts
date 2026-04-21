import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import User, { IUserDocument } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: (error: any, user?: IUserDocument | false) => void
    ) => {
        try {
        // Try to find user by Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if user exists with same email
            user = await User.findOne({ email: profile.emails?.[0]?.value });

            if (!user) {
            // Create new user
            user = await User.create({
                name: profile.displayName,
                email: profile.emails?.[0]?.value,
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
                provider: 'google',
                isEmailVerified: true,        // Google emails are verified
            });
            } else {
                // Link Google to existing account
                user.googleId = profile.id;
                user.avatar = profile.photos?.[0]?.value;
                user.provider = 'google';
                await user.save();
            }
        } else {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
        }
            done(null, user);
        } catch (err: any) {
            console.error('Google OAuth Error:', err.message);
            done(err);
        }
    }
    )
);

// GitHub OAuth Strategy
passport.use(
    new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: process.env.GITHUB_CALLBACK_URL!,
    },
    async (
        accessToken: string,
        refreshToken: string,
        profile: GitHubProfile,
        done: (error: any, user?: IUserDocument | false) => void
    ) => {
        try {
            let user = await User.findOne({ githubId: profile.id });

        if (!user) {
            const email = profile.emails?.[0]?.value;

            if (email) {
                user = await User.findOne({ email });
            }

            if (!user) {
                // Create new user from GitHub
                user = await User.create({
                name: profile.displayName || profile.username || 'GitHub User',
                email: email || `${profile.username}@github.placeholder.com`,
                githubId: profile.id,
                avatar: profile.photos?.[0]?.value,
                provider: 'github',
                isEmailVerified: true,
            });
            } else {
                // Link GitHub to existing account
                user.githubId = profile.id;
                user.avatar = profile.photos?.[0]?.value;
                user.provider = 'github';
                await user.save();
            }
        } else {
            user.lastLogin = new Date();
            await user.save();
        }
            done(null, user);
        } catch (err: any) {
            console.error('GitHub OAuth Error:', err.message);
            done(err);
            }
        }
    )
);

export default passport;