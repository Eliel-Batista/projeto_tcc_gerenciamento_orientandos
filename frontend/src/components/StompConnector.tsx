import React, { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Notification } from '@/types';

const StompConnector: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addToast = useNotificationStore((s) => s.addToast);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!token) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    // avoid double connect
    if (clientRef.current && clientRef.current.active) return;

    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
    const sockUrl = `${apiBase}/ws?access_token=${token}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(sockUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (message) => {
          try {
            const payload = JSON.parse(message.body) as Notification;
            addNotification(payload);
            // show transient toast
            addToast({ id: payload.id, title: payload.title, message: payload.message, type: payload.type });
          } catch (e) {
            console.error('Invalid notification payload', e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [token, addNotification]);

  return null;
};

export default StompConnector;
