package com.siaoa.application.ports.repository;

import com.siaoa.domain.entities.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository {
    Project save(Project project);
    Optional<Project> findById(UUID projectId);
    List<Project> findAll();
}
