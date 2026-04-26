"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Register a new user
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        //Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }
        //Create new user
        const user = new User_1.default({ name, email, password });
        await user.save();
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        // Check if password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ success: false, message: 'JWT secret not configured' });
        }
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.login = login;
