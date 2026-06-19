package com.siaoa.infra.outbound.persistence.repositories;

import com.siaoa.infra.outbound.persistence.entities.LinkJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LinkJpaRepository extends JpaRepository<LinkJpaEntity, UUID> {
    // Basic CRUD provided by JpaRepository
}
