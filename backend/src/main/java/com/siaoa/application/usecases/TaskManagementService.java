package com.siaoa.application.usecases;

import com.siaoa.application.ports.repository.ProjectRepository;
import com.siaoa.application.ports.repository.TaskRepository;
import com.siaoa.application.ports.repository.UserRepository;
import com.siaoa.domain.entities.NotificationType;
import com.siaoa.domain.entities.Project;
import com.siaoa.domain.entities.User;
import com.siaoa.domain.entities.Task;
import com.siaoa.domain.exceptions.ProjectNotFoundException;
import com.siaoa.domain.exceptions.TaskNotFoundException;
import com.siaoa.domain.exceptions.UnauthorizedException;
import com.siaoa.domain.valueobjects.TaskStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service implementing task management use cases.
 * Handles business logic for task CRUD operations with authorization checks.
 */
@Service
public class TaskManagementService implements TaskManagementUseCase {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationUseCase notificationUseCase;

    public TaskManagementService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            NotificationUseCase notificationUseCase
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.notificationUseCase = notificationUseCase;
    }

    @Override
    public Task createTask(UUID projectId, Task task, UUID userId) {
        // Verify project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));

        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Create task with current timestamp
        Task newTask = new Task.Builder()
                .id(UUID.randomUUID())
                .projectId(projectId)
                .title(task.getTitle())
                .description(task.getDescription())
                .taskType(task.getTaskType())
                .status(task.getStatus() != null ? task.getStatus() : TaskStatus.PENDING)
                .dueDate(task.getDueDate())
                .priority(task.getPriority())
                .assignedToId(task.getAssignedToId())
                .createdById(userId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return populateCommentsAuthorNames(taskRepository.save(newTask));
    }

    @Override
    public List<Task> listTasksByProject(UUID projectId, UUID userId) {
        // Verify project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));

        // In a real application, you would check if the user is a member of the project
        // For now, we'll just verify the user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        return taskRepository.findByProjectId(projectId).stream()
                .map(this::populateCommentsAuthorNames)
                .collect(Collectors.toList());
    }

    @Override
    public Task getTask(UUID taskId, UUID userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));
        return populateCommentsAuthorNames(task);
    }

    @Override
    public Task updateTask(UUID taskId, Task updates, UUID userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Task existingTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));

        // Check authorization - only creator or assigned user can update
        if (!existingTask.getCreatedById().equals(userId) &&
                (existingTask.getAssignedToId() == null || !existingTask.getAssignedToId().equals(userId))) {
            throw new UnauthorizedException("You are not authorized to update this task");
        }

        // Create updated task preserving id and creation info
        Task.Builder updatedBuilder = new Task.Builder()
                .id(existingTask.getId())
                .projectId(existingTask.getProjectId())
                .title(updates.getTitle() != null ? updates.getTitle() : existingTask.getTitle())
                .description(updates.getDescription() != null ? updates.getDescription() : existingTask.getDescription())
                .taskType(updates.getTaskType() != null ? updates.getTaskType() : existingTask.getTaskType())
                .status(updates.getStatus() != null ? updates.getStatus() : existingTask.getStatus())
                .dueDate(updates.getDueDate() != null ? updates.getDueDate() : existingTask.getDueDate())
                .priority(updates.getPriority() != null ? updates.getPriority() : existingTask.getPriority())
                .assignedToId(updates.getAssignedToId() != null ? updates.getAssignedToId() : existingTask.getAssignedToId())
                .createdById(existingTask.getCreatedById())
                .createdAt(existingTask.getCreatedAt())
                .updatedAt(LocalDateTime.now());

        if (updates.hasActivities()) {
            updatedBuilder.activities(updates.getActivities());
        } else {
            updatedBuilder.activities(existingTask.getActivities());
        }

        if (updates.hasComments()) {
            updatedBuilder.comments(updates.getComments());
        } else {
            updatedBuilder.comments(existingTask.getComments());
        }

        Task updatedTask = updatedBuilder.build();
        Task savedTask = taskRepository.update(updatedTask);

        // Check if task status is changed to COMPLETED
        boolean wasCompleted = existingTask.getStatus() == TaskStatus.COMPLETED;
        boolean isCompletedNow = savedTask.getStatus() == TaskStatus.COMPLETED;

        if (!wasCompleted && isCompletedNow) {
            projectRepository.findById(existingTask.getProjectId()).ifPresent(project -> {
                UUID orientadorId = project.getOrientadorId();
                // Send notification to orientador if it's not the orientador himself who completed it
                if (orientadorId != null && !orientadorId.equals(userId)) {
                    String orientandoNome = userRepository.findById(userId)
                            .map(User::getFullName)
                            .orElse("Um orientando");
                    notificationUseCase.createNotification(
                            orientadorId,
                            "Tarefa concluída",
                            orientandoNome + " concluiu a tarefa: " + savedTask.getTitle(),
                            NotificationType.SUCCESS,
                            "task",
                            savedTask.getId()
                    );
                }
            });
        }

        return populateCommentsAuthorNames(savedTask);
    }

    @Override
    public void deleteTask(UUID taskId, UUID userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));

        // Check authorization - only creator can delete
        if (!task.getCreatedById().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to delete this task");
        }

        taskRepository.delete(taskId);
    }

    @Override
    public List<Task> listUserTasks(UUID userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        return taskRepository.findByAssignedToId(userId).stream()
                .map(this::populateCommentsAuthorNames)
                .collect(Collectors.toList());
    }

    @Override
    public List<Task> listTasksByProjectAndStatus(UUID projectId, TaskStatus status, UUID userId) {
        // Verify project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));

        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        return taskRepository.findByProjectIdAndStatus(projectId, status).stream()
                .map(this::populateCommentsAuthorNames)
                .collect(Collectors.toList());
    }

    private Task populateCommentsAuthorNames(Task task) {
        if (task == null) return null;
        if (task.getComments().isEmpty()) {
            return task;
        }
        List<com.siaoa.domain.entities.TaskComment> populatedComments = task.getComments().stream()
                .map(c -> {
                    if (c.getAuthorName() != null && !c.getAuthorName().isEmpty()) {
                        return c;
                    }
                    String name = userRepository.findById(c.getAuthorId())
                            .map(com.siaoa.domain.entities.User::getFullName)
                            .orElse("Usuário");
                    return new com.siaoa.domain.entities.TaskComment.Builder()
                            .id(c.getId())
                            .taskId(c.getTaskId())
                            .authorId(c.getAuthorId())
                            .content(c.getContent())
                            .createdAt(c.getCreatedAt())
                            .authorName(name)
                            .build();
                })
                .collect(Collectors.toList());

        return new Task.Builder()
                .id(task.getId())
                .projectId(task.getProjectId())
                .title(task.getTitle())
                .description(task.getDescription())
                .taskType(task.getTaskType())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .priority(task.getPriority())
                .assignedToId(task.getAssignedToId())
                .createdById(task.getCreatedById())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .activities(task.getActivities())
                .comments(populatedComments)
                .build();
    }
}
