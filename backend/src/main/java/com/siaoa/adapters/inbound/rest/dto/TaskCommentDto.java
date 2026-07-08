package com.siaoa.adapters.inbound.rest.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.UUID;

public class TaskCommentDto {
    private UUID id;
    private UUID taskId;
    private UUID authorId;
    private String content;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    private String authorName;

    public TaskCommentDto() {}

    public TaskCommentDto(UUID id, UUID taskId, UUID authorId, String content, LocalDateTime createdAt, String authorName) {
        this.id = id;
        this.taskId = taskId;
        this.authorId = authorId;
        this.content = content;
        this.createdAt = createdAt;
        this.authorName = authorName;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public UUID getAuthorId() { return authorId; }
    public void setAuthorId(UUID authorId) { this.authorId = authorId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
}
