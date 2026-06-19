package com.siaoa.adapters.inbound.rest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class MeetingDTO {
    private UUID id;
    private String title;
    private String type;
    private boolean isCreator;
    private LocalDateTime start;
    private LocalDateTime end;
    private String descricao;
    /** IDs dos orientandos a convidar. Se null ou vazio, convida todos os vinculados. */
    private List<UUID> orientandoIds;

    public MeetingDTO() {}

    public MeetingDTO(UUID id, String title, String type, boolean isCreator, LocalDateTime start, LocalDateTime end, String descricao) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.isCreator = isCreator;
        this.start = start;
        this.end = end;
        this.descricao = descricao;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    @JsonProperty("isCreator")
    public boolean isCreator() { return isCreator; }
    public void setCreator(boolean creator) { isCreator = creator; }
    public LocalDateTime getStart() { return start; }
    public void setStart(LocalDateTime start) { this.start = start; }
    public LocalDateTime getEnd() { return end; }
    public void setEnd(LocalDateTime end) { this.end = end; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public List<UUID> getOrientandoIds() { return orientandoIds; }
    public void setOrientandoIds(List<UUID> orientandoIds) { this.orientandoIds = orientandoIds; }
}

