package com.siaoa.adapters.inbound.rest;

import com.siaoa.adapters.inbound.rest.dto.TaskActivityDto;
import com.siaoa.adapters.inbound.rest.dto.TaskCommentDto;
import com.siaoa.adapters.inbound.rest.dto.TaskCreateRequest;
import com.siaoa.adapters.inbound.rest.dto.TaskResponse;
import com.siaoa.adapters.inbound.rest.dto.TaskUpdateRequest;
import com.siaoa.application.usecases.TaskManagementUseCase;
import com.siaoa.domain.entities.Task;
import com.siaoa.domain.entities.TaskActivity;
import com.siaoa.domain.entities.TaskComment;
import com.siaoa.domain.valueobjects.Priority;
import com.siaoa.domain.valueobjects.TaskStatus;
import com.siaoa.domain.valueobjects.TaskType;
import com.siaoa.application.usecases.NotificationUseCase;
import com.siaoa.application.ports.repository.UserRepository;
import com.siaoa.domain.entities.NotificationType;
import com.siaoa.domain.entities.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST controller for task management operations.
 * Provides endpoints for creating, reading, updating, and deleting tasks.
 */
@RestController
@RequestMapping("/api")
@Validated
public class TaskController {
    private final TaskManagementUseCase taskManagementUseCase;
    private final NotificationUseCase notificationUseCase;
    private final UserRepository userRepository;

    public TaskController(TaskManagementUseCase taskManagementUseCase,
                          NotificationUseCase notificationUseCase,
                          UserRepository userRepository) {
        this.taskManagementUseCase = taskManagementUseCase;
        this.notificationUseCase = notificationUseCase;
        this.userRepository = userRepository;
    }

    /**
     * Create a new task in a project.
     *
     * @param projectId The project ID
     * @param request Task creation request
     * @return Created task response with 201 status
     */
    @PostMapping("/projects/{projectId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(
            @PathVariable("projectId") UUID projectId,
            @Valid @RequestBody TaskCreateRequest request
    ) {
        UUID userId = getCurrentUserId();

        Task task = new Task.Builder()
                .projectId(projectId)
                .title(request.getTitle())
                .description(request.getDescription())
                .taskType(request.getTaskType())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING)
                .dueDate(request.getDueDate())
                .priority(request.getPriority())
                .assignedToId(request.getAssignedToId())
                .activities(request.getActivities() != null ? request.getActivities().stream()
                        .map(desc -> new TaskActivity.Builder()
                                .id(UUID.randomUUID())
                                .description(desc)
                                .completed(false)
                                .createdAt(java.time.LocalDateTime.now())
                                .build())
                        .collect(Collectors.toList()) : new java.util.ArrayList<>())
                .build();

        Task created = taskManagementUseCase.createTask(projectId, task, userId);

        if (created.getAssignedToId() != null && !created.getAssignedToId().equals(userId)) {
            Optional<User> assignerOpt = userRepository.findById(userId);
            String assignerName = assignerOpt.map(User::getFullName).orElse("Um orientador");

            String message = String.format("%s atribuiu a você uma nova tarefa: %s", assignerName, created.getTitle());

            notificationUseCase.createNotification(
                created.getAssignedToId(),
                "Nova Tarefa Atribuída",
                message,
                NotificationType.INFO,
                "task",
                created.getId()
            );
        }

