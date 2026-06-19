import { api } from '@/lib/axios';

export interface Orientando {
  id: string;
  userId?: string;
  nome: string;
  email: string;
  projeto: string;
  categoria: string;
  tipoCurso: string;
  avatarCor: string;
  ativo: boolean;
  status: 'PENDENTE' | 'VINCULADO' | 'RECUSADO' | 'DESATIVADO';
}

export const orientandoService = {
  async listOrientandos(): Promise<Orientando[]> {
    const response = await api.get<Orientando[]>('/orientandos');
    return response.data;
  },

  async createOrientando(orientando: Omit<Orientando, 'id' | 'ativo' | 'status'>): Promise<Orientando> {
    const response = await api.post<Orientando>('/orientandos', orientando);
    return response.data;
  },

  async updateStatus(id: string, status: Orientando['status']): Promise<Orientando> {
    const response = await api.put<Orientando>(`/orientandos/${id}/status`, null, { params: { status } });
    return response.data;
  },

  async updateOrientando(id: string, orientando: Partial<Orientando>): Promise<Orientando> {
    const response = await api.put<Orientando>(`/orientandos/${id}`, orientando);
    return response.data;
  },

  async cancelOrientando(id: string): Promise<void> {
    await api.delete(`/orientandos/${id}`);
  }
};
