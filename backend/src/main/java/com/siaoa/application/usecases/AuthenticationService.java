package com.siaoa.application.usecases;

import com.siaoa.application.ports.repository.UserRepository;
import com.siaoa.application.ports.usecases.AuthenticationUseCase;
import com.siaoa.domain.entities.User;
import com.siaoa.domain.entities.UserProfile;
import com.siaoa.domain.exceptions.InvalidCredentialsException;
import com.siaoa.domain.exceptions.UserAlreadyExistsException;
import com.siaoa.infra.security.JwtProvider;
import com.siaoa.application.ports.outbound.EmailSenderPort;
import com.siaoa.application.ports.repository.PasswordRecoveryCodeRepository;
import com.siaoa.domain.entities.PasswordRecoveryCode;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthenticationService implements AuthenticationUseCase {
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final PasswordRecoveryCodeRepository recoveryCodeRepository;
    private final EmailSenderPort emailSenderPort;

    public AuthenticationService(UserRepository userRepository, JwtProvider jwtProvider, PasswordRecoveryCodeRepository recoveryCodeRepository, EmailSenderPort emailSenderPort) {
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
        this.recoveryCodeRepository = recoveryCodeRepository;
        this.emailSenderPort = emailSenderPort;
        this.passwordEncoder = new BCryptPasswordEncoder(12);
    }

    @Override
    public User register(String email, String password, String fullName, UserProfile profile) {
        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new UserAlreadyExistsException("User with email '" + email + "' already exists");
        }

        // Hash the password
        String hashedPassword = passwordEncoder.encode(password);

        // Create new user
        LocalDateTime now = LocalDateTime.now();
        User newUser = new User(
                UUID.randomUUID(),
                email,
                hashedPassword,
                fullName,
                profile,
                true,
                now,
                now
        );

        // Save and return
        return userRepository.save(newUser);
    }

    @Override
    public User login(String email, String password) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        // Check if user is active
        if (!user.isActive()) {
            throw new InvalidCredentialsException("User account is inactive");
        }

        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return user;
    }

    @Override
    public boolean validateToken(String token) {
        return jwtProvider.validateToken(token);
    }

    @Override
    public String getToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        return jwtProvider.generateToken(user.getId(), user.getEmail());
    }

    @Override
    public void generateRecoveryCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        String code = String.format("%06d", new Random().nextInt(999999));
        
        PasswordRecoveryCode recoveryCode = new PasswordRecoveryCode(
                UUID.randomUUID(),
                user.getId(),
                code,
                LocalDateTime.now(),
                LocalDateTime.now().plusMinutes(15),
                false
        );
        
        recoveryCodeRepository.save(recoveryCode);
        
        try {
            emailSenderPort.sendEmail(
                    email,
                    "Seu código de recuperação de senha",
                    "Seu código para redefinir a senha é: " + code + "\nEste código expira em 15 minutos."
            );
            System.out.println("Recovery code sent to " + email + ". Code: " + code);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + email + ". The recovery code is: " + code);
            e.printStackTrace();
        }
    }

    @Override
    public void verifyRecoveryCode(String email, String code) {
        recoveryCodeRepository.findValidCode(email, code)
                .orElseThrow(() -> new RuntimeException("Invalid or expired recovery code"));
    }

    @Override
    public void resetPassword(String email, String code, String newPassword) {
        PasswordRecoveryCode validCode = recoveryCodeRepository.findValidCode(email, code)
                .orElseThrow(() -> new RuntimeException("Invalid or expired recovery code"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String hashedPassword = passwordEncoder.encode(newPassword);

        User updatedUser = new User(
                user.getId(),
                user.getEmail(),
                hashedPassword,
                user.getFullName(),
                user.getProfile(),
                user.isActive(),
                user.getCreatedAt(),
                LocalDateTime.now()
        );

        userRepository.save(updatedUser);
        recoveryCodeRepository.markAsUsed(validCode);
    }
}
