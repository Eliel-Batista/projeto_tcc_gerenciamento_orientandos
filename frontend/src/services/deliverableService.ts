import { api } from '@/lib/axios';
import type { Deliverable } from '@/types';

/**
 * Deliverable Request Types
 */
export interface DeliverableSubmitRequest {
  filePath: string;
}

export interface DeliverableFeedbackRequest {
  feedback: string;
  status: 'APPROVED' | 'REJECTED' | 'REVISION_NEEDED';
}

/**
 * Deliverable Service
 * Provides API client for deliverable operations
 */
export const deliverableService = {
  /**
   * Submit a deliverable for a task
   */
  async submitDeliverable(taskId: string, data: DeliverableSubmitRequest): Promise<Deliverable> {
    try {
      const response = await api.post<Deliverable>(
        `/deliverables?taskId=${taskId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Tarefa não encontrada');
      }
      throw error;
    }
  },

  /**
   * List deliverables for a task
   */
  async listDeliverablesByTask(taskId: string): Promise<Deliverable[]> {
    try {
      const response = await api.get<Deliverable[]>(
        `/deliverables?taskId=${taskId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Tarefa não encontrada');
      }
      throw error;
    }
  },

  /**
   * Get a specific deliverable
   */
  async getDeliverable(deliverableId: string): Promise<Deliverable> {
    try {
      const response = await api.get<Deliverable>(
        `/deliverables/${deliverableId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Entrega não encontrada');
      }
      throw error;
    }
  },

  /**
   * List user's deliverable submissions
   */
  async listUserDeliverables(): Promise<Deliverable[]> {
    try {
      const response = await api.get<Deliverable[]>(
        `/deliverables/user/submissions`
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Provide feedback on a deliverable
   */
  async provideFeedback(
    deliverableId: string,
    data: DeliverableFeedbackRequest
  ): Promise<Deliverable> {
    try {
      const response = await api.post<Deliverable>(
        `/deliverables/${deliverableId}/feedback`,
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Entrega não encontrada');
      }
      if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para fornecer feedback');
      }
      throw error;
    }
  },

  /**
   * Update deliverable status
   */
  async updateStatus(
    deliverableId: string,
    status: string
  ): Promise<Deliverable> {
    try {
      const response = await api.patch<Deliverable>(
        `/deliverables/${deliverableId}/status?status=${status}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Entrega não encontrada');
      }
      throw error;
    }
  },

  /**
   * Delete a deliverable
   */
  async deleteDeliverable(deliverableId: string): Promise<void> {
    try {
      await api.delete(`/deliverables/${deliverableId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Entrega não encontrada');
      }
      if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para deletar esta entrega');
      }
      throw error;
    }
  },

  /**
   * List pending deliverables waiting for feedback
   */
  async listPendingDeliverables(): Promise<Deliverable[]> {
    try {
      const response = await api.get<Deliverable[]>(
        `/deliverables/pending`
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
