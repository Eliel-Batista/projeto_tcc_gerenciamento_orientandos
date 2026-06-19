package com.siaoa.adapters.inbound.rest.dto;

import java.util.UUID;

public class OrientandoDTO {
    private UUID id;
    private UUID userId;
    private String nome;
    private String email;
    private String projeto;
    private String categoria;
    private String tipoCurso;
    private String avatarCor;
    private boolean ativo;
    private String status;

    public OrientandoDTO() {}

    public OrientandoDTO(UUID id, String nome, String email, String projeto, String categoria, String tipoCurso, String avatarCor, boolean ativo, String status) {
        this(id, nome, email, projeto, categoria, tipoCurso, avatarCor, ativo, status, null);
    }

    public OrientandoDTO(UUID id, String nome, String email, String projeto, String categoria, String tipoCurso, String avatarCor, boolean ativo, String status, UUID userId) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.projeto = projeto;
        this.categoria = categoria;
        this.tipoCurso = tipoCurso;
        this.avatarCor = avatarCor;
        this.ativo = ativo;
        this.status = status;
        this.userId = userId;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProjeto() { return projeto; }
    public void setProjeto(String projeto) { this.projeto = projeto; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getTipoCurso() { return tipoCurso; }
    public void setTipoCurso(String tipoCurso) { this.tipoCurso = tipoCurso; }
    public String getAvatarCor() { return avatarCor; }
    public void setAvatarCor(String avatarCor) { this.avatarCor = avatarCor; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
