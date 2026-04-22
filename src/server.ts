import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from './config/passport';
import http from 'http';

import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { setupSocket } from './sockets/socketHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server ( needed for Socket.IO to work with Express )
const httpServer = http.createServer(app);

const io = setupSocket(httpServer); // Initialize Socket.IO with the HTTP server

app.set('io', io); // Make Socket.IO instance available in routes/controllers

// Middleware
app.use(helmet()); // Security headers
app.use(cors({    // Allow frontend to connect to backend
    origin: '*',
    credentials: true,
}));   
app.use(express.json()); // Parse JSON bodies
app.use(passport.initialize()); // Initialize Passport for authentication

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); 

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Task Manager API (TypeScript) is running! 🚀',
        version: '1.0'
    });
});

mongoose.connect(process.env.MONGO_URI as string)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));


// Start the server
httpServer.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io is ready for real-time connections`);
})