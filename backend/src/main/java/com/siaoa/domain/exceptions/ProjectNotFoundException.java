package com.siaoa.domain.exceptions;

public class ProjectNotFoundException extends DomainException {
    public ProjectNotFoundException(String message) {
        super(message);
    }

    public ProjectNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
