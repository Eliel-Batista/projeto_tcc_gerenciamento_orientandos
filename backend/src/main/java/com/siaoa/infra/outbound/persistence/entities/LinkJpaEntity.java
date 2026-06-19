package com.siaoa.infra.outbound.persistence.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "links")
public class LinkJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "link_assignments", joinColumns = @JoinColumn(name = "link_id"))
    @Column(name = "assigned_user_id")
    private List<UUID> assignedUserIds = new ArrayList<>();

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String link;

    @Column(length = 255)
    private String autor;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public LinkJpaEntity() {}

    public LinkJpaEntity(UUID userId, String titulo, String link, String autor, String comentario) {
        this(userId, null, titulo, link, autor, comentario);
    }

    public LinkJpaEntity(UUID userId, List<UUID> assignedUserIds, String titulo, String link, String autor, String comentario) {
        this.userId = userId;
        this.assignedUserIds = assignedUserIds;
        this.titulo = titulo;
        this.link = link;
        this.autor = autor;
        this.comentario = comentario;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public List<UUID> getAssignedUserIds() { return assignedUserIds; }
    public void setAssignedUserIds(List<UUID> assignedUserIds) { this.assignedUserIds = assignedUserIds; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
