package com.siaoa.infra.outbound.persistence.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "orientando_connections")
public class OrientandoConnectionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "orientador_id", nullable = false)
    private UUID orientadorId;

    @Column(name = "orientando_id", nullable = false)
    private UUID orientandoId;

    @Column(length = 255)
    private String projeto;

    @Column(length = 255)
    private String categoria;

    @Column(name = "tipo_curso", length = 255)
    private String tipoCurso;

    @Column(name = "avatar_cor", length = 50)
    private String avatarCor;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(length = 50)
    private String status = "PENDENTE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public OrientandoConnectionJpaEntity() {}

    public OrientandoConnectionJpaEntity(UUID orientadorId, UUID orientandoId, String projeto, String categoria, String tipoCurso, String avatarCor, Boolean ativo, String status) {
        this.orientadorId = orientadorId;
        this.orientandoId = orientandoId;
        this.projeto = projeto;
        this.categoria = categoria;
        this.tipoCurso = tipoCurso;
        this.avatarCor = avatarCor;
        this.ativo = ativo;
        this.status = status;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOrientadorId() { return orientadorId; }
    public void setOrientadorId(UUID orientadorId) { this.orientadorId = orientadorId; }
    public UUID getOrientandoId() { return orientandoId; }
    public void setOrientandoId(UUID orientandoId) { this.orientandoId = orientandoId; }
    public String getProjeto() { return projeto; }
    public void setProjeto(String projeto) { this.projeto = projeto; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getTipoCurso() { return tipoCurso; }
    public void setTipoCurso(String tipoCurso) { this.tipoCurso = tipoCurso; }
    public String getAvatarCor() { return avatarCor; }
    public void setAvatarCor(String avatarCor) { this.avatarCor = avatarCor; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
