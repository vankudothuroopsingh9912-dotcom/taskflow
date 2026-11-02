import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  Edit2,
  Trash2,
  Copy,
  Check,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types/index.ts';

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  if (!isOpen || !task) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(task._id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const handleStatusClick = async (newStatus: TaskStatus) => {
    if (newStatus === task.status || isChangingStatus) return;
    try {
      setIsChangingStatus(true);
      await onStatusChange(task._id, newStatus);
    } finally {
      setIsChangingStatus(false);
    }
  };

  // Calculate relative due date
  const getDueStatus = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        icon: AlertTriangle,
      };
    } else if (diffDays === 0) {
      return {
        text: 'Due Today',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        icon: Clock,
      };
    } else if (diffDays === 1) {
      return {
        text: 'Due Tomorrow',
        color: 'text-violet-700 bg-violet-50 border-violet-200',
        icon: Clock,
      };
    } else {
      return {
        text: `Due in ${diffDays} days`,
        color: 'text-slate-600 bg-slate-100 border-slate-200',
        icon: Calendar,
      };
    }
  };

  const dueInfo = getDueStatus(task.dueDate);
  const DueIcon = dueInfo.icon;

  const priorityStyles: Record<TaskPriority, { text: string; bg: string }> = {
    Low: { text: 'text-emerald-700', bg: 'bg-emerald-50' },
    Medium: { text: 'text-amber-700', bg: 'bg-amber-50' },
    High: { text: 'text-rose-700', bg: 'bg-rose-50' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl transition-all z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono text-[11px] text-slate-400">ID: {task._id.slice(0, 10)}...</span>
              <button
                onClick={handleCopyId}
                title="Copy Full MongoDB Task ID"
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <span aria-hidden="true">·</span>
              <span className={`font-medium ${priorityStyles[task.priority].text}`}>
                {task.priority} Priority
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{task.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status Quick Changer */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Status State
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['Todo', 'In Progress', 'Done'] as TaskStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={isChangingStatus}
                  onClick={() => handleStatusClick(st)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all ${
                    task.status === st
                      ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {st === 'Todo' && <ListTodo className="h-3.5 w-3.5" />}
                  {st === 'In Progress' && <Clock className="h-3.5 w-3.5" />}
                  {st === 'Done' && <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Description
            </div>
            <div className="rounded-lg bg-slate-50 p-3.5 text-xs text-slate-700 leading-relaxed min-h-[72px] border border-slate-100 whitespace-pre-wrap">
              {task.description ? task.description : <span className="italic text-slate-400">No additional description provided.</span>}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
            <div>
              <div className="text-[11px] text-slate-400 font-medium mb-1">Due Deadline</div>
              <div className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${dueInfo.color}`}>
                <DueIcon className="h-3.5 w-3.5" />
                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="font-normal opacity-75 font-mono">({dueInfo.text})</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium mb-1">Created & Updated</div>
              <p className="text-slate-600 font-mono text-[11px]">
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </p>
              <p className="text-slate-400 font-mono text-[11px]">
                Updated: {new Date(task.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          <button
            onClick={() => {
              onClose();
              onDelete(task._id);
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Task</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <Edit2 className="h-3.5 w-3.5 text-violet-600" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
