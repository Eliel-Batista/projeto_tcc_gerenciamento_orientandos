package com.siaoa.infra.outbound.persistence.repositories;

import com.siaoa.infra.outbound.persistence.entities.MeetingInviteJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MeetingInviteJpaRepository extends JpaRepository<MeetingInviteJpaEntity, UUID> {

    /** Todos os convites recebidos por um orientando */
    List<MeetingInviteJpaEntity> findByOrientandoId(UUID orientandoId);

    /** Convites de uma reunião específica */
    List<MeetingInviteJpaEntity> findByMeetingId(UUID meetingId);

    /** Convites pendentes de um orientando */
    List<MeetingInviteJpaEntity> findByOrientandoIdAndStatus(UUID orientandoId, String status);

    /** Convites criados por um orientador (para o painel lateral dele) */
    List<MeetingInviteJpaEntity> findByOrientadorIdAndStatus(UUID orientadorId, String status);

    /** Todos os convites de um orientador (enviados por ele ou recebidos de orientandos) */
    List<MeetingInviteJpaEntity> findByOrientadorId(UUID orientadorId);
}
