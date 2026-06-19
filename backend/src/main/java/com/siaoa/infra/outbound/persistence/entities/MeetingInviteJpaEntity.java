package com.siaoa.infra.outbound.persistence.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Representa um convite de reunião enviado pelo orientador a um orientando.
 * O orientando pode aceitar ou recusar (motivo obrigatório em caso de recusa).
 */
@Entity
@Table(name = "meeting_invites")
public class MeetingInviteJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "meeting_id", nullable = false)
    private UUID meetingId;

    @Column(name = "orientador_id", nullable = false)
    private UUID orientadorId;

    @Column(name = "orientando_id", nullable = false)
    private UUID orientandoId;

    @Column(length = 20, nullable = false)
    private String status = "PENDENTE";

    @Column(name = "motivo_recusa", columnDefinition = "TEXT")
    private String motivoRecusa;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public MeetingInviteJpaEntity() {}

    public MeetingInviteJpaEntity(UUID meetingId, UUID orientadorId, UUID orientandoId) {
        this.meetingId = meetingId;
        this.orientadorId = orientadorId;
        this.orientandoId = orientandoId;
        this.status = "PENDENTE";
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }

    public UUID getOrientadorId() { return orientadorId; }
    public void setOrientadorId(UUID orientadorId) { this.orientadorId = orientadorId; }

    public UUID getOrientandoId() { return orientandoId; }
    public void setOrientandoId(UUID orientandoId) { this.orientandoId = orientandoId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMotivoRecusa() { return motivoRecusa; }
    public void setMotivoRecusa(String motivoRecusa) { this.motivoRecusa = motivoRecusa; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
