package com.siaoa.adapters.inbound.rest.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.siaoa.domain.valueobjects.Priority;
import com.siaoa.domain.valueobjects.TaskStatus;
import com.siaoa.domain.valueobjects.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO for creating a new task.
 */
public class TaskCreateRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Task type is required")
    private TaskType taskType;

    @NotNull(message = "Status is required")
    private TaskStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private UUID assignedToId;

    private List<String> activities;

    // Constructors
    public TaskCreateRequest() {}

    public TaskCreateRequest(
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

    public List<String> getActivities() {
        return activities;
    }

    public void setActivities(List<String> activities) {
        this.activities = activities;
    }
}
