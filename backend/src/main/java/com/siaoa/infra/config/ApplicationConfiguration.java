package com.siaoa.infra.config;

import com.siaoa.application.ports.repository.ProjectRepository;
import com.siaoa.application.ports.repository.TaskRepository;
import com.siaoa.application.ports.repository.UserRepository;
import com.siaoa.application.services.DeliverableManagementService;
import com.siaoa.application.usecases.DeliverableManagementUseCase;
import com.siaoa.adapters.outbound.persistence.ProjectJpaRepository;
import com.siaoa.adapters.outbound.persistence.ProjectRepositoryAdapter;
import com.siaoa.adapters.outbound.persistence.TaskJpaRepository;
import com.siaoa.adapters.outbound.persistence.TaskRepositoryAdapter;
import com.siaoa.domain.ports.DeliverableRepository;
import com.siaoa.infra.outbound.persistence.adapters.DeliverableRepositoryAdapter;
import com.siaoa.infra.outbound.persistence.repositories.DeliverableJpaRepository;
import com.siaoa.domain.ports.NotificationRepository;
import com.siaoa.infra.outbound.persistence.adapters.NotificationRepositoryAdapter;
import com.siaoa.infra.outbound.persistence.repositories.NotificationJpaRepository;
import com.siaoa.application.usecases.NotificationUseCase;
import com.siaoa.application.services.NotificationManagementService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationConfiguration {

    @Bean
    public ProjectRepository projectRepository(ProjectJpaRepository projectJpaRepository) {
        return new ProjectRepositoryAdapter(projectJpaRepository);
    }

    @Bean
    public TaskRepository taskRepository(TaskJpaRepository taskJpaRepository) {
        return new TaskRepositoryAdapter(taskJpaRepository);
    }

    @Bean
    public DeliverableRepository deliverableRepository(DeliverableJpaRepository deliverableJpaRepository) {
        return new DeliverableRepositoryAdapter(deliverableJpaRepository);
    }

    @Bean
    public NotificationRepository notificationRepository(NotificationJpaRepository notificationJpaRepository) {
        return new NotificationRepositoryAdapter(notificationJpaRepository);
    }

    @Bean
    public NotificationUseCase notificationUseCase(
            NotificationRepository notificationRepository, 
            SimpMessagingTemplate messagingTemplate,
            com.siaoa.application.ports.outbound.EmailSenderPort emailSenderPort,
            UserRepository userRepository) {
        return new NotificationManagementService(notificationRepository, messagingTemplate, emailSenderPort, userRepository);
    }

    @Bean
    public DeliverableManagementUseCase deliverableManagementUseCase(DeliverableRepository deliverableRepository, TaskRepository taskRepository, UserRepository userRepository, NotificationUseCase notificationUseCase) {
        return new DeliverableManagementService(deliverableRepository, taskRepository, userRepository, notificationUseCase);
    }
}
