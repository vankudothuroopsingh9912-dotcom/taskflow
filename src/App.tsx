import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { TasksPage } from './pages/TasksPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { TaskModal } from './components/tasks/TaskModal.tsx';
import { TaskDetailsModal } from './components/tasks/TaskDetailsModal.tsx';
import { DeleteConfirmModal } from './components/tasks/DeleteConfirmModal.tsx';
import { ArchitectureGuideModal } from './components/docs/ArchitectureGuideModal.tsx';
import { NavigationTab, Task, TaskPriority, TaskStatus } from './types/index.ts';
import { taskService } from './services/api.ts';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('Todo');

  const [inspectingTask, setInspectingTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deletingTaskTitle, setDeletingTaskTitle] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const triggerRefresh = () => setRefreshCounter((c) => c + 1);

  // If session is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-violet-600 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500">Initializing TaskFlow MERN Engine...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show Login or Register
  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
  }

  // Task creation/edit handlers
  const handleOpenCreateTask = (defaultStatus: TaskStatus = 'Todo') => {
    setEditingTask(null);
    setDefaultTaskStatus(defaultStatus);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
  }) => {
    if (editingTask) {
      await taskService.updateTask(editingTask._id, taskData);
    } else {
      await taskService.createTask(taskData);
    }
    triggerRefresh();
  };

  // Inspect details handler
  const handleViewTaskDetails = (task: Task) => {
    setInspectingTask(task);
    setIsDetailsModalOpen(true);
  };

  // Delete handlers
  const handleDeletePrompt = (taskId: string) => {
    setDeletingTaskId(taskId);
    setDeletingTaskTitle('Selected Task');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;
    try {
      setIsDeleting(true);
      await taskService.deleteTask(deletingTaskId);
      setIsDeleteModalOpen(false);
      setDeletingTaskId(null);
      triggerRefresh();
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Status toggle from details modal
  const handleDetailsStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await taskService.updateTask(taskId, { status: newStatus });
    if (inspectingTask && inspectingTask._id === taskId) {
      setInspectingTask({ ...inspectingTask, status: newStatus });
    }
    triggerRefresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'docs') {
            setIsDocsOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenCreateTask={() => handleOpenCreateTask()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenDocs={() => setIsDocsOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'overview' && (
            <Dashboard
              onOpenCreateTask={() => handleOpenCreateTask()}
              onNavigateToTasks={(filterStatus) => {
                if (filterStatus === 'Todo') setCurrentTab('todo');
                else if (filterStatus === 'In Progress') setCurrentTab('in-progress');
                else if (filterStatus === 'Done') setCurrentTab('completed');
                else setCurrentTab('all');
              }}
              onViewTaskDetails={handleViewTaskDetails}
            />
          )}

          {currentTab === 'all' && (
            <TasksPage
              initialStatusFilter="all"
              searchQuery={searchQuery}
              onOpenCreateTask={handleOpenCreateTask}
              onEditTask={handleOpenEditTask}
              onViewDetails={handleViewTaskDetails}
              onDeleteTask={handleDeletePrompt}
              onRefreshTrigger={refreshCounter}
            />
          )}

          {currentTab === 'todo' && (
            <TasksPage
              initialStatusFilter="Todo"
              searchQuery={searchQuery}
              onOpenCreateTask={handleOpenCreateTask}
              onEditTask={handleOpenEditTask}
              onViewDetails={handleViewTaskDetails}
              onDeleteTask={handleDeletePrompt}
              onRefreshTrigger={refreshCounter}
            />
          )}

          {currentTab === 'in-progress' && (
            <TasksPage
              initialStatusFilter="In Progress"
              searchQuery={searchQuery}
              onOpenCreateTask={handleOpenCreateTask}
              onEditTask={handleOpenEditTask}
              onViewDetails={handleViewTaskDetails}
              onDeleteTask={handleDeletePrompt}
              onRefreshTrigger={refreshCounter}
            />
          )}

          {currentTab === 'completed' && (
            <TasksPage
              initialStatusFilter="Done"
              searchQuery={searchQuery}
              onOpenCreateTask={handleOpenCreateTask}
              onEditTask={handleOpenEditTask}
              onViewDetails={handleViewTaskDetails}
              onDeleteTask={handleDeletePrompt}
              onRefreshTrigger={refreshCounter}
            />
          )}

          {currentTab === 'profile' && <ProfilePage />}
        </main>
      </div>

      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
        defaultStatus={defaultTaskStatus}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        task={inspectingTask}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={(task) => {
          setIsDetailsModalOpen(false);
          handleOpenEditTask(task);
        }}
        onDelete={(id) => {
          setIsDetailsModalOpen(false);
          handleDeletePrompt(id);
        }}
        onStatusChange={handleDetailsStatusChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={deletingTaskTitle}
        isDeleting={isDeleting}
      />

      {/* Architecture & API Documentation Modal */}
      <ArchitectureGuideModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
