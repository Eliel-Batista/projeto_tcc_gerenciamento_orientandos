package com.siaoa.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Notification domain entity
 */
public class Notification {
    private final UUID id;
    private final UUID userId;
    private final String title;
    private final String message;
    private final NotificationType type;
    private final String relatedEntity;
    private final UUID relatedId;
    private final LocalDateTime readAt;
    private final LocalDateTime createdAt;

    public Notification(UUID id, UUID userId, String title, String message, NotificationType type, String relatedEntity, UUID relatedId, LocalDateTime readAt, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.relatedEntity = relatedEntity;
        this.relatedId = relatedId;
        this.readAt = readAt;
        this.createdAt = createdAt;
    }

    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    public static class NotificationBuilder {
        private UUID id;
        private UUID userId;
        private String title;
        private String message;
        private NotificationType type;
        private String relatedEntity;
        private UUID relatedId;
        private LocalDateTime readAt;
        private LocalDateTime createdAt;

        public NotificationBuilder id(UUID id) { this.id = id; return this; }
        public NotificationBuilder userId(UUID userId) { this.userId = userId; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder type(NotificationType type) { this.type = type; return this; }
        public NotificationBuilder relatedEntity(String relatedEntity) { this.relatedEntity = relatedEntity; return this; }
        public NotificationBuilder relatedId(UUID relatedId) { this.relatedId = relatedId; return this; }
        public NotificationBuilder readAt(LocalDateTime readAt) { this.readAt = readAt; return this; }
        public NotificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Notification build() {
            return new Notification(id, userId, title, message, type, relatedEntity, relatedId, readAt, createdAt);
        }
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public NotificationType getType() { return type; }
    public String getRelatedEntity() { return relatedEntity; }
    public UUID getRelatedId() { return relatedId; }
    public LocalDateTime getReadAt() { return readAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
