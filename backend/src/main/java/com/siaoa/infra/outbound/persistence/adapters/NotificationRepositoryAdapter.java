package com.siaoa.infra.outbound.persistence.adapters;

import com.siaoa.domain.entities.Notification;
import com.siaoa.domain.entities.NotificationType;
import com.siaoa.domain.ports.NotificationRepository;
import com.siaoa.infra.outbound.persistence.entities.NotificationJpaEntity;
import com.siaoa.infra.outbound.persistence.repositories.NotificationJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class NotificationRepositoryAdapter implements NotificationRepository {
    private final NotificationJpaRepository jpaRepository;

    public NotificationRepositoryAdapter(NotificationJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Notification save(Notification notification) {
        NotificationJpaEntity entity = toEntity(notification);
        NotificationJpaEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Notification> findById(UUID id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Notification> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Notification> findUnreadByUserId(UUID userId) {
        return jpaRepository.findByUserIdAndReadAtIsNull(userId).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Notification update(Notification notification) {
        NotificationJpaEntity entity = toEntity(notification);
        NotificationJpaEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public void delete(UUID id) {
        jpaRepository.deleteById(id);
    }

    private Notification toDomain(NotificationJpaEntity e) {
        NotificationType type = e.getType() != null ? NotificationType.valueOf(e.getType()) : NotificationType.INFO;
        return Notification.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .title(e.getTitle())
                .message(e.getMessage())
                .type(type)
                .relatedEntity(e.getRelatedEntity())
                .relatedId(e.getRelatedId())
                .readAt(e.getReadAt())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private NotificationJpaEntity toEntity(Notification n) {
        String type = n.getType() != null ? n.getType().name() : "INFO";
        return new NotificationJpaEntity(
                n.getId(),
                n.getUserId(),
                n.getTitle(),
                n.getMessage(),
                type,
                n.getRelatedEntity(),
                n.getRelatedId(),
                n.getReadAt(),
                n.getCreatedAt()
        );
    }
}