        return toResponse(created);
    }

    /**
     * List all tasks in a project with optional filtering.
     *
     * @param projectId The project ID
     * @param status Optional status filter
     * @param priority Optional priority filter
     * @param assignedTo Optional assigned user filter
     * @return List of tasks in the project
     */
    @GetMapping("/projects/{projectId}/tasks")
    public List<TaskResponse> listTasksByProject(
            @PathVariable("projectId") UUID projectId,
            @RequestParam(required = false) Optional<TaskStatus> status,
            @RequestParam(required = false) Optional<Priority> priority,
            @RequestParam(required = false) Optional<UUID> assignedTo
    ) {
        UUID userId = getCurrentUserId();
        List<Task> tasks = taskManagementUseCase.listTasksByProject(projectId, userId);

        // Apply filters
        return tasks.stream()
                .filter(t -> status.isEmpty() || t.getStatus() == status.get())
                .filter(t -> priority.isEmpty() || t.getPriority() == priority.get())
                .filter(t -> assignedTo.isEmpty() || (t.getAssignedToId() != null && t.getAssignedToId().equals(assignedTo.get())))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific task by ID.
     *
     * @param taskId The task ID
     * @return Task details
     */
    @GetMapping("/tasks/{taskId}")
    public TaskResponse getTask(@PathVariable("taskId") UUID taskId) {
        UUID userId = getCurrentUserId();
        Task task = taskManagementUseCase.getTask(taskId, userId);
        return toResponse(task);
    }

    /**
     * Update an existing task.
     *
     * @param taskId The task ID
     * @param request Task update request
     * @return Updated task response
     */
    @PutMapping("/tasks/{taskId}")
    public TaskResponse updateTask(
            @PathVariable("taskId") UUID taskId,
            @Valid @RequestBody TaskUpdateRequest request
    ) {
        UUID userId = getCurrentUserId();

        // Create partial task object with only updated fields
        Task.Builder updatesBuilder = new Task.Builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .taskType(request.getTaskType())
                .status(request.getStatus())
                .dueDate(request.getDueDate())
                .priority(request.getPriority())
                .assignedToId(request.getAssignedToId());

        if (request.getActivities() != null) {
            updatesBuilder.activities(request.getActivities().stream()
                    .map(dto -> new TaskActivity.Builder()
                            .id(dto.getId() != null ? dto.getId() : UUID.randomUUID())
                            .taskId(taskId)
                            .description(dto.getDescription())
                            .completed(dto.isCompleted())
                            .createdAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : java.time.LocalDateTime.now())
                            .build())
                    .collect(Collectors.toList()));
        } else {
            updatesBuilder.activities(null);
        }

        if (request.getComments() != null) {
            updatesBuilder.comments(request.getComments().stream()
                    .map(dto -> new TaskComment.Builder()
                            .id(dto.getId() != null ? dto.getId() : UUID.randomUUID())
                            .taskId(taskId)
                            .authorId(dto.getAuthorId() != null ? dto.getAuthorId() : userId)
                            .content(dto.getContent())
                            .createdAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : java.time.LocalDateTime.now())
                            .build())
                    .collect(Collectors.toList()));
        } else {
            updatesBuilder.comments(null);
        }

        Task updates = updatesBuilder.build();

        Task updated = taskManagementUseCase.updateTask(taskId, updates, userId);
        return toResponse(updated);
    }

    /**
     * Delete a task.
     *
     * @param taskId The task ID
     */
    @DeleteMapping("/tasks/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable("taskId") UUID taskId) {
        UUID userId = getCurrentUserId();
        taskManagementUseCase.deleteTask(taskId, userId);
    }

    /**
     * List all tasks assigned to the current user.
     *
     * @param status Optional status filter
     * @param projectId Optional project filter
     * @return List of tasks assigned to current user
     */
    @GetMapping("/user/tasks")
    public List<TaskResponse> listUserTasks(
            @RequestParam(required = false) Optional<TaskStatus> status,
            @RequestParam(required = false) Optional<UUID> projectId
    ) {
        UUID userId = getCurrentUserId();
        List<Task> tasks = taskManagementUseCase.listUserTasks(userId);

        // Apply filters
        return tasks.stream()
                .filter(t -> status.isEmpty() || t.getStatus() == status.get())
                .filter(t -> projectId.isEmpty() || t.getProjectId().equals(projectId.get()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * List all tasks assigned to a specific user (for Orientador).
     *
     * @param targetUserId The user ID to get tasks for
     * @param status Optional status filter
     * @return List of tasks assigned to the target user
     */
    @GetMapping("/users/{targetUserId}/tasks")
    public List<TaskResponse> listTasksByUser(
            @PathVariable("targetUserId") UUID targetUserId,
            @RequestParam(required = false) Optional<TaskStatus> status
    ) {
        UUID userId = getCurrentUserId();
        // Uses the same logic, but we get the target user tasks.
        // We'll trust that the UI only requests this for orientandos.
        // In a real app we'd verify the orientador-orientando relationship.
        List<Task> tasks = taskManagementUseCase.listUserTasks(targetUserId);

        // Apply filters
        return tasks.stream()
                .filter(t -> status.isEmpty() || t.getStatus() == status.get())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert domain Task entity to API response DTO.
     *
     * @param task Domain task
     * @return Task response DTO
     */
    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
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
                task.getActivities().stream().map(a -> new TaskActivityDto(
                        a.getId(), a.getTaskId(), a.getDescription(), a.isCompleted(), a.getCreatedAt()
                )).collect(Collectors.toList()),
                task.getComments().stream().map(c -> new TaskCommentDto(
                        c.getId(), c.getTaskId(), c.getAuthorId(), c.getContent(), c.getCreatedAt(), c.getAuthorName()
                )).collect(Collectors.toList())
        );
    }

    /**
     * Extract the current user ID from the JWT token in SecurityContext.
     *
     * @return Current user ID
     * @throws IllegalArgumentException if user is not authenticated
     */
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User not authenticated");
        }

        String principal = authentication.getPrincipal().toString();
        try {
            return UUID.fromString(principal);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user ID format in token");
        }
    }
}
