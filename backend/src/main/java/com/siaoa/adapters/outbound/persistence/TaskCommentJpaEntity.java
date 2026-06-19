package com.siaoa.adapters.outbound.persistence;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_comments")
public class TaskCommentJpaEntity {
    @Id
    private UUID id;

    @Column(name = "task_id", insertable = false, updatable = false)
    private UUID taskId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Optional mapping to Users table to fetch Author name if desired
    // For now we'll just keep the ID.

    protected TaskCommentJpaEntity() {}

    public TaskCommentJpaEntity(UUID id, UUID taskId, UUID authorId, String content, LocalDateTime createdAt) {
        this.id = id;
        this.taskId = taskId;
        this.authorId = authorId;
        this.content = content;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getTaskId() { return taskId; }
    public UUID getAuthorId() { return authorId; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(UUID id) { this.id = id; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public void setAuthorId(UUID authorId) { this.authorId = authorId; }
    public void setContent(String content) { this.content = content; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
