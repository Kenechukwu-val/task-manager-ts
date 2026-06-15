import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const router = express.Router();

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().trim().optional(),
  status: z.enum(["pending", "in-progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z
    .union([
      z.iso.datetime({ message: "Invalid ISO datetime format" }),
      z.date(),
    ])
    .optional(),
});

router.use(authMiddleware);

router.get("/", getTasks);
router.post("/", validate(taskSchema), createTask);
router.put("/:id", validate(taskSchema), updateTask);
router.delete("/:id", deleteTask);

export default router;
