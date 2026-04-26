"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const zod_1 = require("zod");
const router = express_1.default.Router();
// Zod schema for task creation/update 
const taskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').trim(),
    description: zod_1.z.string().trim().optional(),
    status: zod_1.z.enum(['todo', 'in-progress', 'done']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
    dueDate: zod_1.z.union([
        zod_1.z.iso.datetime({ message: 'Invalid ISO datetime format (e.g. 2026-04-16T18:00:00Z)' }),
        zod_1.z.date()
    ]).optional(),
});
router.use(auth_1.authMiddleware); // Protect all task routes
router.get('/', taskController_1.getTasks);
router.post('/', (0, validate_1.validate)(taskSchema), taskController_1.createTask);
router.put('/:id', (0, validate_1.validate)(taskSchema), taskController_1.updateTask);
router.delete('/:id', taskController_1.deleteTask);
exports.default = router;
