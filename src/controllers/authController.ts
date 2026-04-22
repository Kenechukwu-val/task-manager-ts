import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';


// Register a new user
export const register = async (req: Request, res: Response) => {
    try{
        const {name, email, password} = req.body;

        //Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        //Create new user
        const user = new User({name, email, password});
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
        });
            
    } catch(error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Login user
export const login = async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
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
        const token = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: '7d' }
        );

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
    } catch(error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}