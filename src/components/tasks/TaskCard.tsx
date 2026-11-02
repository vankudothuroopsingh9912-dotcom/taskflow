import React from 'react';
import {
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types/index.ts';

interface TaskCardProps {
  task: Task;
  onViewDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getDueDetails = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    // Normalize to date comparison
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `${Math.abs(diffDays)}d overdue`,
        className: 'text-rose-600 font-semibold',
        isOverdue: true,
      };
    } else if (diffDays === 0) {
      return { label: 'Due today', className: 'text-amber-700 font-semibold', isOverdue: false };
    } else if (diffDays === 1) {
      return { label: 'Tomorrow', className: 'text-violet-700', isOverdue: false };
    } else {
      return {
        label: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        className: 'text-slate-500',
        isOverdue: false,
      };
    }
  };

  const due = getDueDetails(task.dueDate);

  const priorityStyles: Record<TaskPriority, { text: string; dot: string }> = {
    High: { text: 'text-rose-700 font-semibold', dot: 'bg-rose-500' },
    Medium: { text: 'text-amber-700 font-medium', dot: 'bg-amber-500' },
    Low: { text: 'text-emerald-700 font-medium', dot: 'bg-emerald-500' },
  };

  const nextStatusMap: Record<TaskStatus, TaskStatus> = {
    Todo: 'In Progress',
    'In Progress': 'Done',
    Done: 'Todo',
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-violet-300 hover:shadow-xs">
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-2 text-xs">
          {/* Priority metadata - zero pill, clean text */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className={`h-1.5 w-1.5 rounded-full ${priorityStyles[task.priority].dot}`} />
            <span className={priorityStyles[task.priority].text}>{task.priority}</span>
          </div>

          {/* Quick status selector toggle */}
          <button
            type="button"
            onClick={() => onStatusChange(task._id, nextStatusMap[task.status])}
            title={`Click to move to ${nextStatusMap[task.status]}`}
            className="flex items-center gap-1 rounded-md bg-slate-50 hover:bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:text-violet-700 border border-slate-200 transition-colors"
          >
            {task.status === 'Todo' && <ListTodo className="h-3 w-3 text-slate-400" />}
            {task.status === 'In Progress' && <Clock className="h-3 w-3 text-amber-500" />}
            {task.status === 'Done' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
            <span>{task.status}</span>
          </button>
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(task)}
          className={`text-sm font-semibold tracking-tight text-slate-900 line-clamp-2 cursor-pointer hover:text-violet-600 transition-colors ${
            task.status === 'Done' ? 'line-through text-slate-400' : ''
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Info Row */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-[11px]">
          {due.isOverdue ? (
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          ) : (
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          )}
          <span className={due.className}>{due.label}</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onViewDetails(task)}
            title="Inspect Task Details"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-violet-600 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            title="Delete Task"
            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
