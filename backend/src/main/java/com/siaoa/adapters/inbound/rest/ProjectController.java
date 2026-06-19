package com.siaoa.adapters.inbound.rest;

import com.siaoa.adapters.inbound.rest.dto.ProjectRequest;
import com.siaoa.adapters.inbound.rest.dto.ProjectResponse;
import com.siaoa.application.usecases.ProjectManagementUseCase;
import com.siaoa.domain.entities.Project;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectManagementUseCase projectManagementUseCase;

    public ProjectController(ProjectManagementUseCase projectManagementUseCase) {
        this.projectManagementUseCase = projectManagementUseCase;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse createProject(@Validated @RequestBody ProjectRequest request) {
        UUID currentUserId = getCurrentUserId();
        
        Project project = new Project(
                UUID.randomUUID(),
                request.getTitle(),
                request.getDescription(),
                request.getProjectType(),
                request.getStartDate(),
                request.getEndDate(),
                currentUserId,
                "ACTIVE",
                java.time.LocalDateTime.now(),
                java.time.LocalDateTime.now()
        );

        Project created = projectManagementUseCase.createProject(project);
        return toResponse(created);
    }

    @GetMapping
    public List<ProjectResponse> listProjects() {
        return projectManagementUseCase.listProjects().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ProjectResponse getProject(@PathVariable("id") UUID projectId) {
        return toResponse(projectManagementUseCase.getProject(projectId));
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getProjectType(),
                project.getStartDate(),
                project.getEndDate()
        );
    }

    private UUID getCurrentUserId() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User not authenticated");
        }

        String principal = authentication.getPrincipal().toString();
        try {
            return UUID.fromString(principal);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user ID format in token");
        }
    }
}
