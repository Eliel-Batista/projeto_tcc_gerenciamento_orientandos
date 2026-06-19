package com.siaoa.adapters.inbound.rest;

import com.siaoa.adapters.inbound.rest.dto.DeliverableFeedbackRequest;
import com.siaoa.adapters.inbound.rest.dto.DeliverableResponse;
import com.siaoa.adapters.inbound.rest.dto.DeliverableSubmitRequest;
import com.siaoa.application.usecases.DeliverableManagementUseCase;
import com.siaoa.domain.entities.Deliverable;
import com.siaoa.domain.entities.DeliverableStatus;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

/**
 * DeliverableController
 * REST controller for deliverable management endpoints
 */
@RestController
@RequestMapping("/api/deliverables")
public class DeliverableController {
    
    private final DeliverableManagementUseCase deliverableManagementUseCase;
    
    public DeliverableController(DeliverableManagementUseCase deliverableManagementUseCase) {
        this.deliverableManagementUseCase = deliverableManagementUseCase;
    }
    
    /**
     * Submit a deliverable for a task
     * POST /api/tasks/{taskId}/deliverables
     */
    @PostMapping
    public ResponseEntity<DeliverableResponse> submitDeliverable(
            @RequestParam UUID taskId,
            @Valid @RequestBody DeliverableSubmitRequest request) {
        
        UUID userId = getCurrentUserId();
        Deliverable deliverable = deliverableManagementUseCase.submitDeliverable(
                taskId, request.getFilePath(), userId
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapToResponse(deliverable));
    }
    
    /**
     * List deliverables for a task
     * GET /api/tasks/{taskId}/deliverables
     */
    @GetMapping
    public ResponseEntity<List<DeliverableResponse>> listDeliverablesByTask(
            @RequestParam UUID taskId) {
        
        List<Deliverable> deliverables = deliverableManagementUseCase.listDeliverablesByTask(taskId);
        List<DeliverableResponse> responses = deliverables.stream()
                .map(this::mapToResponse)
                .toList();
        
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Get deliverable detail
     * GET /api/deliverables/{deliverableId}
     */
    @GetMapping("/{deliverableId}")
    public ResponseEntity<DeliverableResponse> getDeliverable(
            @PathVariable UUID deliverableId) {
        
        Deliverable deliverable = deliverableManagementUseCase.getDeliverable(deliverableId);
        return ResponseEntity.ok(mapToResponse(deliverable));
    }
    
    /**
     * List user's deliverables
     * GET /api/user/deliverables
     */
    @GetMapping("/user/submissions")
    public ResponseEntity<List<DeliverableResponse>> listUserDeliverables() {
        UUID userId = getCurrentUserId();
        List<Deliverable> deliverables = deliverableManagementUseCase.listDeliverablesByUser(userId);
        List<DeliverableResponse> responses = deliverables.stream()
                .map(this::mapToResponse)
                .toList();
        
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Provide feedback on a deliverable
     * POST /api/deliverables/{deliverableId}/feedback
     */
    @PostMapping("/{deliverableId}/feedback")
    public ResponseEntity<DeliverableResponse> provideFeedback(
            @PathVariable UUID deliverableId,
            @Valid @RequestBody DeliverableFeedbackRequest request) {
        
        UUID userId = getCurrentUserId();
        DeliverableStatus status = DeliverableStatus.valueOf(request.getStatus());
        
        Deliverable deliverable = deliverableManagementUseCase.provideFeedback(
                deliverableId, request.getFeedback(), status, userId
        );
        
        return ResponseEntity.ok(mapToResponse(deliverable));
    }
    
    /**
     * Update deliverable status
     * PATCH /api/deliverables/{deliverableId}/status
     */
    @PatchMapping("/{deliverableId}/status")
    public ResponseEntity<DeliverableResponse> updateStatus(
            @PathVariable UUID deliverableId,
            @RequestParam String status) {
        
        DeliverableStatus deliverableStatus = DeliverableStatus.valueOf(status);
        Deliverable deliverable = deliverableManagementUseCase.updateStatus(deliverableId, deliverableStatus);
        
        return ResponseEntity.ok(mapToResponse(deliverable));
    }
    
    /**
     * Delete a deliverable
     * DELETE /api/deliverables/{deliverableId}
     */
    @DeleteMapping("/{deliverableId}")
    public ResponseEntity<Void> deleteDeliverable(
            @PathVariable UUID deliverableId) {
        
        UUID userId = getCurrentUserId();
        deliverableManagementUseCase.deleteDeliverable(deliverableId, userId);
        
        return ResponseEntity.noContent().build();
    }
    
    /**
     * List pending deliverables (waiting for feedback)
     * GET /api/deliverables/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<DeliverableResponse>> listPendingDeliverables() {
        List<Deliverable> deliverables = deliverableManagementUseCase.listPendingDeliverables();
        List<DeliverableResponse> responses = deliverables.stream()
                .map(this::mapToResponse)
                .toList();
        
        return ResponseEntity.ok(responses);
    }
    
    // Helper methods
    
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(authentication.getName());
    }
    
    private DeliverableResponse mapToResponse(Deliverable deliverable) {
        return new DeliverableResponse(
                deliverable.getId(),
                deliverable.getTaskId(),
                deliverable.getSubmittedBy(),
                deliverable.getFilePath(),
                deliverable.getFeedback(),
                deliverable.getStatus().name(),
                deliverable.getSubmissionDate(),
                deliverable.getFeedbackDate(),
                deliverable.getCreatedAt(),
                deliverable.getUpdatedAt()
        );
    }
}
