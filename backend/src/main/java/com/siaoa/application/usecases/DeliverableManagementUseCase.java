package com.siaoa.application.usecases;

import com.siaoa.domain.entities.Deliverable;
import com.siaoa.domain.entities.DeliverableStatus;
import java.util.List;
import java.util.UUID;

/**
 * DeliverableManagementUseCase
 * Defines business operations for deliverable management
 */
public interface DeliverableManagementUseCase {
    
    /**
     * Submit a deliverable for a task
     * @param taskId Task ID to submit deliverable for
     * @param filePath File path/name of the deliverable
     * @param userId User ID of the student submitting
     * @return Created deliverable
     */
    Deliverable submitDeliverable(UUID taskId, String filePath, UUID userId);
    
    /**
     * List deliverables for a task
     * @param taskId Task ID
     * @return List of deliverables for the task
     */
    List<Deliverable> listDeliverablesByTask(UUID taskId);
    
    /**
     * List deliverables submitted by a user
     * @param userId User ID
     * @return List of deliverables submitted by user
     */
    List<Deliverable> listDeliverablesByUser(UUID userId);
    
    /**
     * Get a specific deliverable
     * @param deliverableId Deliverable ID
     * @return Deliverable details
     */
    Deliverable getDeliverable(UUID deliverableId);
    
    /**
     * Provide feedback on a deliverable
     * @param deliverableId Deliverable ID
     * @param feedback Feedback text
     * @param status New status (APPROVED, REJECTED, REVISION_NEEDED)
     * @param userId User ID of professor providing feedback
     * @return Updated deliverable
     */
    Deliverable provideFeedback(UUID deliverableId, String feedback, DeliverableStatus status, UUID userId);
    
    /**
     * Update deliverable status
     * @param deliverableId Deliverable ID
     * @param status New status
     * @return Updated deliverable
     */
    Deliverable updateStatus(UUID deliverableId, DeliverableStatus status);
    
    /**
     * Delete a deliverable
     * @param deliverableId Deliverable ID
     * @param userId User ID requesting deletion
     */
    void deleteDeliverable(UUID deliverableId, UUID userId);
    
    /**
     * List pending deliverables (waiting for feedback)
     * @return List of pending deliverables
     */
    List<Deliverable> listPendingDeliverables();
}
