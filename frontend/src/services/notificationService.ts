import { api } from '@/lib/axios';
import type { Notification } from '@/types';

export const notificationService = {
  listUserNotifications: async (): Promise<Notification[]> => {
    const res = await api.get('/user/notifications');
    return res.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
};
