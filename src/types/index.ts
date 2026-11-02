export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export interface Task {
  _id: string;
  user: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  upcomingDeadlines: Task[];
  recentTasks: Task[];
  dbStatus: {
    type: string;
    databaseName: string;
    connected: boolean;
  };
}

export type ViewMode = 'list' | 'grid' | 'kanban';
export type NavigationTab = 'overview' | 'all' | 'todo' | 'in-progress' | 'completed' | 'profile' | 'docs';
