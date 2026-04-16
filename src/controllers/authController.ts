import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

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
        
    }
}