package com.siaoa.adapters.outbound.persistence;

import com.siaoa.application.ports.repository.ProjectRepository;
import com.siaoa.domain.entities.Project;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class InMemoryProjectRepository implements ProjectRepository {
    private final List<Project> projects = new ArrayList<>();

    @Override
    public Project save(Project project) {
        projects.removeIf(existing -> existing.getId().equals(project.getId()));
        projects.add(project);
        return project;
    }

    @Override
    public Optional<Project> findById(UUID projectId) {
        return projects.stream()
                .filter(project -> project.getId().equals(projectId))
                .findFirst();
    }

    @Override
    public List<Project> findAll() {
        return new ArrayList<>(projects);
    }
}
