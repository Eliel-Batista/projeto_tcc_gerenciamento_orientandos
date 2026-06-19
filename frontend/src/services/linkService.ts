import { api } from '@/lib/axios';

export interface LinkItem {
  id: string;
  titulo: string;
  link: string;
  autor: string;
  comentario: string;
  isCreator: boolean;
  assignedUserIds?: string[];
}

export const linkService = {
  async listLinks(): Promise<LinkItem[]> {
    const response = await api.get<LinkItem[]>('/links');
    return response.data;
  },

  async createLink(linkData: Omit<LinkItem, 'id' | 'isCreator'>): Promise<LinkItem> {
    const response = await api.post<LinkItem>('/links', linkData);
    return response.data;
  },

  async deleteLink(id: string): Promise<void> {
    await api.delete(`/links/${id}`);
  }
};
