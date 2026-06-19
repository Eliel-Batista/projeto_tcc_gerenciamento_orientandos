package com.siaoa.adapters.inbound.rest.dto;

import com.siaoa.domain.entities.UserProfile;
import java.util.UUID;

public class UserResponse {
    private UUID userId;
    private String email;
    private String fullName;
    private UserProfile profile;

    public UserResponse() {}

    public UserResponse(UUID userId, String email, String fullName, UserProfile profile) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.profile = profile;
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
}
