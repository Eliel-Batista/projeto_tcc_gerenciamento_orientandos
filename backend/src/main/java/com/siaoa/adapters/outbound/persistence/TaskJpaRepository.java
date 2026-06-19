package com.siaoa.adapters.outbound.persistence;

import com.siaoa.domain.valueobjects.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * JPA repository for Task persistence.
 * Provides database operations for task entities.
 */
@Repository
public interface TaskJpaRepository extends JpaRepository<TaskJpaEntity, UUID> {
    /**
     * Find all tasks for a specific project.
     *
     * @param projectId The project ID
     * @return List of tasks in the project
     */
    List<TaskJpaEntity> findByProjectId(UUID projectId);

    /**
     * Find all tasks assigned to a specific user.
     *
     * @param assignedToId The user ID
     * @return List of tasks assigned to the user
     */
    List<TaskJpaEntity> findByAssignedToId(UUID assignedToId);

    /**
     * Find all tasks with a specific status in a project.
     *
     * @param projectId The project ID
     * @param status The task status
     * @return List of tasks with the specified status
     */
    List<TaskJpaEntity> findByProjectIdAndStatus(UUID projectId, TaskStatus status);

    /**
     * Find all tasks created by a specific user.
     *
     * @param createdById The user ID
     * @return List of tasks created by the user
     */
    List<TaskJpaEntity> findByCreatedById(UUID createdById);
}
