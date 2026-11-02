import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  ListTodo,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { DashboardResponse, Task, TaskStatus } from '../types/index.ts';
import { dashboardService, taskService } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface DashboardProps {
  onOpenCreateTask: () => void;
  onNavigateToTasks: (filterStatus?: string) => void;
  onViewTaskDetails: (task: Task) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenCreateTask,
  onNavigateToTasks,
  onViewTaskDetails,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getStats();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-28 rounded-2xl bg-slate-200/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-xl bg-slate-200/40" />
          <div className="h-72 rounded-xl bg-slate-200/40" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    overdueTasks: 0,
    priorityBreakdown: { high: 0, medium: 0, low: 0 },
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-violet-300">
              Personal Productivity Center
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.name || 'Developer'}!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              You have <span className="font-semibold text-white font-mono tabular-nums">{stats.todoTasks + stats.inProgressTasks}</span> active tasks remaining. 
              {stats.overdueTasks > 0 ? (
                <span className="text-rose-300 font-medium ml-1">
                  ({stats.overdueTasks} item{stats.overdueTasks === 1 ? '' : 's'} require immediate attention).
                </span>
              ) : (
                <span className="text-emerald-300 font-medium ml-1"> All deadlines are on schedule!</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateToTasks()}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-medium text-white backdrop-blur-xs hover:bg-white/20 transition-colors"
            >
              Browse All Tasks
            </button>
            <button
              onClick={onOpenCreateTask}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-violet-950 shadow-sm hover:bg-violet-50 transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 text-violet-700" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Subtle Decorative Geometry */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div
          onClick={() => onNavigateToTasks('all')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-violet-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Tasks</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
              <CheckSquare className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {stats.totalTasks}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-violet-600 transition-colors">
              View all &rarr;
            </span>
          </div>
        </div>

        {/* Pending (Todo) */}
        <div
          onClick={() => onNavigateToTasks('Todo')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending (Todo)</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
              <ListTodo className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {stats.todoTasks}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-slate-700 transition-colors">
              Queued
            </span>
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => onNavigateToTasks('In Progress')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">In Progress</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-700 font-mono tabular-nums">
              {stats.inProgressTasks}
            </span>
            <span className="text-xs text-amber-600 font-medium">In action</span>
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => onNavigateToTasks('Done')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed Tasks</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
              {stats.completedTasks}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Resolved</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Progress Meter & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Progress & Priority Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Task Completion Rate</h3>
              <p className="text-xs text-slate-500">Overall ratio of resolved tasks</p>
            </div>
            <TrendingUp className="h-4 w-4 text-violet-600" />
          </div>

          <div className="mt-6 flex flex-col items-center justify-center">
            {/* Circular Progress Gauge */}
            <div className="relative flex items-center justify-center">
              <svg className="h-36 w-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-100"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={351.8}
                  strokeDashoffset={351.8 - (351.8 * stats.completionRate) / 100}
                  strokeLinecap="round"
                  className="text-violet-600 transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {stats.completionRate}%
                </span>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Done
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-center text-slate-500">
              <span className="font-semibold text-slate-800 font-mono tabular-nums">{stats.completedTasks}</span> of{' '}
              <span className="font-semibold text-slate-800 font-mono tabular-nums">{stats.totalTasks}</span> total tasks completed.
            </p>
          </div>

          {/* Active Priority Breakdown */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <span className="text-xs font-semibold text-slate-700">Active Priority Distribution</span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  High Priority
                </span>
                <span className="font-mono tabular-nums font-semibold text-slate-800">
                  {stats.priorityBreakdown.high}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Medium Priority
                </span>
                <span className="font-mono tabular-nums font-semibold text-slate-800">
                  {stats.priorityBreakdown.medium}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Low Priority
                </span>
                <span className="font-mono tabular-nums font-semibold text-slate-800">
                  {stats.priorityBreakdown.low}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h3>
                <p className="text-xs text-slate-500">Nearest active deliverables requiring closure</p>
              </div>
              <button
                onClick={() => onNavigateToTasks()}
                className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="mt-4 divide-y divide-slate-100">
              {data?.upcomingDeadlines && data.upcomingDeadlines.length > 0 ? (
                data.upcomingDeadlines.map((task) => {
                  const due = new Date(task.dueDate);
                  const now = new Date();
                  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdue = diffDays < 0;

                  return (
                    <div
                      key={task._id}
                      className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 px-2 rounded-lg transition-colors group"
                    >
                      <div
                        onClick={() => onViewTaskDetails(task)}
                        className="cursor-pointer min-w-0 flex-1 space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              task.priority === 'High'
                                ? 'bg-rose-500'
                                : task.priority === 'Medium'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-violet-600 transition-colors truncate">
                            {task.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{task.priority} Priority</span>
                          <span>·</span>
                          <span className="font-mono">{due.toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                            isOverdue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : diffDays <= 1
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isOverdue
                            ? `${Math.abs(diffDays)}d overdue`
                            : diffDays === 0
                            ? 'Today'
                            : diffDays === 1
                            ? 'Tomorrow'
                            : `In ${diffDays}d`}
                        </span>

                        <button
                          onClick={() => handleQuickStatusChange(task._id, 'Done')}
                          title="Mark as Completed"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                  No pending deadlines! All your active items have been resolved.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sorted chronologically by impending due date</span>
            <button
              onClick={onOpenCreateTask}
              className="text-violet-600 font-semibold hover:text-violet-700 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add task deadline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Tasks */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Tasks</h3>
            <p className="text-xs text-slate-500">Latest modified or recorded workflow items</p>
          </div>
          <button
            onClick={() => onNavigateToTasks()}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <span>Open Tasks Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tasks Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Title & Summary</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentTasks && data.recentTasks.length > 0 ? (
                data.recentTasks.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td
                      onClick={() => onViewTaskDetails(t)}
                      className="py-3 px-3 max-w-sm"
                    >
                      <p className={`font-semibold text-slate-800 group-hover:text-violet-600 transition-colors ${
                        t.status === 'Done' ? 'line-through text-slate-400' : ''
                      }`}>
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {t.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium ${
                          t.status === 'Done'
                            ? 'text-emerald-700 font-semibold'
                            : t.status === 'In Progress'
                            ? 'text-amber-700 font-semibold'
                            : 'text-slate-600'
                        }`}
                      >
                        {t.status === 'Done' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        {t.status === 'In Progress' && <Clock className="h-3.5 w-3.5 text-amber-500" />}
                        {t.status === 'Todo' && <ListTodo className="h-3.5 w-3.5 text-slate-400" />}
                        <span>{t.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`font-medium ${
                          t.priority === 'High'
                            ? 'text-rose-700 font-semibold'
                            : t.priority === 'Medium'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 tabular-nums">
                      {new Date(t.dueDate).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewTaskDetails(t);
                        }}
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No tasks found. Click &quot;Create Task&quot; above to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
