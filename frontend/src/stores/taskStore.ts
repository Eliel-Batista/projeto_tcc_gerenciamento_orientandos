import { create } from 'zustand';
import { taskService } from '@/services/taskService';
import type { Task, TaskFilterCriteria } from '@/types';

interface TaskState {
  // State
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  filters: TaskFilterCriteria;

  // Fetch actions
  fetchTasksByProject: (projectId: string, filters?: TaskFilterCriteria) => Promise<void>;
  fetchUserTasks: (filters?: TaskFilterCriteria) => Promise<void>;

  // Selection actions
  selectTask: (task: Task) => void;
  clearSelectedTask: () => void;

  // Filter actions
  setFilters: (filters: TaskFilterCriteria) => void;
  resetFilters: () => void;

  // Local state mutations
  addTask: (task: Task) => void;
  updateTaskLocal: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  // Initial state
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  filters: {},

  // Fetch all user tasks
  fetchUserTasks: async (filters?: TaskFilterCriteria) => {
    set({ loading: true, error: null });
    try {
      const data = await taskService.listUserTasks(filters);
      set({ tasks: data, filters: filters || {}, loading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar tarefas';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Fetch tasks by project
  fetchTasksByProject: async (projectId: string, filters?: TaskFilterCriteria) => {
    set({ loading: true, error: null });
    try {
      const mergedFilters = { ...filters, projectId };
      const data = await taskService.listTasksByProject(projectId, mergedFilters);
      set({ tasks: data, filters: mergedFilters, loading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar tarefas do projeto';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Select a task for detailed view
  selectTask: (task: Task) => {
    set({ selectedTask: task });
  },

  // Clear selected task
  clearSelectedTask: () => {
    set({ selectedTask: null });
  },

  // Set filters
  setFilters: (filters: TaskFilterCriteria) => {
    set({ filters });
  },

  // Reset all filters
  resetFilters: () => {
    set({ filters: {} });
  },

  // Add new task to local state
  addTask: (task: Task) => {
    set((state) => ({
      tasks: [task, ...state.tasks],
    }));
  },

  // Update task in local state
  updateTaskLocal: (taskId: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
      selectedTask:
        state.selectedTask?.id === taskId
          ? { ...state.selectedTask, ...updates }
          : state.selectedTask,
    }));
  },

  // Remove task from local state
  removeTask: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
    }));
  },

  // Error handling
  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
