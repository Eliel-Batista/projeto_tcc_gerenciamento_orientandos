package com.siaoa.infra.outbound.persistence.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DeliverableJpaEntity
 * JPA entity mapping for Deliverable domain entity
 */
@Entity
@Table(name = "deliverables")
public class DeliverableJpaEntity {
    
    @Id
    private UUID id;
    
    @Column(nullable = false)
    private UUID taskId;
    
    @Column(nullable = false)
    private UUID submittedBy;
    
    @Column(length = 500)
    private String filePath;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(length = 50, nullable = false)
    private String status = "PENDING";
    
    @Column(name = "submission_date")
    private LocalDateTime submissionDate;
    
    @Column(name = "feedback_date")
    private LocalDateTime feedbackDate;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Constructors
    public DeliverableJpaEntity() {}
    
    public DeliverableJpaEntity(UUID id, UUID taskId, UUID submittedBy, String filePath,
                                String feedback, String status, LocalDateTime submissionDate,
                                LocalDateTime feedbackDate, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.taskId = taskId;
        this.submittedBy = submittedBy;
        this.filePath = filePath;
        this.feedback = feedback;
        this.status = status;
        this.submissionDate = submissionDate;
        this.feedbackDate = feedbackDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getTaskId() {
        return taskId;
    }
    
    public void setTaskId(UUID taskId) {
        this.taskId = taskId;
    }
    
    public UUID getSubmittedBy() {
        return submittedBy;
    }
    
    public void setSubmittedBy(UUID submittedBy) {
        this.submittedBy = submittedBy;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public String getFeedback() {
        return feedback;
    }
    
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }
    
    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }
    
    public LocalDateTime getFeedbackDate() {
        return feedbackDate;
    }
    
    public void setFeedbackDate(LocalDateTime feedbackDate) {
        this.feedbackDate = feedbackDate;
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
}
