package com.siaoa.domain.entities;

/**
 * DeliverableStatus Enum
 * Represents possible states of a deliverable submission
 */
public enum DeliverableStatus {
    PENDING,           // Waiting to be submitted
    SUBMITTED,         // Submitted by student, waiting for feedback
    APPROVED,          // Approved by professor
    REJECTED,          // Rejected by professor (needs resubmission)
    REVISION_NEEDED    // Feedback given, needs revision
}
