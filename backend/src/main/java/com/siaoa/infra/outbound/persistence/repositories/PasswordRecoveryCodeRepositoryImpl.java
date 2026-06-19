package com.siaoa.infra.outbound.persistence.repositories;

import com.siaoa.application.ports.repository.PasswordRecoveryCodeRepository;
import com.siaoa.domain.entities.PasswordRecoveryCode;
import com.siaoa.infra.outbound.persistence.entities.PasswordRecoveryCodeJpaEntity;
import com.siaoa.adapters.outbound.persistence.JpaUserRepository;
import com.siaoa.adapters.outbound.persistence.UserEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class PasswordRecoveryCodeRepositoryImpl implements PasswordRecoveryCodeRepository {

    private final PasswordRecoveryCodeJpaRepository jpaRepository;
    private final JpaUserRepository userRepository;

    public PasswordRecoveryCodeRepositoryImpl(PasswordRecoveryCodeJpaRepository jpaRepository, JpaUserRepository userRepository) {
        this.jpaRepository = jpaRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PasswordRecoveryCode save(PasswordRecoveryCode code) {
        UserEntity user = userRepository.findById(code.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        PasswordRecoveryCodeJpaEntity entity = new PasswordRecoveryCodeJpaEntity(
                code.getId(),
                user,
                code.getCode(),
                code.getCreatedAt(),
                code.getExpiresAt(),
                code.isUsed()
        );

        PasswordRecoveryCodeJpaEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<PasswordRecoveryCode> findValidCode(String email, String code) {
        return jpaRepository.findTopByUserEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(email, code)
                .filter(entity -> entity.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(this::toDomain);
    }

    @Override
    public void markAsUsed(PasswordRecoveryCode code) {
        jpaRepository.findById(code.getId()).ifPresent(entity -> {
            entity.setUsed(true);
            jpaRepository.save(entity);
        });
    }

    private PasswordRecoveryCode toDomain(PasswordRecoveryCodeJpaEntity entity) {
        return new PasswordRecoveryCode(
                entity.getId(),
                entity.getUser().getId(),
                entity.getCode(),
                entity.getCreatedAt(),
                entity.getExpiresAt(),
                entity.isUsed()
        );
    }
}
