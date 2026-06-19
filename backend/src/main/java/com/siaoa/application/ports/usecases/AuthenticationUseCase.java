package com.siaoa.application.ports.usecases;

import com.siaoa.domain.entities.User;
import com.siaoa.domain.entities.UserProfile;

public interface AuthenticationUseCase {
    /**
     * Register a new user
     *
     * @param email User email
     * @param password Plain text password
     * @param fullName User's full name
     * @param profile User profile type (ORIENTADOR or ORIENTANDO)
     * @return Registered user
     * @throws com.siaoa.domain.exceptions.UserAlreadyExistsException if email already exists
     */
    User register(String email, String password, String fullName, UserProfile profile);

    /**
     * Authenticate user and generate JWT token
     *
     * @param email User email
     * @param password Plain text password
     * @return Authenticated user
     * @throws com.siaoa.domain.exceptions.InvalidCredentialsException if credentials are invalid
     */
    User login(String email, String password);

    /**
     * Validate JWT token
     *
     * @param token JWT token string
     * @return true if token is valid
     */
    boolean validateToken(String token);

    /**
     * Get token from JWT string
     *
     * @param email User email
     * @return Generated JWT token
     */
    String getToken(String email);

    /**
     * Generate password recovery code and send by email
     *
     * @param email User email
     */
    void generateRecoveryCode(String email);

    /**
     * Verify if the recovery code is valid
     *
     * @param email User email
     * @param code Recovery code
     */
    void verifyRecoveryCode(String email, String code);

    /**
     * Reset password using recovery code
     *
     * @param email User email
     * @param code Recovery code
     * @param newPassword New password
     */
    void resetPassword(String email, String code, String newPassword);
}
