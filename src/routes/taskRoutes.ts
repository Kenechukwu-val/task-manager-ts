import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = express.Router();

// Zod schema for task creation/update 
const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').trim(),
    description: z.string().trim().optional(),
    status: z.enum(['todo', 'in-progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    
    dueDate: z.union([
        z.iso.datetime({ message: 'Invalid ISO datetime format (e.g. 2026-04-16T18:00:00Z)' }),
        z.date()
    ]).optional(),
});

router.use(authMiddleware);    // Protect all task routes

router.get('/', getTasks);
router.post('/', validate(taskSchema), createTask);
router.put('/:id', validate(taskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;