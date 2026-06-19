package com.siaoa.application.ports.repository;

import com.siaoa.domain.entities.PasswordRecoveryCode;

import java.util.Optional;

public interface PasswordRecoveryCodeRepository {
    PasswordRecoveryCode save(PasswordRecoveryCode code);
    Optional<PasswordRecoveryCode> findValidCode(String email, String code);
    void markAsUsed(PasswordRecoveryCode code);
}
