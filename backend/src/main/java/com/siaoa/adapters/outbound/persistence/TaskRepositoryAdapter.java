package com.siaoa.adapters.outbound.persistence;

import com.siaoa.application.ports.repository.TaskRepository;
import com.siaoa.domain.entities.Task;
import com.siaoa.domain.entities.TaskActivity;
import com.siaoa.domain.entities.TaskComment;
import com.siaoa.domain.valueobjects.TaskStatus;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter implementing TaskRepository port.
 * Maps between domain Task entities and JPA TaskJpaEntity objects.
 */
@Repository
public class TaskRepositoryAdapter implements TaskRepository {
    private final TaskJpaRepository jpaRepository;

    public TaskRepositoryAdapter(TaskJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Task save(Task task) {
        TaskJpaEntity entity = toDatabaseEntity(task);
        TaskJpaEntity saved = jpaRepository.save(entity);
        return toDomainTask(saved);
    }

    @Override
    public Optional<Task> findById(UUID taskId) {
        return jpaRepository.findById(taskId).map(this::toDomainTask);
    }

    @Override
    public List<Task> findByProjectId(UUID projectId) {
        return jpaRepository.findByProjectId(projectId)
                .stream()
                .map(this::toDomainTask)
                .toList();
    }

    @Override
    public List<Task> findByAssignedToId(UUID userId) {
        return jpaRepository.findByAssignedToId(userId)
                .stream()
                .map(this::toDomainTask)
                .toList();
    }

    @Override
    public Task update(Task task) {
        TaskJpaEntity entity = toDatabaseEntity(task);
        TaskJpaEntity updated = jpaRepository.save(entity);
        return toDomainTask(updated);
    }

    @Override
    public void delete(UUID taskId) {
        jpaRepository.deleteById(taskId);
    }

    @Override
    public List<Task> findByProjectIdAndStatus(UUID projectId, TaskStatus status) {
        return jpaRepository.findByProjectIdAndStatus(projectId, status)
                .stream()
                .map(this::toDomainTask)
                .toList();
    }

    @Override
    public List<Task> findByCreatedById(UUID userId) {
        return jpaRepository.findByCreatedById(userId)
                .stream()
                .map(this::toDomainTask)
                .toList();
    }

    /**
     * Convert domain Task entity to JPA entity.
     *
     * @param task Domain task
     * @return JPA entity
     */
    private TaskJpaEntity toDatabaseEntity(Task task) {
        TaskJpaEntity taskJpa = new TaskJpaEntity(
                task.getId(),
                task.getProjectId(),
                task.getTitle(),
                task.getDescription(),
                task.getTaskType(),
                task.getStatus(),
                task.getDueDate(),
                task.getPriority(),
                task.getAssignedToId(),
                task.getCreatedById(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                new ArrayList<>(),
                new ArrayList<>()
        );

        List<TaskActivityJpaEntity> activities = task.getActivities().stream().map(a -> new TaskActivityJpaEntity(
                a.getId(), taskJpa, a.getDescription(), a.isCompleted(), a.getCreatedAt()
        )).collect(Collectors.toList());

        List<TaskCommentJpaEntity> comments = task.getComments().stream().map(c -> new TaskCommentJpaEntity(
                c.getId(), taskJpa, c.getAuthorId(), c.getContent(), c.getCreatedAt()
        )).collect(Collectors.toList());

        taskJpa.setActivities(activities);
        taskJpa.setComments(comments);

        return taskJpa;
    }

    /**
     * Convert JPA entity to domain Task entity.
     *
     * @param entity JPA entity
     * @return Domain task
     */
    private Task toDomainTask(TaskJpaEntity entity) {
        return new Task.Builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .taskType(entity.getTaskType())
                .status(entity.getStatus())
                .dueDate(entity.getDueDate())
                .priority(entity.getPriority())
                .assignedToId(entity.getAssignedToId())
                .createdById(entity.getCreatedById())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .activities(entity.getActivities() != null ? entity.getActivities().stream().map(a -> 
                        new TaskActivity.Builder()
                                .id(a.getId())
                                .taskId(a.getTaskId())
                                .description(a.getDescription())
                                .completed(a.isCompleted())
                                .createdAt(a.getCreatedAt())
                                .build()
                ).collect(Collectors.toList()) : new ArrayList<>())
                .comments(entity.getComments() != null ? entity.getComments().stream().map(c -> 
                        new TaskComment.Builder()
                                .id(c.getId())
                                .taskId(c.getTaskId())
                                .authorId(c.getAuthorId())
                                .content(c.getContent())
                                .createdAt(c.getCreatedAt())
                                .build()
                ).collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }
}
