package com.siaoa.adapters.outbound.persistence;

import com.siaoa.domain.valueobjects.Priority;
import com.siaoa.domain.valueobjects.TaskStatus;
import com.siaoa.domain.valueobjects.TaskType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JPA entity mapping for Task domain entity.
 * Represents tasks/activities in projects stored in the database.
 */
@Entity
@Table(name = "tasks")
public class TaskJpaEntity {
    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false, length = 50)
    private TaskType taskType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TaskStatus status;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Priority priority;

    @Column(name = "assigned_to")
    private UUID assignedToId;

    @Column(name = "created_by", nullable = false)
    private UUID createdById;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<TaskActivityJpaEntity> activities = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<TaskCommentJpaEntity> comments = new ArrayList<>();

    // Constructors
    public TaskJpaEntity() {}

    public TaskJpaEntity(
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
            List<TaskActivityJpaEntity> activities,
            List<TaskCommentJpaEntity> comments
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
        this.activities = activities != null ? activities : new ArrayList<>();
        this.comments = comments != null ? comments : new ArrayList<>();
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

    public List<TaskActivityJpaEntity> getActivities() {
        return activities;
    }

    public void setActivities(List<TaskActivityJpaEntity> activities) {
        this.activities.clear();
        if (activities != null) {
            this.activities.addAll(activities);
        }
    }

    public List<TaskCommentJpaEntity> getComments() {
        return comments;
    }

    public void setComments(List<TaskCommentJpaEntity> comments) {
        this.comments.clear();
        if (comments != null) {
            this.comments.addAll(comments);
        }
    }
}
