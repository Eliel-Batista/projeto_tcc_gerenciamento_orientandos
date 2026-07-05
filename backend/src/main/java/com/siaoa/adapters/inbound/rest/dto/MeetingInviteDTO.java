package com.siaoa.adapters.inbound.rest.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de resposta para convites de reunião (MeetingInvite).
 * Retornado ao orientando no painel de Solicitações Pendentes e ao orientador
 * para acompanhar o estado dos convites que ele enviou.
 */
public class MeetingInviteDTO {

    private UUID id;
    private UUID meetingId;
    private String meetingTitle;
    private String meetingDescricao;
    private LocalDateTime start;
    private LocalDateTime end;
    private String orientadorNome;
    private String orientandoNome;
    private String status;
    private String motivoRecusa;
    /** true = este convite foi enviado pelo usuário atual; false = ele é o destinatário */
    private boolean sentByMe;

    public MeetingInviteDTO() {}

    public MeetingInviteDTO(UUID id, UUID meetingId, String meetingTitle, String meetingDescricao,
                            LocalDateTime start, LocalDateTime end,
                            String orientadorNome, String orientandoNome,
                            String status, String motivoRecusa) {
        this.id = id;
        this.meetingId = meetingId;
        this.meetingTitle = meetingTitle;
        this.meetingDescricao = meetingDescricao;
        this.start = start;
        this.end = end;
        this.orientadorNome = orientadorNome;
        this.orientandoNome = orientandoNome;
        this.status = status;
        this.motivoRecusa = motivoRecusa;
        this.sentByMe = false;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }

    public String getMeetingTitle() { return meetingTitle; }
    public void setMeetingTitle(String meetingTitle) { this.meetingTitle = meetingTitle; }

    public String getMeetingDescricao() { return meetingDescricao; }
    public void setMeetingDescricao(String meetingDescricao) { this.meetingDescricao = meetingDescricao; }

    public LocalDateTime getStart() { return start; }
    public void setStart(LocalDateTime start) { this.start = start; }

    public LocalDateTime getEnd() { return end; }
    public void setEnd(LocalDateTime end) { this.end = end; }

    public String getOrientadorNome() { return orientadorNome; }
    public void setOrientadorNome(String orientadorNome) { this.orientadorNome = orientadorNome; }

    public String getOrientandoNome() { return orientandoNome; }
    public void setOrientandoNome(String orientandoNome) { this.orientandoNome = orientandoNome; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMotivoRecusa() { return motivoRecusa; }
    public void setMotivoRecusa(String motivoRecusa) { this.motivoRecusa = motivoRecusa; }

    public boolean isSentByMe() { return sentByMe; }
    public void setSentByMe(boolean sentByMe) { this.sentByMe = sentByMe; }
}
