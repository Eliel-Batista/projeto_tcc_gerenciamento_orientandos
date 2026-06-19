package com.siaoa.adapters.inbound.rest.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class TaskActivityDto {
    private UUID id;
    private UUID taskId;
    private String description;
    private boolean completed;
    private LocalDateTime createdAt;

    public TaskActivityDto() {}

    public TaskActivityDto(UUID id, UUID taskId, String description, boolean completed, LocalDateTime createdAt) {
        this.id = id;
        this.taskId = taskId;
        this.description = description;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
