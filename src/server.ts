import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import passport from './config/passport';   // ← Import Passport config

import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { setupSocket } from './sockets/socketHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server (required for Socket.io)
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = setupSocket(httpServer);

// Make io available to controllers
app.set('io', io);

// ======================
// Middleware
// ======================
app.use(helmet());
app.use(cors({
    origin: '*',                    
    credentials: true,
}));
app.use(express.json());

// Initialize Passport (Important for OAuth)
app.use(passport.initialize());

// ======================
// Routes
// ======================
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Task Manager API with Google & GitHub OAuth is running! 🚀',
        version: '1.2'
    });
});

// ======================
// MongoDB Connection
// ======================
const connectDB = async () => {
    try {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in .env file');
    }
    await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error: any) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

connectDB();

// ======================
// Start Server
// ======================
httpServer.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io is ready`);
    console.log(`🔑 Google Login: http://localhost:5000/api/auth/google`);
    console.log(`🔑 GitHub Login: http://localhost:5000/api/auth/github`);
});