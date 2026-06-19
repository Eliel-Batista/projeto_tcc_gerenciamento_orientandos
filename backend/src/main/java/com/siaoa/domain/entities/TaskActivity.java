package com.siaoa.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

public class TaskActivity {
    private final UUID id;
    private final UUID taskId;
    private final String description;
    private final boolean completed;
    private final LocalDateTime createdAt;

    public TaskActivity(UUID id, UUID taskId, String description, boolean completed, LocalDateTime createdAt) {
        this.id = id;
        this.taskId = taskId;
        this.description = description;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getTaskId() { return taskId; }
    public String getDescription() { return description; }
    public boolean isCompleted() { return completed; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public static class Builder {
        private UUID id;
        private UUID taskId;
        private String description;
        private boolean completed;
        private LocalDateTime createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder taskId(UUID taskId) { this.taskId = taskId; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder completed(boolean completed) { this.completed = completed; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public TaskActivity build() {
            return new TaskActivity(id, taskId, description, completed, createdAt);
        }
    }
}
