package com.siaoa.adapters.outbound.persistence;

import com.siaoa.application.ports.repository.ProjectRepository;
import com.siaoa.domain.entities.Project;
import com.siaoa.domain.valueobjects.ProjectType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class ProjectRepositoryAdapter implements ProjectRepository {
    
    private final ProjectJpaRepository repository;

    public ProjectRepositoryAdapter(ProjectJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Project save(Project project) {
        ProjectJpaEntity entity = toJpaEntity(project);
        entity = repository.save(entity);
        return toDomain(entity);
    }

    @Override
    public Optional<Project> findById(UUID projectId) {
        return repository.findById(projectId).map(this::toDomain);
    }

    @Override
    public List<Project> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private ProjectJpaEntity toJpaEntity(Project project) {
        return new ProjectJpaEntity(
                project.getId(),
                project.getOrientadorId(),
                project.getTitle(),
                project.getDescription(),
                project.getProjectType().name(),
                project.getStartDate(),
                project.getEndDate(),
                project.getStatus(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    private Project toDomain(ProjectJpaEntity entity) {
        return new Project(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                ProjectType.valueOf(entity.getProjectType()),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getOrientadorId(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
