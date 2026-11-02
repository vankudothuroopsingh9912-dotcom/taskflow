import axios from 'axios';
import { Task, User, DashboardResponse } from '../types/index.ts';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized states
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is expired or invalid, remove it
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API Endpoints
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<{ success: boolean; token: string; user: User; message: string }>(
      '/auth/login',
      credentials
    );
    return res.data;
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    const res = await api.post<{ success: boolean; token: string; user: User; message: string }>(
      '/auth/register',
      userData
    );
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const res = await api.put<{ success: boolean; message: string; user: User }>(
      '/auth/profile',
      profileData
    );
    return res.data;
  },
};

// Tasks API Endpoints
export const taskService = {
  getTasks: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const res = await api.get<{ success: boolean; count: number; tasks: Task[] }>('/tasks', {
      params,
    });
    return res.data;
  },

  getTaskById: async (id: string) => {
    const res = await api.get<{ success: boolean; task: Task }>(`/tasks/${id}`);
    return res.data;
  },

  createTask: async (taskData: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate: string;
  }) => {
    const res = await api.post<{ success: boolean; message: string; task: Task }>('/tasks', taskData);
    return res.data;
  },

  updateTask: async (
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      status: string;
      priority: string;
      dueDate: string;
    }>
  ) => {
    const res = await api.put<{ success: boolean; message: string; task: Task }>(
      `/tasks/${id}`,
      updates
    );
    return res.data;
  },

  deleteTask: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string; id: string }>(`/tasks/${id}`);
    return res.data;
  },
};

// Dashboard API
export const dashboardService = {
  getStats: async () => {
    const res = await api.get<DashboardResponse>('/dashboard/stats');
    return res.data;
  },
};

// System API
export const systemService = {
  getStatus: async () => {
    const res = await api.get<{
      status: string;
      service: string;
      database: { type: string; connected: boolean; databaseName: string; uri: string };
    }>('/system/status');
    return res.data;
  },
};
