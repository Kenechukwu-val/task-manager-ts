import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import User, { IUserDocument } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL!;

// Google Strategy
passport.use(
    new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: (error: any, user?: any) => void
    ) => {
        try {
            let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.findOne({ email: profile.emails?.[0]?.value });

            if (!user) {
                // Create new user from Google
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value,
                    googleId: profile.id,
                    avatar: profile.photos?.[0]?.value,
                    provider: 'google',
                });
            } else {
                // Link Google account to existing user
                user.googleId = profile.id;
                user.avatar = profile.photos?.[0]?.value;
                await user.save();
            }
        }
                done(null, user);
            } catch (err) {
                done(err as Error);
            }
        }
    )
);

// GitHub Strategy
passport.use(
    new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: GITHUB_CALLBACK_URL,
    },
    async (
        accessToken: string,
        refreshToken: string,
        profile: GitHubProfile,
        done: (error: any, user?: any) => void
    ) => {
        try {
            let user = await User.findOne({ githubId: profile.id });

            if (!user) {
                // GitHub sometimes doesn't return email if private → handle carefully
                const email = profile.emails?.[0]?.value;

            if (email) {
                user = await User.findOne({ email });
            }

            if (!user) {
                user = await User.create({
                    name: profile.displayName || profile.username || 'GitHub User',
                    email: email || `${profile.username}@github.com`, // fallback
                    githubId: profile.id,
                    avatar: profile.photos?.[0]?.value,
                    provider: 'github',
                });
            } else {
                user.githubId = profile.id;
                user.avatar = profile.photos?.[0]?.value;
                await user.save();
            } 
        }
                done(null, user);
            } catch (err) {
                done(err as Error);
            }
        }
    )
);

export default passport;