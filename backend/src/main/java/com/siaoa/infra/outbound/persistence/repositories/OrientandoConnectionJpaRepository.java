package com.siaoa.infra.outbound.persistence.repositories;

import com.siaoa.infra.outbound.persistence.entities.OrientandoConnectionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrientandoConnectionJpaRepository extends JpaRepository<OrientandoConnectionJpaEntity, UUID> {
    List<OrientandoConnectionJpaEntity> findByOrientadorId(UUID orientadorId);
    List<OrientandoConnectionJpaEntity> findByOrientandoId(UUID orientandoId);
    Optional<OrientandoConnectionJpaEntity> findByOrientadorIdAndOrientandoId(UUID orientadorId, UUID orientandoId);
}
