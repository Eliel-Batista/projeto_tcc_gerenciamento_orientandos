import { api } from '@/lib/axios';
import type { Project } from '@/types';

export const projectService = {
  async listProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const response = await api.post<Project>('/projects', project);
    return response.data;
  },

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, project);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
