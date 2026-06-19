package com.siaoa.application.usecases;

import com.siaoa.domain.entities.Notification;
import com.siaoa.domain.entities.NotificationType;

import java.util.List;
import java.util.UUID;

public interface NotificationUseCase {
    Notification createNotification(UUID userId, String title, String message, NotificationType type, String relatedEntity, UUID relatedId);
    List<Notification> listUserNotifications(UUID userId);
    Notification markAsRead(UUID notificationId, UUID userId);
}
