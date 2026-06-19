package com.siaoa.infra.outbound.persistence.repositories;

import com.siaoa.infra.outbound.persistence.entities.NotificationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationJpaRepository extends JpaRepository<NotificationJpaEntity, UUID> {
    List<NotificationJpaEntity> findByUserId(UUID userId);
    List<NotificationJpaEntity> findByUserIdAndReadAtIsNull(UUID userId);
    List<NotificationJpaEntity> findByRelatedId(UUID relatedId);
}

