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
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Serve test-socket.html
app.get('/test-socket.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'test-socket.html'));
});

// Redirect root and unknown routes to test page
app.get('/', (req, res) => {
    res.redirect('/test-socket.html');
});

app.get('*', (req, res) => {
    res.redirect('/test-socket.html');
});

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
    console.log(`🌐 Test Page: http://localhost:5000/test-socket.html`);
});