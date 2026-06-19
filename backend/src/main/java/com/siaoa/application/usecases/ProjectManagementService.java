package com.siaoa.application.usecases;

import com.siaoa.application.ports.repository.ProjectRepository;
import com.siaoa.domain.entities.Project;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ProjectManagementService implements ProjectManagementUseCase {
    private final ProjectRepository projectRepository;

    public ProjectManagementService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Override
    public List<Project> listProjects() {
        return projectRepository.findAll();
    }

    @Override
    public Project getProject(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
    }
}
