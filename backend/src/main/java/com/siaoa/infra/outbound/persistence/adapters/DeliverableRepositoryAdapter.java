package com.siaoa.infra.outbound.persistence.adapters;

import com.siaoa.domain.entities.Deliverable;
import com.siaoa.domain.entities.DeliverableStatus;
import com.siaoa.domain.ports.DeliverableRepository;
import com.siaoa.infra.outbound.persistence.entities.DeliverableJpaEntity;
import com.siaoa.infra.outbound.persistence.repositories.DeliverableJpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * DeliverableRepositoryAdapter
 * Adapter implementing DeliverableRepository port using JPA
 */
public class DeliverableRepositoryAdapter implements DeliverableRepository {
    
    private final DeliverableJpaRepository jpaRepository;
    
    public DeliverableRepositoryAdapter(DeliverableJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }
    
    @Override
    public Deliverable save(Deliverable deliverable) {
        DeliverableJpaEntity entity = toPersistenceEntity(deliverable);
        DeliverableJpaEntity saved = jpaRepository.save(entity);
        return toDomainEntity(saved);
    }
    
    @Override
    public Optional<Deliverable> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(this::toDomainEntity);
    }
    
    @Override
    public List<Deliverable> findByTaskId(UUID taskId) {
        return jpaRepository.findByTaskId(taskId)
                .stream()
                .map(this::toDomainEntity)
                .toList();
    }
    
    @Override
    public List<Deliverable> findBySubmittedBy(UUID userId) {
        return jpaRepository.findBySubmittedBy(userId)
                .stream()
                .map(this::toDomainEntity)
                .toList();
    }
    
    @Override
    public List<Deliverable> findByStatus(DeliverableStatus status) {
        return jpaRepository.findByStatus(status.name())
                .stream()
                .map(this::toDomainEntity)
                .toList();
    }
    
    @Override
    public List<Deliverable> findByTaskIdAndStatus(UUID taskId, DeliverableStatus status) {
        return jpaRepository.findByTaskIdAndStatus(taskId, status.name())
                .stream()
                .map(this::toDomainEntity)
                .toList();
    }
    
    @Override
    public Deliverable update(Deliverable deliverable) {
        DeliverableJpaEntity entity = toPersistenceEntity(deliverable);
        DeliverableJpaEntity updated = jpaRepository.save(entity);
        return toDomainEntity(updated);
    }
    
    @Override
    public void delete(UUID id) {
        jpaRepository.deleteById(id);
    }
    
    @Override
    public boolean existsById(UUID id) {
        return jpaRepository.existsById(id);
    }
    
    // Mapping methods
    private Deliverable toDomainEntity(DeliverableJpaEntity entity) {
        return Deliverable.builder()
                .id(entity.getId())
                .taskId(entity.getTaskId())
                .submittedBy(entity.getSubmittedBy())
                .filePath(entity.getFilePath())
                .feedback(entity.getFeedback())
                .status(DeliverableStatus.valueOf(entity.getStatus()))
                .submissionDate(entity.getSubmissionDate())
                .feedbackDate(entity.getFeedbackDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    private DeliverableJpaEntity toPersistenceEntity(Deliverable domain) {
        return new DeliverableJpaEntity(
                domain.getId(),
                domain.getTaskId(),
                domain.getSubmittedBy(),
                domain.getFilePath(),
                domain.getFeedback(),
                domain.getStatus().name(),
                domain.getSubmissionDate(),
                domain.getFeedbackDate(),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }
}
