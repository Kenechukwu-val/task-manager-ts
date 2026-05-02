import { Request, Response } from 'express';
import Task from '../models/Task';
import { emitTaskEvent } from '../sockets/socketHandler';

//Get all tasks for logged-in user
export const getTasks = async (req: Request, res: Response) => {
    try{

    if (!req.userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
        
        const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, tasks });

    }catch ( error: any ) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Create a new task
export const createTask = async (req: Request, res: Response) => {
    try{

    if (!req.userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

        const task = new Task({
            ...req.body,
            user: req.userId
        });
        await task.save();

        const io = req.app.get('io');
        emitTaskEvent(io, 'taskCreated', task, req.userId);

        res.status(201).json({ success: true, task });
    } catch ( error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Update a task
export const updateTask = async ( req: Request, res: Response ) => {
    try{

    if (!req.userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
        const task = await Task.findOneAndUpdate({
                _id: req.params.id,
                user: req.userId
        },
        req.body,
        { returnDocument: 'after', runValidators: true }
    );

        if ( !task ) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const io = req.app.get('io');
        emitTaskEvent(io, 'taskUpdated', task, req.userId);

        res.json({ success: true, task });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Delete a task
export const deleteTask = async ( req: Request, res: Response ) => {
    try{

    if (!req.userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
    
        if ( !task ) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const io = req.app.get('io');
        emitTaskEvent(io, 'taskDeleted', { taskId: req.params.id }, req.userId);

        res.json({ success: true, message: 'Task deleted successfully' });

    } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
    }
}
    