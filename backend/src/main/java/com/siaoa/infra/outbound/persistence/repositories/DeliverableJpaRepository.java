package com.siaoa.infra.outbound.persistence.repositories;

import com.siaoa.infra.outbound.persistence.entities.DeliverableJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

/**
 * DeliverableJpaRepository
 * Spring Data JPA repository for Deliverable persistence
 */
@Repository
public interface DeliverableJpaRepository extends JpaRepository<DeliverableJpaEntity, UUID> {
    
    List<DeliverableJpaEntity> findByTaskId(UUID taskId);
    
    List<DeliverableJpaEntity> findBySubmittedBy(UUID userId);
    
    List<DeliverableJpaEntity> findByStatus(String status);
    
    List<DeliverableJpaEntity> findByTaskIdAndStatus(UUID taskId, String status);
}
