package com.siaoa.application.services;

import com.siaoa.application.usecases.NotificationUseCase;
import com.siaoa.domain.entities.Notification;
import com.siaoa.domain.entities.NotificationType;
import com.siaoa.domain.ports.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.siaoa.application.ports.outbound.EmailSenderPort;
import com.siaoa.application.ports.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationManagementService implements NotificationUseCase {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailSenderPort emailSenderPort;
    private final UserRepository userRepository;

    public NotificationManagementService(
            NotificationRepository notificationRepository, 
            SimpMessagingTemplate messagingTemplate,
            EmailSenderPort emailSenderPort,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
        this.emailSenderPort = emailSenderPort;
        this.userRepository = userRepository;
    }

    @Override
    public Notification createNotification(UUID userId, String title, String message, NotificationType type, String relatedEntity, UUID relatedId) {
        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .relatedEntity(relatedEntity)
                .relatedId(relatedId)
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);

        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", saved);
        } catch (Exception ex) {
            // best-effort: if websocket delivery fails, persist only
        }

        try {
            userRepository.findById(userId).ifPresent(user -> {
                String subject = "Nova Notificação: " + title;
                emailSenderPort.sendEmail(user.getEmail(), subject, message);
            });
        } catch (Exception ex) {
            // best-effort: se falhar o envio de email, não quebra a criação da notificação
        }

        return saved;
    }

    @Override
    public List<Notification> listUserNotifications(UUID userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    public Notification markAsRead(UUID notificationId, UUID userId) {
        Notification existing = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        Notification updated = Notification.builder()
                .id(existing.getId())
                .userId(existing.getUserId())
                .title(existing.getTitle())
                .message(existing.getMessage())
                .type(existing.getType())
                .relatedEntity(existing.getRelatedEntity())
                .relatedId(existing.getRelatedId())
                .readAt(LocalDateTime.now())
                .createdAt(existing.getCreatedAt())
                .build();

        return notificationRepository.update(updated);
    }
}
