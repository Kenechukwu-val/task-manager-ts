"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitTaskEvent = exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
;
const setupSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.data.userId = decoded.userId; // Store userId in socket data for later use
            next();
        }
        catch (error) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.data.userId} | Socket ID: ${socket.id}`);
        //join a room based on userId to send targeted updates
        socket.join(socket.data.userId);
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.data.userId}`);
        });
    });
    return io;
};
exports.setupSocket = setupSocket;
//Helper function to emit task updates to a specific user
const emitTaskEvent = (io, event, data, userId) => {
    if (userId) {
        io.to(userId).emit(event, data); // Send only to specific user
    }
    else {
        io.emit(event, data); // Broadcast to all connected clients
    }
};
exports.emitTaskEvent = emitTaskEvent;
