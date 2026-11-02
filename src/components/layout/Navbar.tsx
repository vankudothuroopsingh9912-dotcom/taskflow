import React from 'react';
import { Menu, Plus, Search, Database } from 'lucide-react';
import { NavigationTab } from '../../types/index.ts';

interface NavbarProps {
  currentTab: NavigationTab;
  onOpenSidebar: () => void;
  onOpenCreateTask: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenSidebar,
  onOpenCreateTask,
  searchQuery,
  onSearchChange,
  onOpenDocs,
}) => {
  const getPageTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'overview':
        return 'Dashboard Overview';
      case 'all':
        return 'All Tasks';
      case 'todo':
        return 'Todo Tasks';
      case 'in-progress':
        return 'In Progress Tasks';
      case 'completed':
        return 'Completed Tasks';
      case 'profile':
        return 'User Profile & Settings';
      case 'docs':
        return 'MERN Architecture & API Guide';
      default:
        return 'TaskFlow';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Zone 1: Mobile toggle + Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">
            {getPageTitle(currentTab)}
          </h1>
        </div>
      </div>

      {/* Zone 2: Live Search bar */}
      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title, keyword..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Zone 3: Database & Primary CTA Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenDocs}
          className="hidden xl:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          title="View MERN Stack API & MongoDB Architecture"
        >
          <Database className="h-3.5 w-3.5 text-violet-600" />
          <span>MERN Specs</span>
        </button>

        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 active:scale-[0.98] transition-all whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
