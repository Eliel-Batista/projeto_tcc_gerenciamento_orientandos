package com.siaoa.adapters.inbound.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * DeliverableSubmitRequest
 * Request DTO for submitting a deliverable
 */
public class DeliverableSubmitRequest {
    
    @NotBlank(message = "File path is required")
    private String filePath;
    
    public DeliverableSubmitRequest() {}
    
    public DeliverableSubmitRequest(String filePath) {
        this.filePath = filePath;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}
