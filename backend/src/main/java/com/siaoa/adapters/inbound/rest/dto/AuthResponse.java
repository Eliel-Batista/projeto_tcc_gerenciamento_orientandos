package com.siaoa.adapters.inbound.rest.dto;

import com.siaoa.domain.entities.UserProfile;
import java.util.UUID;

public class AuthResponse {
    private UUID userId;
    private String email;
    private String fullName;
    private UserProfile profile;
    private String token;
    private Long expiresAt;

    public AuthResponse() {}

    public AuthResponse(UUID userId, String email, String fullName, UserProfile profile, String token, Long expiresAt) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.profile = profile;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public UserProfile getProfile() {
        return profile;
    }

    public void setProfile(UserProfile profile) {
        this.profile = profile;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Long expiresAt) {
        this.expiresAt = expiresAt;
    }
}
