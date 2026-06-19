package com.siaoa.domain.entities;

import com.siaoa.domain.valueobjects.ProjectType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class Project {
    private final UUID id;
    private final String title;
    private final String description;
    private final ProjectType projectType;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final UUID orientadorId;
    private final String status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public Project(UUID id, String title, String description, ProjectType projectType, LocalDate startDate, LocalDate endDate, UUID orientadorId, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.projectType = projectType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.orientadorId = orientadorId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public ProjectType getProjectType() {
        return projectType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public UUID getOrientadorId() {
        return orientadorId;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
