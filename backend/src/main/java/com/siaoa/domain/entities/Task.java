package com.siaoa.domain.entities;

import com.siaoa.domain.valueobjects.Priority;
import com.siaoa.domain.valueobjects.TaskStatus;
import com.siaoa.domain.valueobjects.TaskType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Immutable Task entity representing a task/activity within a project.
 * Tasks can be leituras (readings), reuniões (meetings), entregas (deliverables), eventos (events), or other activities.
 */
public class Task {
    private final UUID id;
    private final UUID projectId;
    private final String title;
    private final String description;
    private final TaskType taskType;
    private final TaskStatus status;
    private final LocalDate dueDate;
    private final Priority priority;
    private final UUID assignedToId;
    private final UUID createdById;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final List<TaskActivity> activities;
    private final List<TaskComment> comments;

    public Task(
            UUID id,
            UUID projectId,
            String title,
            String description,
            TaskType taskType,
            TaskStatus status,
            LocalDate dueDate,
            Priority priority,
            UUID assignedToId,
            UUID createdById,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<TaskActivity> activities,
            List<TaskComment> comments
    ) {
        this.id = id;
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.taskType = taskType;
        this.status = status;
        this.dueDate = dueDate;
        this.priority = priority;
        this.assignedToId = assignedToId;
        this.createdById = createdById;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.activities = activities;
        this.comments = comments;
    }

    // Immutable getters
    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public TaskType getTaskType() {
        return taskType;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public Priority getPriority() {
        return priority;
    }

    public UUID getAssignedToId() {
        return assignedToId;
    }

    public UUID getCreatedById() {
        return createdById;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<TaskActivity> getActivities() {
        return activities != null ? new ArrayList<>(activities) : new ArrayList<>();
    }

    public List<TaskComment> getComments() {
        return comments != null ? new ArrayList<>(comments) : new ArrayList<>();
    }

    public boolean hasActivities() {
        return activities != null;
    }

    public boolean hasComments() {
        return comments != null;
    }

    /**
     * Builder pattern for creating Task instances with immutability.
     */
    public static class Builder {
        private UUID id;
        private UUID projectId;
        private String title;
        private String description;
        private TaskType taskType;
        private TaskStatus status;
        private LocalDate dueDate;
        private Priority priority;
        private UUID assignedToId;
        private UUID createdById;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<TaskActivity> activities = null;
        private List<TaskComment> comments = null;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder projectId(UUID projectId) {
            this.projectId = projectId;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder taskType(TaskType taskType) {
            this.taskType = taskType;
            return this;
        }

        public Builder status(TaskStatus status) {
            this.status = status;
            return this;
        }

        public Builder dueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
            return this;
        }

        public Builder priority(Priority priority) {
            this.priority = priority;
            return this;
        }

        public Builder assignedToId(UUID assignedToId) {
            this.assignedToId = assignedToId;
            return this;
        }

        public Builder createdById(UUID createdById) {
            this.createdById = createdById;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Builder activities(List<TaskActivity> activities) {
            this.activities = activities;
            return this;
        }

        public Builder comments(List<TaskComment> comments) {
            this.comments = comments;
            return this;
        }

        public Task build() {
            return new Task(
                    id, projectId, title, description, taskType, status,
                    dueDate, priority, assignedToId, createdById, createdAt, updatedAt,
                    activities, comments
            );
        }
    }
}
