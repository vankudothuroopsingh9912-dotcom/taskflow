import { Response } from 'express';
import { Task, ITask, TaskPriority, TaskStatus } from '../models/Task.ts';
import { dbStatus, getMemoryDb, saveEmbeddedDb } from '../config/db.ts';
import { AuthRequest } from '../middleware/auth.ts';

// @desc    Get all tasks for the logged in user with filtering, searching, and sorting
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const userId = req.user._id;
    const { status, priority, search, sortBy = 'dueDate', order = 'asc' } = req.query;

    if (dbStatus.type === 'mongodb' && dbStatus.connected) {
      const filter: any = { user: userId };

      if (status && status !== 'all') {
        filter.status = status;
      }

      if (priority && priority !== 'all') {
        filter.priority = priority;
      }

      if (search && typeof search === 'string' && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        filter.$or = [{ title: searchRegex }, { description: searchRegex }];
      }

      const sortOrder = order === 'desc' ? -1 : 1;
      const sortField = typeof sortBy === 'string' ? sortBy : 'dueDate';

      const tasks = await Task.find(filter).sort({ [sortField]: sortOrder });

      res.json({
        success: true,
        count: tasks.length,
        tasks,
      });
    } else {
      // Embedded store filtering
      const memoryDb = getMemoryDb();
      let userTasks = memoryDb.tasks.filter((t) => t.user === userId);

      if (status && status !== 'all') {
        userTasks = userTasks.filter((t) => t.status === status);
      }

      if (priority && priority !== 'all') {
        userTasks = userTasks.filter((t) => t.priority === priority);
      }

      if (search && typeof search === 'string' && search.trim() !== '') {
        const query = search.trim().toLowerCase();
        userTasks = userTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            (t.description && t.description.toLowerCase().includes(query))
        );
      }

      // Sort
      userTasks.sort((a, b) => {
        let valA = a[sortBy as string];
        let valB = b[sortBy as string];

        if (sortBy === 'priority') {
          const priorityWeight = { High: 3, Medium: 2, Low: 1 };
          valA = priorityWeight[a.priority as TaskPriority] || 0;
          valB = priorityWeight[b.priority as TaskPriority] || 0;
        } else if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (valA < valB) return order === 'desc' ? 1 : -1;
        if (valA > valB) return order === 'desc' ? -1 : 1;
        return 0;
      });

      res.json({
        success: true,
        count: userTasks.length,
        tasks: userTasks,
      });
    }
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks',
      error: error.message,
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const userId = req.user._id;

    if (dbStatus.type === 'mongodb' && dbStatus.connected) {
      const task = await Task.findOne({ _id: id, user: userId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found or access denied',
        });
        return;
      }

      res.json({
        success: true,
        task,
      });
    } else {
      const memoryDb = getMemoryDb();
      const task = memoryDb.tasks.find((t) => t._id === id && t.user === userId);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found or access denied',
        });
        return;
      }

      res.json({
        success: true,
        task,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task details',
      error: error.message,
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { title, description, priority = 'Medium', status = 'Todo', dueDate } = req.body;

    if (!title || title.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
      return;
    }

    if (!dueDate) {
      res.status(400).json({
        success: false,
        message: 'Task due date is required',
      });
      return;
    }

    const validPriorities: TaskPriority[] = ['Low', 'Medium', 'High'];
    if (!validPriorities.includes(priority)) {
      res.status(400).json({
        success: false,
        message: 'Priority must be Low, Medium, or High',
      });
      return;
    }

    const validStatuses: TaskStatus[] = ['Todo', 'In Progress', 'Done'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status must be Todo, In Progress, or Done',
      });
      return;
    }

    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid due date format',
      });
      return;
    }

    const userId = req.user._id;

    if (dbStatus.type === 'mongodb' && dbStatus.connected) {
      const task = await Task.create({
        user: userId,
        title: title.trim(),
        description: description ? description.trim() : '',
        priority,
        status,
        dueDate: parsedDueDate,
      });

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task,
      });
    } else {
      const memoryDb = getMemoryDb();
      const newId = 'tsk_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const nowIso = new Date().toISOString();

      const newTask = {
        _id: newId,
        user: userId,
        title: title.trim(),
        description: description ? description.trim() : '',
        priority,
        status,
        dueDate: parsedDueDate.toISOString(),
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      memoryDb.tasks.unshift(newTask);
      saveEmbeddedDb();

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task: newTask,
      });
    }
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message,
    });
  }
};

// @desc    Update task details or status
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const userId = req.user._id;
    const { title, description, priority, status, dueDate } = req.body;

    if (dbStatus.type === 'mongodb' && dbStatus.connected) {
      let task = await Task.findOne({ _id: id, user: userId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found or access denied',
        });
        return;
      }

      if (title !== undefined) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (priority !== undefined) task.priority = priority;
      if (status !== undefined) task.status = status;
      if (dueDate !== undefined) {
        const parsed = new Date(dueDate);
        if (isNaN(parsed.getTime())) {
          res.status(400).json({ success: false, message: 'Invalid due date' });
          return;
        }
        task.dueDate = parsed;
      }

      await task.save();

      res.json({
        success: true,
        message: 'Task updated successfully',
        task,
      });
    } else {
      const memoryDb = getMemoryDb();
      const taskIndex = memoryDb.tasks.findIndex((t) => t._id === id && t.user === userId);

      if (taskIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Task not found or access denied',
        });
        return;
      }

      const task = memoryDb.tasks[taskIndex];

      if (title !== undefined) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (priority !== undefined) task.priority = priority;
      if (status !== undefined) task.status = status;
      if (dueDate !== undefined) {
        const parsed = new Date(dueDate);
        if (isNaN(parsed.getTime())) {
          res.status(400).json({ success: false, message: 'Invalid due date' });
          return;
        }
        task.dueDate = parsed.toISOString();
      }

      task.updatedAt = new Date().toISOString();
      saveEmbeddedDb();

      res.json({
        success: true,
        message: 'Task updated successfully',
        task,
      });
    }
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message,
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const userId = req.user._id;

    if (dbStatus.type === 'mongodb' && dbStatus.connected) {
      const task = await Task.findOneAndDelete({ _id: id, user: userId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found or access denied',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Task deleted successfully',
        id,
      });
    } else {
      const memoryDb = getMemoryDb();
      const taskIndex = memoryDb.tasks.findIndex((t) => t._id === id && t.user === userId);

      if (taskIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Task not found or access denied',
        });
        return;
      }

      memoryDb.tasks.splice(taskIndex, 1);
      saveEmbeddedDb();

      res.json({
        success: true,
        message: 'Task deleted successfully',
        id,
      });
    }
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message,
    });
  }
};
