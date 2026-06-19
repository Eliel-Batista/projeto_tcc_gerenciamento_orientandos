package com.siaoa.adapters.inbound.rest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;
import java.util.List;

public class LinkDTO {
    private UUID id;
    private String titulo;
    private String link;
    private String autor;
    private String comentario;
    @JsonProperty("isCreator")
    private boolean isCreator;
    private List<UUID> assignedUserIds;

    public LinkDTO() {}

    public LinkDTO(UUID id, String titulo, String link, String autor, String comentario, boolean isCreator) {
        this(id, titulo, link, autor, comentario, isCreator, null);
    }

    public LinkDTO(UUID id, String titulo, String link, String autor, String comentario, boolean isCreator, List<UUID> assignedUserIds) {
        this.id = id;
        this.titulo = titulo;
        this.link = link;
        this.autor = autor;
        this.comentario = comentario;
        this.isCreator = isCreator;
        this.assignedUserIds = assignedUserIds;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    @JsonProperty("isCreator")
    public boolean isCreator() { return isCreator; }
    public void setIsCreator(boolean isCreator) { this.isCreator = isCreator; }
    public List<UUID> getAssignedUserIds() { return assignedUserIds; }
    public void setAssignedUserIds(List<UUID> assignedUserIds) { this.assignedUserIds = assignedUserIds; }
}
