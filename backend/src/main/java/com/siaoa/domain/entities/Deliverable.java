package com.siaoa.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Deliverable Entity
 * Represents a submission/deliverable for a task
 * Immutable domain entity following Clean Architecture principles
 */
public class Deliverable {
    private final UUID id;
    private final UUID taskId;
    private final UUID submittedBy;
    private final String filePath;
    private final String feedback;
    private final DeliverableStatus status;
    private final LocalDateTime submissionDate;
    private final LocalDateTime feedbackDate;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public Deliverable(
            UUID id,
            UUID taskId,
            UUID submittedBy,
            String filePath,
            String feedback,
            DeliverableStatus status,
            LocalDateTime submissionDate,
            LocalDateTime feedbackDate,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
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

    // Builder pattern for convenient object creation
    public static DeliverableBuilder builder() {
        return new DeliverableBuilder();
    }

    public static class DeliverableBuilder {
        private UUID id;
        private UUID taskId;
        private UUID submittedBy;
        private String filePath;
        private String feedback;
        private DeliverableStatus status;
        private LocalDateTime submissionDate;
        private LocalDateTime feedbackDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public DeliverableBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public DeliverableBuilder taskId(UUID taskId) {
            this.taskId = taskId;
            return this;
        }

        public DeliverableBuilder submittedBy(UUID submittedBy) {
            this.submittedBy = submittedBy;
            return this;
        }

        public DeliverableBuilder filePath(String filePath) {
            this.filePath = filePath;
            return this;
        }

        public DeliverableBuilder feedback(String feedback) {
            this.feedback = feedback;
            return this;
        }

        public DeliverableBuilder status(DeliverableStatus status) {
            this.status = status;
            return this;
        }

        public DeliverableBuilder submissionDate(LocalDateTime submissionDate) {
            this.submissionDate = submissionDate;
            return this;
        }

        public DeliverableBuilder feedbackDate(LocalDateTime feedbackDate) {
            this.feedbackDate = feedbackDate;
            return this;
        }

        public DeliverableBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public DeliverableBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Deliverable build() {
            return new Deliverable(
                    id, taskId, submittedBy, filePath, feedback, status,
                    submissionDate, feedbackDate, createdAt, updatedAt
            );
        }
    }

    // Getters
    public UUID getId() {
        return id;
    }

    public UUID getTaskId() {
        return taskId;
    }

    public UUID getSubmittedBy() {
        return submittedBy;
    }

    public String getFilePath() {
        return filePath;
    }

    public String getFeedback() {
        return feedback;
    }

    public DeliverableStatus getStatus() {
        return status;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public LocalDateTime getFeedbackDate() {
        return feedbackDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
