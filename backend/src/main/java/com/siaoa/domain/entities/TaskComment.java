package com.siaoa.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

public class TaskComment {
    private final UUID id;
    private final UUID taskId;
    private final UUID authorId;
    private final String content;
    private final LocalDateTime createdAt;
    private final String authorName; // Can be filled for UI presentation

    public TaskComment(UUID id, UUID taskId, UUID authorId, String content, LocalDateTime createdAt, String authorName) {
        this.id = id;
        this.taskId = taskId;
        this.authorId = authorId;
        this.content = content;
        this.createdAt = createdAt;
        this.authorName = authorName;
    }

    public UUID getId() { return id; }
    public UUID getTaskId() { return taskId; }
    public UUID getAuthorId() { return authorId; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getAuthorName() { return authorName; }

    public static class Builder {
        private UUID id;
        private UUID taskId;
        private UUID authorId;
        private String content;
        private LocalDateTime createdAt;
        private String authorName;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder taskId(UUID taskId) { this.taskId = taskId; return this; }
        public Builder authorId(UUID authorId) { this.authorId = authorId; return this; }
        public Builder content(String content) { this.content = content; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder authorName(String authorName) { this.authorName = authorName; return this; }

        public TaskComment build() {
            return new TaskComment(id, taskId, authorId, content, createdAt, authorName);
        }
    }
}
