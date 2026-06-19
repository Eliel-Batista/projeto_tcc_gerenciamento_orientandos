package com.siaoa.adapters.inbound.rest.dto;

import com.siaoa.domain.valueobjects.ProjectType;
import java.time.LocalDate;
import java.util.UUID;

public class ProjectResponse {
    private UUID id;
    private String title;
    private String description;
    private ProjectType projectType;
    private LocalDate startDate;
    private LocalDate endDate;

    public ProjectResponse() {
    }

    public ProjectResponse(UUID id, String title, String description, ProjectType projectType, LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.projectType = projectType;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProjectType getProjectType() {
        return projectType;
    }

    public void setProjectType(ProjectType projectType) {
        this.projectType = projectType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}
