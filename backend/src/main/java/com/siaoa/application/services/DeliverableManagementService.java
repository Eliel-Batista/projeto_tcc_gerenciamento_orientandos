package com.siaoa.application.services;

import com.siaoa.application.usecases.DeliverableManagementUseCase;
import com.siaoa.application.usecases.NotificationUseCase;
import com.siaoa.application.ports.repository.TaskRepository;
import com.siaoa.application.ports.repository.UserRepository;
import com.siaoa.domain.entities.Deliverable;
import com.siaoa.domain.entities.DeliverableStatus;
import com.siaoa.domain.entities.Task;
import com.siaoa.domain.entities.NotificationType;
import com.siaoa.domain.ports.DeliverableRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DeliverableManagementService
 * Implements DeliverableManagementUseCase with business logic
 */
public class DeliverableManagementService implements DeliverableManagementUseCase {
    
    private final DeliverableRepository deliverableRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationUseCase notificationUseCase;

    public DeliverableManagementService(DeliverableRepository deliverableRepository, TaskRepository taskRepository, UserRepository userRepository, NotificationUseCase notificationUseCase) {
        this.deliverableRepository = deliverableRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.notificationUseCase = notificationUseCase;
    }
    
    @Override
    public Deliverable submitDeliverable(UUID taskId, String filePath, UUID userId) {
        Deliverable deliverable = Deliverable.builder()
                .id(UUID.randomUUID())
                .taskId(taskId)
                .submittedBy(userId)
                .filePath(filePath)
                .status(DeliverableStatus.SUBMITTED)
                .submissionDate(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        Deliverable saved = deliverableRepository.save(deliverable);

        // Notify task owner (creator) about new submission
        taskRepository.findById(taskId).ifPresent(task -> {
            UUID owner = task.getCreatedById();
            if (owner != null && !owner.equals(userId)) {
                String title = "New deliverable submitted";
                String message = "A new deliverable was submitted for task: " + task.getTitle();
                notificationUseCase.createNotification(owner, title, message, NotificationType.INFO, "deliverable", saved.getId());
            }
        });

        return saved;
    }
    
    @Override
    public List<Deliverable> listDeliverablesByTask(UUID taskId) {
        return deliverableRepository.findByTaskId(taskId);
    }
    
    @Override
    public List<Deliverable> listDeliverablesByUser(UUID userId) {
        return deliverableRepository.findBySubmittedBy(userId);
    }
    
    @Override
    public Deliverable getDeliverable(UUID deliverableId) {
        return deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new RuntimeException("Deliverable not found"));
    }
    
    @Override
    public Deliverable provideFeedback(UUID deliverableId, String feedback, DeliverableStatus status, UUID userId) {
        Deliverable existing = getDeliverable(deliverableId);
        
        // Validate status for feedback
        if (!isValidFeedbackStatus(status)) {
            throw new RuntimeException("Invalid status for feedback: " + status);
        }
        
        Deliverable updated = Deliverable.builder()
                .id(existing.getId())
                .taskId(existing.getTaskId())
                .submittedBy(existing.getSubmittedBy())
                .filePath(existing.getFilePath())
                .feedback(feedback)
                .status(status)
                .submissionDate(existing.getSubmissionDate())
                .feedbackDate(LocalDateTime.now())
                .createdAt(existing.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();
        
        Deliverable updatedDeliverable = deliverableRepository.update(updated);

        // Notify submitter about feedback
        UUID submitter = updatedDeliverable.getSubmittedBy();
        if (submitter != null && !submitter.equals(userId)) {
            taskRepository.findById(updatedDeliverable.getTaskId()).ifPresent(task -> {
                String title = "Feedback on your submission";
                String message = "Feedback was provided for your submission on task: " + task.getTitle();
                notificationUseCase.createNotification(submitter, title, message, NotificationType.INFO, "deliverable", updatedDeliverable.getId());
            });
        }

        return updatedDeliverable;
    }
    
    @Override
    public Deliverable updateStatus(UUID deliverableId, DeliverableStatus status) {
        Deliverable existing = getDeliverable(deliverableId);
        
        Deliverable updated = Deliverable.builder()
                .id(existing.getId())
                .taskId(existing.getTaskId())
                .submittedBy(existing.getSubmittedBy())
                .filePath(existing.getFilePath())
                .feedback(existing.getFeedback())
                .status(status)
                .submissionDate(existing.getSubmissionDate())
                .feedbackDate(existing.getFeedbackDate())
                .createdAt(existing.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();
        
        return deliverableRepository.update(updated);
    }
    
    @Override
    public void deleteDeliverable(UUID deliverableId, UUID userId) {
        Deliverable deliverable = getDeliverable(deliverableId);
        
        // Only the submitter can delete
        if (!deliverable.getSubmittedBy().equals(userId)) {
            throw new RuntimeException("Unauthorized: Only the submitter can delete");
        }
        
        deliverableRepository.delete(deliverableId);
    }
    
    @Override
    public List<Deliverable> listPendingDeliverables() {
        return deliverableRepository.findByStatus(DeliverableStatus.SUBMITTED);
    }
    
    private boolean isValidFeedbackStatus(DeliverableStatus status) {
        return status == DeliverableStatus.APPROVED ||
               status == DeliverableStatus.REJECTED ||
               status == DeliverableStatus.REVISION_NEEDED;
    }
}
