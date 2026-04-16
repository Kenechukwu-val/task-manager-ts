import { Request, Response } from 'express';
import Task from '../models/Task';

//Get all tasks for logged-in user
export const getTasks = async (req: Request, res: Response) => {
    try{
        
        const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, tasks });

    }catch ( error: any ) {
        res.status(500).json({ success: false, message: error.message });
    }
}