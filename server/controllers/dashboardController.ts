import { Response } from 'express';
import { Task, ITask } from '../models/Task.ts';
import { dbStatus, getMemoryDb } from '../config/db.ts';
import { AuthRequest } from '../middleware/auth.ts';

// @desc    Get dashboard metrics, recent tasks, and upcoming deadlines
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const userId = req.user._id;

    if (dbStatus.type === 'mongodb' && dbStatus.connected) {
      const allTasks = await Task.find({ user: userId }).sort({ createdAt: -1 });

      const totalTasks = allTasks.length;
      const todoTasks = allTasks.filter((t) => t.status === 'Todo').length;
      const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
      const completedTasks = allTasks.filter((t) => t.status === 'Done').length;

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Priority distribution
      const highPriority = allTasks.filter((t) => t.priority === 'High' && t.status !== 'Done').length;
      const mediumPriority = allTasks.filter((t) => t.priority === 'Medium' && t.status !== 'Done').length;
      const lowPriority = allTasks.filter((t) => t.priority === 'Low' && t.status !== 'Done').length;

      // Upcoming deadlines (pending tasks sorted by due date ascending)
      const now = new Date();
      const upcomingDeadlines = allTasks
        .filter((t) => t.status !== 'Done')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

      // Overdue tasks count
      const overdueTasks = allTasks.filter(
        (t) => t.status !== 'Done' && new Date(t.dueDate).getTime() < now.getTime()
      ).length;

      // Recent tasks
      const recentTasks = allTasks.slice(0, 5);

      res.json({
        success: true,
        stats: {
          totalTasks,
          todoTasks,
          inProgressTasks,
          completedTasks,
          completionRate,
          overdueTasks,
          priorityBreakdown: {
            high: highPriority,
            medium: mediumPriority,
            low: lowPriority,
          },
        },
        upcomingDeadlines,
        recentTasks,
        dbStatus: {
          type: dbStatus.type,
          databaseName: dbStatus.databaseName,
          connected: dbStatus.connected,
        },
      });
    } else {
      const memoryDb = getMemoryDb();
      const userTasks = memoryDb.tasks.filter((t) => t.user === userId);

      const totalTasks = userTasks.length;
      const todoTasks = userTasks.filter((t) => t.status === 'Todo').length;
      const inProgressTasks = userTasks.filter((t) => t.status === 'In Progress').length;
      const completedTasks = userTasks.filter((t) => t.status === 'Done').length;

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const highPriority = userTasks.filter((t) => t.priority === 'High' && t.status !== 'Done').length;
      const mediumPriority = userTasks.filter((t) => t.priority === 'Medium' && t.status !== 'Done').length;
      const lowPriority = userTasks.filter((t) => t.priority === 'Low' && t.status !== 'Done').length;

      const now = Date.now();
      const overdueTasks = userTasks.filter(
        (t) => t.status !== 'Done' && new Date(t.dueDate).getTime() < now
      ).length;

      const upcomingDeadlines = [...userTasks]
        .filter((t) => t.status !== 'Done')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

      const recentTasks = [...userTasks]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      res.json({
        success: true,
        stats: {
          totalTasks,
          todoTasks,
          inProgressTasks,
          completedTasks,
          completionRate,
          overdueTasks,
          priorityBreakdown: {
            high: highPriority,
            medium: mediumPriority,
            low: lowPriority,
          },
        },
        upcomingDeadlines,
        recentTasks,
        dbStatus: {
          type: dbStatus.type,
          databaseName: dbStatus.databaseName,
          connected: dbStatus.connected,
        },
      });
    }
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message,
    });
  }
};
