package com.siaoa.application.ports.repository;

import com.siaoa.domain.entities.Task;
import com.siaoa.domain.valueobjects.TaskStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port interface for Task persistence operations.
 * Defines the contract between domain and infrastructure layers for task data management.
 */
public interface TaskRepository {
    /**
     * Save a new task or update an existing one.
     *
     * @param task The task to save
     * @return The saved task with generated ID
     */
    Task save(Task task);

    /**
     * Find a task by its ID.
     *
     * @param taskId The task ID
     * @return Optional containing the task if found
     */
    Optional<Task> findById(UUID taskId);

    /**
     * Find all tasks for a specific project.
     *
     * @param projectId The project ID
     * @return List of tasks in the project
     */
    List<Task> findByProjectId(UUID projectId);

    /**
     * Find all tasks assigned to a specific user.
     *
     * @param userId The user ID
     * @return List of tasks assigned to the user
     */
    List<Task> findByAssignedToId(UUID userId);

    /**
     * Update an existing task.
     *
     * @param task The task with updated values
     * @return The updated task
     */
    Task update(Task task);

    /**
     * Delete a task by its ID.
     *
     * @param taskId The task ID
     */
    void delete(UUID taskId);

    /**
     * Find all tasks in a project with a specific status.
     *
     * @param projectId The project ID
     * @param status The task status to filter by
     * @return List of tasks with the specified status
     */
    List<Task> findByProjectIdAndStatus(UUID projectId, TaskStatus status);

    /**
     * Find all tasks created by a specific user.
     *
     * @param userId The user ID
     * @return List of tasks created by the user
     */
    List<Task> findByCreatedById(UUID userId);
}
