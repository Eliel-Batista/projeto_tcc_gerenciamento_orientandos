package com.siaoa.adapters.inbound.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DeliverableFeedbackRequest
 * Request DTO for providing feedback on a deliverable
 */
public class DeliverableFeedbackRequest {
    
    @NotBlank(message = "Feedback is required")
    private String feedback;
    
    @NotNull(message = "Status is required")
    private String status; // APPROVED, REJECTED, REVISION_NEEDED
    
    public DeliverableFeedbackRequest() {}
    
    public DeliverableFeedbackRequest(String feedback, String status) {
        this.feedback = feedback;
        this.status = status;
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
}
