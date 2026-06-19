package com.siaoa.application.ports.repository;

import com.siaoa.domain.entities.User;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(UUID userId);
    Optional<User> findByEmail(String email);
}
