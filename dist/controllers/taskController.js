"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const socketHandler_1 = require("../sockets/socketHandler");
//Get all tasks for logged-in user
const getTasks = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const tasks = await Task_1.default.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, tasks });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTasks = getTasks;
//Create a new task
const createTask = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const task = new Task_1.default({
            ...req.body,
            user: req.userId
        });
        await task.save();
        const io = req.app.get('io');
        (0, socketHandler_1.emitTaskEvent)(io, 'taskCreated', task, req.userId);
        res.status(201).json({ success: true, task });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createTask = createTask;
//Update a task
const updateTask = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const task = await Task_1.default.findOneAndUpdate({
            _id: req.params.id,
            user: req.userId
        }, req.body, { returnDocument: 'after', runValidators: true });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        const io = req.app.get('io');
        (0, socketHandler_1.emitTaskEvent)(io, 'taskUpdated', task, req.userId);
        res.json({ success: true, task });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateTask = updateTask;
//Delete a task
const deleteTask = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const task = await Task_1.default.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        const io = req.app.get('io');
        (0, socketHandler_1.emitTaskEvent)(io, 'taskDeleted', { taskId: req.params.id }, req.userId);
        res.json({ success: true, message: 'Task deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteTask = deleteTask;
