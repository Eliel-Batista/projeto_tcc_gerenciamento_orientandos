package com.siaoa.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

public class User {
    private final UUID id;
    private final String email;
    private final String password;
    private final String fullName;
    private final UserProfile profile;
    private final boolean active;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public User(
            UUID id,
            String email,
            String password,
            String fullName,
            UserProfile profile,
            boolean active,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.profile = profile;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getFullName() {
        return fullName;
    }

    public UserProfile getProfile() {
        return profile;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
