import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import path from 'path';
import passport from './config/passport';

import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { setupSocket } from './sockets/socketHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
const io = setupSocket(httpServer);

app.set('io', io);

// Middleware
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.socket.io"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", "ws://localhost:5000", "http://localhost:5000"],
            },
        },
    })
);
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(passport.initialize());


app.use(express.static(path.join(__dirname, '..')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// MongoDB Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error: any) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

connectDB();

// Start Server
httpServer.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io ready`);
});
