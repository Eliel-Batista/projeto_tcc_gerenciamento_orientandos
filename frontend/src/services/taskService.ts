import { api } from '@/lib/axios';
import type { Task, TaskCreateRequest, TaskUpdateRequest, TaskFilterCriteria } from '@/types';

/**
 * Task Service
 * Provides API client for task operations with JWT authentication
 */
export const taskService = {
  /**
   * List tasks for a specific project
   * @param projectId - Project ID to fetch tasks for
   * @param filters - Optional filters (status, priority, assigned user)
   * @returns Array of tasks
   * @throws Error if project not found (404) or not authorized (403)
   */
  async listTasksByProject(projectId: string, filters?: TaskFilterCriteria): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);

      const response = await api.get<Task[]>(`/projects/${projectId}/tasks`, { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Projeto não encontrado');
      }
      if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para acessar as tarefas deste projeto');
      }
      throw error;
    }
  },

  /**
   * List all tasks assigned to or created by the current user
   * @param filters - Optional filters (status, priority, project)
   * @returns Array of user's tasks
   */
  async listUserTasks(filters?: TaskFilterCriteria): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.projectId) params.append('projectId', filters.projectId);

      const response = await api.get<Task[]>('/user/tasks', { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * List all tasks assigned to a specific user (for Orientador)
   * @param targetUserId - Target User ID to fetch tasks for
   * @param filters - Optional filters
   * @returns Array of tasks
   */
  async listTasksByUser(targetUserId: string, filters?: TaskFilterCriteria): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      
      const response = await api.get<Task[]>(`/users/${targetUserId}/tasks`, { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get a specific task by ID
   * @param taskId - Task ID to fetch
   * @returns Task details
   * @throws Error if task not found (404) or not authorized (403)
   */
  async getTask(taskId: string): Promise<Task> {
    try {
      const response = await api.get<Task>(`/tasks/${taskId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Tarefa não encontrada');
      }
      if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para acessar esta tarefa');
      }
      throw error;
    }
  },

  /**
   * Create a new task
   * @param projectId - Project ID to create task in
   * @param data - Task creation data
   * @returns Created task
   * @throws Error if project not found (404) or validation fails (400)
   */
  async createTask(projectId: string, data: TaskCreateRequest): Promise<Task> {
    try {
      const response = await api.post<Task>(`/projects/${projectId}/tasks`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Projeto não encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Dados inválidos');
      }
      throw error;
    }
  },

  /**
   * Update an existing task
   * @param taskId - Task ID to update
   * @param data - Task update data (partial)
   * @returns Updated task
   * @throws Error if task not found (404), not authorized (403), or validation fails (400)
   */
  async updateTask(taskId: string, data: TaskUpdateRequest): Promise<Task> {
    try {
      const response = await api.put<Task>(`/tasks/${taskId}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Tarefa não encontrada');
      }
      if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para atualizar esta tarefa');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Dados inválidos');
      }
      throw error;
    }
  },

  /**
   * Delete a task
   * @param taskId - Task ID to delete
   * @throws Error if task not found (404), not authorized (403), or deletion fails
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Tarefa não encontrada');
      }
      if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para deletar esta tarefa');
      }
      throw error;
    }
  },
};
