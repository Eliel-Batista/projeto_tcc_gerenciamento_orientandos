package com.siaoa.application.usecases;

import com.siaoa.domain.entities.Task;
import com.siaoa.domain.valueobjects.TaskStatus;

import java.util.List;
import java.util.UUID;

/**
 * Use case interface for task management operations.
 * Defines business logic operations that can be performed on tasks.
 */
public interface TaskManagementUseCase {
    /**
     * Create a new task in a project.
     * Only project members can create tasks.
     *
     * @param projectId The project ID
     * @param task The task to create
     * @param userId The ID of the user creating the task
     * @return The created task with generated ID
     * @throws UnauthorizedException if user is not a project member
     * @throws ProjectNotFoundException if project is not found
     */
    Task createTask(UUID projectId, Task task, UUID userId);

    /**
     * List all tasks in a project.
     * Only project members can list tasks.
     *
     * @param projectId The project ID
     * @param userId The ID of the user making the request
     * @return List of tasks in the project
     * @throws UnauthorizedException if user is not a project member
     * @throws ProjectNotFoundException if project is not found
     */
    List<Task> listTasksByProject(UUID projectId, UUID userId);

    /**
     * Get a specific task by ID.
     *
     * @param taskId The task ID
     * @param userId The ID of the user making the request
     * @return The task if found
     * @throws TaskNotFoundException if task is not found
     * @throws UnauthorizedException if user is not authorized to access this task
     */
    Task getTask(UUID taskId, UUID userId);

    /**
     * Update an existing task.
     * Only the task creator or assigned user can update a task.
     *
     * @param taskId The task ID
     * @param updates The task with updated values
     * @param userId The ID of the user making the request
     * @return The updated task
     * @throws TaskNotFoundException if task is not found
     * @throws UnauthorizedException if user is not authorized to update this task
     */
    Task updateTask(UUID taskId, Task updates, UUID userId);

    /**
     * Delete a task.
     * Only the task creator can delete a task.
     *
     * @param taskId The task ID
     * @param userId The ID of the user making the request
     * @throws TaskNotFoundException if task is not found
     * @throws UnauthorizedException if user is not authorized to delete this task
     */
    void deleteTask(UUID taskId, UUID userId);

    /**
     * List all tasks assigned to a user.
     *
     * @param userId The user ID
     * @return List of tasks assigned to the user
     */
    List<Task> listUserTasks(UUID userId);

    /**
     * List tasks by project and status.
     * Only project members can list tasks.
     *
     * @param projectId The project ID
     * @param status The task status to filter by
     * @param userId The ID of the user making the request
     * @return List of tasks with the specified status
     * @throws UnauthorizedException if user is not a project member
     */
    List<Task> listTasksByProjectAndStatus(UUID projectId, TaskStatus status, UUID userId);
}
