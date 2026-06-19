package com.siaoa.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

public class PasswordRecoveryCode {
    private final UUID id;
    private final UUID userId;
    private final String code;
    private final LocalDateTime createdAt;
    private final LocalDateTime expiresAt;
    private final boolean used;

    public PasswordRecoveryCode(UUID id, UUID userId, String code, LocalDateTime createdAt, LocalDateTime expiresAt, boolean used) {
        this.id = id;
        this.userId = userId;
        this.code = code;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.used = used;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getCode() {
        return code;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public boolean isUsed() {
        return used;
    }
}
