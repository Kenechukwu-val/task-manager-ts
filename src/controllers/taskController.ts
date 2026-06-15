import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { emitTaskEvent } from "../sockets/socketHandler";

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({ ...req.body, user_id: req.userId })
      .select()
      .single();

    if (error) throw error;

    // Emit the new task to all connected clients
    const io = req.app.get("io");
    emitTaskEvent(io, "taskCreated", task, req.userId);

    res.status(201).json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { data: task, error } = await supabase
      .from("tasks")
      .update(req.body)
      .eq("id", req.params.id)
      .eq("user_id", req.userId)
      .select()
      .single();

    if (error || !task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const io = req.app.get("io");
    emitTaskEvent(io, "taskUpdated", task, req.userId);

    res.status(200).json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { data: task, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.userId)
      .select()
      .single();

    if (error || !task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const io = req.app.get("io");
    emitTaskEvent(io, "taskDeleted", task, req.userId);

    res.status(200).json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
