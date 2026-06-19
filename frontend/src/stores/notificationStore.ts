import { create } from 'zustand';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types';

type Toast = {
  id: string;
  title: string;
  message?: string;
  type?: Notification['type'];
  createdAt: string;
};

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  toasts: Toast[];
  loadNotifications: () => Promise<void>;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addToast: (t: Omit<Toast, 'createdAt'>) => void;
  removeToast: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  toasts: [],

  loadNotifications: async () => {
    try {
      const list = await notificationService.listUserNotifications();
      set((state) => {
        // Keep mock notifications that are generated locally (they have '-notif' in their ID)
        const mockNotifications = state.notifications.filter(n => n.id.endsWith('-notif'));
        const combined = [...mockNotifications, ...list.filter(n => !mockNotifications.find(m => m.id === n.id))];
        return { 
          notifications: combined, 
          unreadCount: combined.filter((n) => !n.readAt).length 
        };
      });
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  },

  addNotification: (n: Notification) => {
    set((state) => ({ notifications: [n, ...state.notifications], unreadCount: state.unreadCount + (n.readAt ? 0 : 1) }));
  },

  markAsRead: async (id: string) => {
    try {
      if (!id.endsWith('-notif')) {
        await notificationService.markAsRead(id);
      }
      const updated = get().notifications.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      set({ notifications: updated, unreadCount: updated.filter((n) => !n.readAt).length });
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  },

  markAllRead: async () => {
    try {
      const unread = get().notifications.filter((n) => !n.readAt);
      if (unread.length === 0) return;

      await Promise.all(unread.map((n) => notificationService.markAsRead(n.id)));

      const updated = get().notifications.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  },

  addToast: (t) => {
    const toast: Toast = { ...t, createdAt: new Date().toISOString() };
    set((state) => ({ toasts: [toast, ...state.toasts] }));

    // Auto-remove after 5s
    setTimeout(() => {
      const exists = get().toasts.find((x) => x.id === toast.id);
      if (exists) get().removeToast(toast.id);
    }, 5000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  clear: () => set({ notifications: [], unreadCount: 0, toasts: [] }),
}));
