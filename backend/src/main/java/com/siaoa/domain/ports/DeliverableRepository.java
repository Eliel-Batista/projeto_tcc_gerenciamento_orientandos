package com.siaoa.domain.ports;

import com.siaoa.domain.entities.Deliverable;
import com.siaoa.domain.entities.DeliverableStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * DeliverableRepository Port
 * Defines contract for deliverable persistence operations
 */
public interface DeliverableRepository {
    
    /**
     * Save a new deliverable
     */
    Deliverable save(Deliverable deliverable);
    
    /**
     * Find deliverable by ID
     */
    Optional<Deliverable> findById(UUID id);
    
    /**
     * Find all deliverables for a task
     */
    List<Deliverable> findByTaskId(UUID taskId);
    
    /**
     * Find all deliverables submitted by a user
     */
    List<Deliverable> findBySubmittedBy(UUID userId);
    
    /**
     * Find deliverables by status
     */
    List<Deliverable> findByStatus(DeliverableStatus status);
    
    /**
     * Find deliverables for a task with specific status
     */
    List<Deliverable> findByTaskIdAndStatus(UUID taskId, DeliverableStatus status);
    
    /**
     * Update a deliverable
     */
    Deliverable update(Deliverable deliverable);
    
    /**
     * Delete a deliverable
     */
    void delete(UUID id);
    
    /**
     * Check if deliverable exists
     */
    boolean existsById(UUID id);
}
