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
};

//Create a new task
export const createTask = async (req: Request, res: Response) => {
    try{
        const task = new Task({
            ...req.body,
            user: req.userId
        });
        await task.save();

        res.status(201).json({ success: true, task });
    } catch ( error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Update a task
export const updateTask = async ( req: Request, res: Response ) => {
    try{
        const task = await Task.findOneAndUpdate({
                _id: req.params.id,
                user: req.userId
        },
        req.body,
        { new: true, runValidators: true }
    );

        if ( !task ) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.json({ success: true, task });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Delete a task
export const deleteTask = async ( req: Request, res: Response ) => {
    try{
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
    
        if ( !task ) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.json({ success: true, message: 'Task deleted successfully' });
        
    } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
    }
}
    