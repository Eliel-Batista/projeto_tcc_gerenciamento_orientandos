package com.siaoa.adapters.inbound.rest.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.siaoa.domain.valueobjects.Priority;
import com.siaoa.domain.valueobjects.TaskStatus;
import com.siaoa.domain.valueobjects.TaskType;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO for updating an existing task.
 * All fields are optional - only provided fields will be updated.
 */
public class TaskUpdateRequest {
    private String title;
    private String description;
    private TaskType taskType;
    private TaskStatus status;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
    private Priority priority;
    private UUID assignedToId;
    private List<TaskActivityDto> activities;
    private List<TaskCommentDto> comments;

    // Constructors
    public TaskUpdateRequest() {}

    public TaskUpdateRequest(
            String title,
            String description,
            TaskType taskType,
            TaskStatus status,
            LocalDate dueDate,
            Priority priority,
            UUID assignedToId
    ) {
        this.title = title;
        this.description = description;
        this.taskType = taskType;
        this.status = status;
        this.dueDate = dueDate;
        this.priority = priority;
        this.assignedToId = assignedToId;
    }

    public TaskUpdateRequest(
            String title,
            String description,
            TaskType taskType,
            TaskStatus status,
            LocalDate dueDate,
            Priority priority,
            UUID assignedToId,
            List<TaskActivityDto> activities,
            List<TaskCommentDto> comments
    ) {
        this.title = title;
        this.description = description;
        this.taskType = taskType;
        this.status = status;
        this.dueDate = dueDate;
        this.priority = priority;
        this.assignedToId = assignedToId;
        this.activities = activities;
        this.comments = comments;
    }

    // Getters and Setters
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
