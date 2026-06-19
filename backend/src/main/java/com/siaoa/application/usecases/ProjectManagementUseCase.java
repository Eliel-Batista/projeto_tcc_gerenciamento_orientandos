package com.siaoa.application.usecases;

import com.siaoa.domain.entities.Project;
import java.util.List;
import java.util.UUID;

public interface ProjectManagementUseCase {
    Project createProject(Project project);
    List<Project> listProjects();
    Project getProject(UUID projectId);
}
