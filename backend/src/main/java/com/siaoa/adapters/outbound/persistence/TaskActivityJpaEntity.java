package com.siaoa.adapters.outbound.persistence;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_activities")
public class TaskActivityJpaEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private TaskJpaEntity task;

    @Column(nullable = false)
    private String description;

    @Column(name = "is_completed", nullable = false)
    private boolean completed;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // JPA requires no-arg constructor
    protected TaskActivityJpaEntity() {}

    public TaskActivityJpaEntity(UUID id, TaskJpaEntity task, String description, boolean completed, LocalDateTime createdAt) {
        this.id = id;
        this.task = task;
        this.description = description;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getTaskId() { return task != null ? task.getId() : null; }
    public String getDescription() { return description; }
    public boolean isCompleted() { return completed; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    public void setId(UUID id) { this.id = id; }
    public void setTask(TaskJpaEntity task) { this.task = task; }
    public void setDescription(String description) { this.description = description; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
