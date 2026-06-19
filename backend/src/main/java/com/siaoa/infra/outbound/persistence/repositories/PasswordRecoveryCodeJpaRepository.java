package com.siaoa.infra.outbound.persistence.repositories;

import com.siaoa.infra.outbound.persistence.entities.PasswordRecoveryCodeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordRecoveryCodeJpaRepository extends JpaRepository<PasswordRecoveryCodeJpaEntity, UUID> {
    Optional<PasswordRecoveryCodeJpaEntity> findTopByUserEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(String email, String code);
}
