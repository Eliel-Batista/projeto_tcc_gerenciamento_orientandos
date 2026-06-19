package com.siaoa.adapters.outbound.persistence;

import com.siaoa.application.ports.repository.UserRepository;
import com.siaoa.domain.entities.User;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class UserRepositoryAdapter implements UserRepository {
    private final JpaUserRepository jpaUserRepository;

    public UserRepositoryAdapter(JpaUserRepository jpaUserRepository) {
        this.jpaUserRepository = jpaUserRepository;
    }

    @Override
    public User save(User user) {
        UserEntity entity = new UserEntity(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getFullName(),
                user.getProfile(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
        UserEntity savedEntity = jpaUserRepository.save(entity);
        return toDomainUser(savedEntity);
    }

    @Override
    public Optional<User> findById(UUID userId) {
        return jpaUserRepository.findById(userId).map(this::toDomainUser);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaUserRepository.findByEmailIgnoreCase(email).map(this::toDomainUser);
    }

    private User toDomainUser(UserEntity entity) {
        return new User(
                entity.getId(),
                entity.getEmail(),
                entity.getPassword(),
                entity.getFullName(),
                entity.getProfile(),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
