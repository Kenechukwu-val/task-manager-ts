"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("./config/passport"));
const http_1 = __importDefault(require("http"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const socketHandler_1 = require("./sockets/socketHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Create HTTP server ( needed for Socket.IO to work with Express )
const httpServer = http_1.default.createServer(app);
const io = (0, socketHandler_1.setupSocket)(httpServer); // Initialize Socket.IO with the HTTP server
app.set('io', io); // Make Socket.IO instance available in routes/controllers
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.socket.io"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"],
        },
    },
})); // Security headers with permissive CSP for development
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
app.use(express_1.default.json()); // Parse JSON bodies
app.use((0, cookie_parser_1.default)()); // Parse cookies
app.use(passport_1.default.initialize()); // Initialize Passport for authentication
// Serve static files (HTML, CSS, JS) from root directory
app.use(express_1.default.static('.'));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
// Serve test page at a nice URL
app.get('/test', (req, res) => {
    res.sendFile('test-socket.html', { root: '.' });
});
// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Task Manager API (TypeScript) is running! 🚀',
        version: '1.0',
        testPage: 'Visit /test to access the test page'
    });
});
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
// Start the server
httpServer.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io is ready for real-time connections`);
});
