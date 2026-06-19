package com.siaoa.adapters.inbound.rest;

import com.siaoa.adapters.inbound.rest.dto.AuthResponse;
import com.siaoa.adapters.inbound.rest.dto.LoginRequest;
import com.siaoa.adapters.inbound.rest.dto.RegisterRequest;
import com.siaoa.adapters.inbound.rest.dto.UserResponse;
import com.siaoa.adapters.inbound.rest.dto.ForgotPasswordRequest;
import com.siaoa.adapters.inbound.rest.dto.ResetPasswordRequest;
import com.siaoa.adapters.inbound.rest.dto.VerifyCodeRequest;
import com.siaoa.application.ports.usecases.AuthenticationUseCase;
import com.siaoa.application.ports.repository.UserRepository;
import com.siaoa.domain.entities.User;
import com.siaoa.infra.security.JwtProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationUseCase authenticationUseCase;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    public AuthController(AuthenticationUseCase authenticationUseCase, UserRepository userRepository, JwtProvider jwtProvider) {
        this.authenticationUseCase = authenticationUseCase;
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authenticationUseCase.register(
                request.getEmail(),
                request.getPassword(),
                request.getFullName(),
                request.getProfile()
        );

        String token = jwtProvider.generateToken(user.getId(), user.getEmail());
        Long expiresAt = jwtProvider.extractExpirationTime(token);

        AuthResponse response = new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getProfile(),
                token,
                expiresAt
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = authenticationUseCase.login(request.getEmail(), request.getPassword());

        String token = jwtProvider.generateToken(user.getId(), user.getEmail());
        Long expiresAt = jwtProvider.extractExpirationTime(token);

        AuthResponse response = new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getProfile(),
                token,
                expiresAt
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userIdString = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdString);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse response = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getProfile()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authenticationUseCase.generateRecoveryCode(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Void> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        authenticationUseCase.verifyRecoveryCode(request.getEmail(), request.getCode());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authenticationUseCase.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
