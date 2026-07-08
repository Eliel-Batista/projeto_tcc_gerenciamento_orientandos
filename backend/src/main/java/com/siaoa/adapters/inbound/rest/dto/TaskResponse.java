package com.siaoa.adapters.inbound.rest.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.siaoa.domain.valueobjects.Priority;
import com.siaoa.domain.valueobjects.TaskStatus;
import com.siaoa.domain.valueobjects.TaskType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for task response in API responses.
 * Contains all task information for API consumers.
 */
public class TaskResponse {
    private UUID id;
    private UUID projectId;
    private String title;
    private String description;
    private TaskType taskType;
    private TaskStatus status;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
    private Priority priority;
    private UUID assignedToId;
    private UUID createdById;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    private List<TaskActivityDto> activities;
    private List<TaskCommentDto> comments;

    // Constructors
    public TaskResponse() {}

    public TaskResponse(
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
            List<TaskActivityDto> activities,
            List<TaskCommentDto> comments
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

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(TaskType taskType) {
        this.taskType = taskType;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public UUID getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(UUID assignedToId) {
        this.assignedToId = assignedToId;
    }

    public UUID getCreatedById() {
        return createdById;
    }

    public void setCreatedById(UUID createdById) {
        this.createdById = createdById;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<TaskActivityDto> getActivities() {
        return activities;
    }

    public void setActivities(List<TaskActivityDto> activities) {
        this.activities = activities;
    }

    public List<TaskCommentDto> getComments() {
        return comments;
    }

    public void setComments(List<TaskCommentDto> comments) {
        this.comments = comments;
    }
}
