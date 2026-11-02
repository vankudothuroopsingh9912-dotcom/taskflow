import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  CheckCircle2,
  ListTodo,
  User as UserIcon,
  BookOpen,
  LogOut,
  X,
  Sparkles,
  Database,
} from 'lucide-react';
import { NavigationTab } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
  taskCounts?: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  taskCounts,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'all', label: 'All Tasks', icon: CheckSquare, count: taskCounts?.total },
    { id: 'todo', label: 'Todo', icon: ListTodo, count: taskCounts?.todo },
    { id: 'in-progress', label: 'In Progress', icon: Clock, count: taskCounts?.inProgress },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: taskCounts?.completed },
    { id: 'profile', label: 'User Profile', icon: UserIcon },
    { id: 'docs', label: 'Architecture & Docs', icon: BookOpen },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">TaskFlow</span>
              <span className="block text-[11px] font-medium text-violet-600 uppercase tracking-wider">
                MERN Stack
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 ${
                      isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isActive ? 'text-violet-700 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Database System Pill */}
        <div className="px-4 py-3 mx-4 mb-3 rounded-lg border border-slate-200/80 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Database className="h-3.5 w-3.5 text-violet-600" />
            <span>MongoDB Connected</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
            REST API & JWT active. Mongoose schemas synced.
          </p>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0 mr-2"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover border border-violet-200"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700 text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-violet-600 transition-colors">
                  {user?.name || 'TaskFlow User'}
                </p>
                <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
