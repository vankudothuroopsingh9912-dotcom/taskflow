import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Columns3,
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Check,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, ViewMode } from '../types/index.ts';
import { taskService } from '../services/api.ts';
import { TaskCard } from '../components/tasks/TaskCard.tsx';

interface TasksPageProps {
  initialStatusFilter?: string;
  searchQuery: string;
  onOpenCreateTask: (defaultStatus?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onViewDetails: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onRefreshTrigger?: number;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  initialStatusFilter = 'all',
  searchQuery,
  onOpenCreateTask,
  onEditTask,
  onViewDetails,
  onDeleteTask,
  onRefreshTrigger,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Sync initial status prop if changed externally from sidebar
  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await taskService.getTasks({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        sortBy,
        order: sortOrder,
      });
      if (res.success) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, sortBy, sortOrder, onRefreshTrigger]);

  // Combine top-bar search query and local input filter
  const activeSearch = (searchQuery || localSearch).trim().toLowerCase();

  const filteredTasks = useMemo(() => {
    if (!activeSearch) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(activeSearch) ||
        (t.description && t.description.toLowerCase().includes(activeSearch))
    );
  }, [tasks, activeSearch]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      await taskService.updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchTasks();
    }
  };

  // Kanban groupings
  const kanbanTodo = filteredTasks.filter((t) => t.status === 'Todo');
  const kanbanInProgress = filteredTasks.filter((t) => t.status === 'In Progress');
  const kanbanDone = filteredTasks.filter((t) => t.status === 'Done');

  const priorityStyles: Record<TaskPriority, { text: string; bg: string }> = {
    High: { text: 'text-rose-700', bg: 'bg-rose-50' },
    Medium: { text: 'text-amber-700', bg: 'bg-amber-50' },
    Low: { text: 'text-emerald-700', bg: 'bg-emerald-50' },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Filter Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Top bar controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 border border-slate-200/60">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'Todo', label: 'Todo' },
              { id: 'In Progress', label: 'In Progress' },
              { id: 'Done', label: 'Done' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-violet-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Action & View controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                onClick={() => setViewMode('list')}
                title="Table View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-violet-50 text-violet-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid Cards View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-violet-50 text-violet-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                title="Kanban Board View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'kanban' ? 'bg-violet-50 text-violet-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Columns3 className="h-4 w-4" />
              </button>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-violet-600 focus:outline-none"
            >
              <option value="all">Priority: All</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, ord] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(ord as 'asc' | 'desc');
                }}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="dueDate-asc">Due Date (Earliest)</option>
                <option value="dueDate-desc">Due Date (Latest)</option>
                <option value="priority-desc">Priority (High to Low)</option>
                <option value="createdAt-desc">Created (Newest)</option>
                <option value="createdAt-asc">Created (Oldest)</option>
              </select>
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => onOpenCreateTask(statusFilter !== 'all' ? (statusFilter as TaskStatus) : 'Todo')}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Local Filter Info Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900 font-mono tabular-nums">{filteredTasks.length}</strong> tasks
            </span>
            {activeSearch && (
              <span className="text-violet-600 font-medium">
                (filtered by keyword &quot;{activeSearch}&quot;)
              </span>
            )}
          </div>
          <div className="relative md:hidden w-48">
            <input
              type="text"
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          <p className="mt-2 text-xs text-slate-500">Querying tasks from database...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <ListTodo className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">No tasks found</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {activeSearch
              ? `No items match "${activeSearch}". Try broadening your search or resetting filters.`
              : 'You do not have any tasks in this view. Create a new task to organize your work.'}
          </p>
          <div className="mt-6 flex items-center gap-3">
            {activeSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={() => onOpenCreateTask(statusFilter !== 'all' ? (statusFilter as TaskStatus) : 'Todo')}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* TABLE LIST VIEW */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-medium">
                  <th className="py-3 px-4 w-12 text-center">Done</th>
                  <th className="py-3 px-4">Task Title & Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const isDone = task.status === 'Done';
                  const due = new Date(task.dueDate);
                  const isOverdue = !isDone && due.getTime() < Date.now();

                  return (
                    <tr
                      key={task._id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Checkbox Quick Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task._id, isDone ? 'Todo' : 'Done');
                          }}
                          className={`flex h-5 w-5 mx-auto items-center justify-center rounded border transition-colors ${
                            isDone
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 hover:border-violet-600'
                          }`}
                          title={isDone ? 'Mark as Todo' : 'Mark as Done'}
                        >
                          {isDone && <Check className="h-3.5 w-3.5" />}
                        </button>
                      </td>

                      {/* Title & Description */}
                      <td
                        onClick={() => onViewDetails(task)}
                        className="py-3.5 px-4 max-w-md"
                      >
                        <p
                          className={`text-sm font-semibold text-slate-900 group-hover:text-violet-600 transition-colors ${
                            isDone ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={task.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(task._id, e.target.value as TaskStatus)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs focus:border-violet-600 focus:outline-none"
                        >
                          <option value="Todo">Todo</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            task.priority === 'High'
                              ? 'text-rose-700'
                              : task.priority === 'Medium'
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 font-mono text-xs tabular-nums">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {due.toLocaleDateString()}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(task);
                            }}
                            title="Inspect Details"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(task);
                            }}
                            title="Edit"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-violet-600 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task._id);
                            }}
                            title="Delete"
                            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onViewDetails={onViewDetails}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Todo Column */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-4 min-h-[450px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-slate-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Todo
                </h4>
              </div>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600 tabular-nums">
                {kanbanTodo.length}
              </span>
            </div>

            <div className="mt-3 flex-1 space-y-3 overflow-y-auto">
              {kanbanTodo.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onViewDetails={onViewDetails}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {kanbanTodo.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 italic">No todo items</div>
              )}
            </div>

            <button
              onClick={() => onOpenCreateTask('Todo')}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 hover:border-violet-500 hover:text-violet-600 hover:bg-white transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Todo</span>
            </button>
          </div>

          {/* In Progress Column */}
          <div className="flex flex-col rounded-xl border border-amber-200/80 bg-amber-50/30 p-4 min-h-[450px]">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  In Progress
                </h4>
              </div>
              <span className="rounded-full bg-amber-200 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-800 tabular-nums">
                {kanbanInProgress.length}
              </span>
            </div>

            <div className="mt-3 flex-1 space-y-3 overflow-y-auto">
              {kanbanInProgress.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onViewDetails={onViewDetails}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {kanbanInProgress.length === 0 && (
                <div className="py-8 text-center text-xs text-amber-600/60 italic">
                  No tasks currently in progress
                </div>
              )}
            </div>

            <button
              onClick={() => onOpenCreateTask('In Progress')}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-amber-300 py-2 text-xs font-medium text-amber-700 hover:border-amber-500 hover:bg-white transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add In Progress</span>
            </button>
          </div>

          {/* Done Column */}
          <div className="flex flex-col rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4 min-h-[450px]">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Completed
                </h4>
              </div>
              <span className="rounded-full bg-emerald-200 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800 tabular-nums">
                {kanbanDone.length}
              </span>
            </div>

            <div className="mt-3 flex-1 space-y-3 overflow-y-auto">
              {kanbanDone.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onViewDetails={onViewDetails}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {kanbanDone.length === 0 && (
                <div className="py-8 text-center text-xs text-emerald-600/60 italic">
                  No completed tasks yet
                </div>
              )}
            </div>

            <button
              onClick={() => onOpenCreateTask('Done')}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-emerald-300 py-2 text-xs font-medium text-emerald-700 hover:border-emerald-500 hover:bg-white transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Completed</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
