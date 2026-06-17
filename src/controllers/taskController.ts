import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { emitTaskEvent } from "../sockets/socketHandler";

export const getTasks = async (req: Request, res: Response) => {
  // Extract and validate query parameters for pagination, filtering, and sorting
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
        const offset = (page - 1) * limit;
        const status = req.query.status as string;
        const priority = req.query.priority as string;
        const search = req.query.search as string;
        const sort = (req.query.sort as string) || 'created_at';
        const order = (req.query.order as string) || 'desc';

        let query = supabase
            .from('tasks')
            .select('*', { count: 'exact' })
            .eq('user_id', req.userId);

        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (search) query = query.ilike('title', `%${search}%`);

        const { data: tasks, error, count } = await query
            .order(sort, { ascending: order === 'asc' })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({
            success: true,
            tasks,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
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
