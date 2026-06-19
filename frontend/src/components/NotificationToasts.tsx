import React from 'react';
import { useNotificationStore } from '@/stores/notificationStore';

const typeStyles: Record<string, string> = {
  INFO: 'bg-blue-50 border-blue-200 text-blue-800',
  SUCCESS: 'bg-green-50 border-green-200 text-green-800',
  WARNING: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  ERROR: 'bg-red-50 border-red-200 text-red-800',
  REMINDER: 'bg-purple-50 border-purple-200 text-purple-800',
};

const NotificationToasts: React.FC = () => {
  const toasts = useNotificationStore((s) => s.toasts);
  const removeToast = useNotificationStore((s) => s.removeToast);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`w-80 border px-4 py-3 rounded shadow-lg backbone transition transform hover:translate-y-[-2px] ${
            typeStyles[t.type || 'INFO'] || typeStyles.INFO
          }`}
          onClick={() => removeToast(t.id)}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/40">
                {/* simple dot */}
                <span className="w-2 h-2 rounded-full bg-current inline-block" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{t.title}</div>
              {t.message && <div className="text-xs mt-1 text-gray-700">{t.message}</div>}
              <div className="text-xs text-gray-500 mt-1">{new Date(t.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToasts;
