package com.siaoa.infra.outbound.persistence.repositories;

import com.siaoa.infra.outbound.persistence.entities.MeetingJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MeetingJpaRepository extends JpaRepository<MeetingJpaEntity, UUID> {
    List<MeetingJpaEntity> findByCreatedBy(UUID createdBy);
}
