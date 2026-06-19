package com.siaoa.domain.exceptions;

public class TaskNotFoundException extends DomainException {
    public TaskNotFoundException(String message) {
        super(message);
    }

    public TaskNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
