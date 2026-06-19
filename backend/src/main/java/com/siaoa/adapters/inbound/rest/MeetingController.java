package com.siaoa.adapters.inbound.rest;

import com.siaoa.adapters.inbound.rest.dto.MeetingDTO;
import com.siaoa.adapters.inbound.rest.dto.MeetingInviteDTO;
import com.siaoa.application.ports.repository.UserRepository;
import com.siaoa.application.usecases.NotificationUseCase;
import com.siaoa.domain.entities.NotificationType;
import com.siaoa.domain.entities.User;
import com.siaoa.domain.entities.UserProfile;
import com.siaoa.infra.outbound.persistence.entities.MeetingInviteJpaEntity;
import com.siaoa.infra.outbound.persistence.entities.MeetingJpaEntity;
import com.siaoa.infra.outbound.persistence.entities.OrientandoConnectionJpaEntity;
import com.siaoa.infra.outbound.persistence.repositories.MeetingInviteJpaRepository;
import com.siaoa.infra.outbound.persistence.repositories.MeetingJpaRepository;
import com.siaoa.infra.outbound.persistence.repositories.OrientandoConnectionJpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingJpaRepository meetingRepository;
    private final MeetingInviteJpaRepository inviteRepository;
    private final OrientandoConnectionJpaRepository orientandoRepository;
    private final UserRepository userRepository;
    private final NotificationUseCase notificationUseCase;

    public MeetingController(MeetingJpaRepository meetingRepository,
                             MeetingInviteJpaRepository inviteRepository,
                             OrientandoConnectionJpaRepository orientandoRepository,
                             UserRepository userRepository,
                             NotificationUseCase notificationUseCase) {
        this.meetingRepository = meetingRepository;
        this.inviteRepository = inviteRepository;
        this.orientandoRepository = orientandoRepository;
        this.userRepository = userRepository;
        this.notificationUseCase = notificationUseCase;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/meetings  — lista reuniões visíveis ao usuário autenticado
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<MeetingDTO>> list() {
        UUID currentUserId = getCurrentUserId();

        // Reuniões que o usuário criou
        Set<UUID> visibleMeetingIds = meetingRepository.findByCreatedBy(currentUserId)
                .stream().map(MeetingJpaEntity::getId).collect(Collectors.toSet());

        // Reuniões às quais o usuário foi convidado (exceto as canceladas por ele)
        inviteRepository.findByOrientandoId(currentUserId)
                .stream()
                .filter(inv -> !"CANCELADO".equals(inv.getStatus()))
                .forEach(inv -> visibleMeetingIds.add(inv.getMeetingId()));

        List<MeetingDTO> dtoList = meetingRepository.findAll().stream()
                .filter(e -> visibleMeetingIds.contains(e.getId()))
                .map(entity -> new MeetingDTO(
                        entity.getId(),
                        entity.getTitle(),
                        entity.getMeetingType(),
                        entity.getCreatedBy().equals(currentUserId),
                        entity.getScheduledAt(),
                        entity.getEndTime(),
                        entity.getDescription()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/meetings — cria reunião; se tipo = "reuniao", envia convites
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<MeetingDTO> create(@RequestBody MeetingDTO dto) {
        UUID currentUserId = getCurrentUserId();

        LocalDateTime start = dto.getStart() != null ? dto.getStart() : LocalDateTime.now();
        LocalDateTime end   = dto.getEnd()   != null ? dto.getEnd()   : start.plusHours(1);

        MeetingJpaEntity entity = new MeetingJpaEntity(
                null,
                dto.getTitle(),
                dto.getDescricao(),
                start,
                end,
                dto.getType(),
                currentUserId
        );

        MeetingJpaEntity saved = meetingRepository.save(entity);

        // Se for do tipo "reuniao", cria convites para os orientandos selecionados
        if ("reuniao".equalsIgnoreCase(dto.getType())) {
            Optional<User> orientadorOpt = userRepository.findById(currentUserId);
            String orientadorNome = orientadorOpt.map(User::getFullName).orElse("Orientador");

            // Busca todos os orientandos VINCULADOS ao orientador
            List<OrientandoConnectionJpaEntity> conexoesVinculadas = orientandoRepository
                    .findByOrientadorId(currentUserId)
                    .stream()
                    .filter(c -> "VINCULADO".equals(c.getStatus()))
                    .collect(Collectors.toList());

            // Se foram especificados orientandoIds, filtra apenas os selecionados (que estejam de fato vinculados)
            List<UUID> selectedIds = dto.getOrientandoIds();
            List<OrientandoConnectionJpaEntity> conexoes;
            if (selectedIds != null && !selectedIds.isEmpty()) {
                Set<UUID> selectedSet = new HashSet<>(selectedIds);
                conexoes = conexoesVinculadas.stream()
                        .filter(c -> selectedSet.contains(c.getOrientandoId()))
                        .collect(Collectors.toList());
            } else {
                conexoes = conexoesVinculadas;
            }

            for (OrientandoConnectionJpaEntity conn : conexoes) {
                UUID orientandoUserId = conn.getOrientandoId();

                MeetingInviteJpaEntity invite = new MeetingInviteJpaEntity(
                        saved.getId(), currentUserId, orientandoUserId
                );
                inviteRepository.save(invite);

                String mensagem = String.format(
                        "Prof. %s agendou uma reunião: \"%s\" em %s às %s.",
                        orientadorNome,
                        saved.getTitle(),
                        start.toLocalDate(),
                        start.toLocalTime().withSecond(0).withNano(0)
                );
                notificationUseCase.createNotification(
                        orientandoUserId,
                        "Convite de Reunião",
                        mensagem,
                        NotificationType.MEETING_REQUEST,
                        "meeting_invites",
                        invite.getId()
                );
            }
        }


        MeetingDTO novo = new MeetingDTO(
                saved.getId(), saved.getTitle(), saved.getMeetingType(), true,
                saved.getScheduledAt(), saved.getEndTime(), saved.getDescription()
        );
        return ResponseEntity.ok(novo);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/meetings/{id}
    // ─────────────────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        meetingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/meetings/invites — convites do usuário autenticado
    //   Orientando: convites que ele recebeu (todos os status)
    //   Orientador: convites que ele enviou (todos os status)
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/invites")
    public ResponseEntity<List<MeetingInviteDTO>> listInvites() {
        UUID currentUserId = getCurrentUserId();

        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        boolean isOrientando = currentUserOpt
                .map(u -> u.getProfile() == UserProfile.ORIENTANDO)
                .orElse(false);

        List<MeetingInviteJpaEntity> invites;
        if (isOrientando) {
            // Orientando vê todos os convites recebidos (todos os status)
            invites = inviteRepository.findByOrientandoId(currentUserId);
        } else {
            // Orientador vê os convites pendentes que ele enviou
            invites = inviteRepository.findByOrientadorIdAndStatus(currentUserId, "PENDENTE");
        }

        List<MeetingInviteDTO> dtos = invites.stream()
                .map(inv -> buildInviteDTO(inv))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/meetings/invites/{inviteId}/respond
    // Body: { "action": "ACEITO" | "RECUSADO", "motivo": "..." }
    // ─────────────────────────────────────────────────────────────────────────
    @PutMapping("/invites/{inviteId}/respond")
    public ResponseEntity<?> respondToInvite(
            @PathVariable UUID inviteId,
            @RequestBody Map<String, String> body) {

        String action = body.get("action");
        String motivo = body.get("motivo");

        if (action == null || (!action.equals("ACEITO") && !action.equals("RECUSADO"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Ação inválida. Use 'ACEITO' ou 'RECUSADO'.");
        }

        if ("RECUSADO".equals(action) && (motivo == null || motivo.trim().isEmpty())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("O motivo da recusa é obrigatório.");
        }

        Optional<MeetingInviteJpaEntity> opt = inviteRepository.findById(inviteId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MeetingInviteJpaEntity invite = opt.get();
        invite.setStatus(action);
        if ("RECUSADO".equals(action)) {
            invite.setMotivoRecusa(motivo.trim());
        }
        inviteRepository.save(invite);

        // Busca dados para notificar o orientador
        Optional<MeetingJpaEntity> meetingOpt = meetingRepository.findById(invite.getMeetingId());
        Optional<User> orientandoOpt = userRepository.findById(invite.getOrientandoId());
        String orientandoNome = orientandoOpt.map(User::getFullName).orElse("Orientando");
        String meetingTitle   = meetingOpt.map(MeetingJpaEntity::getTitle).orElse("reunião");

        String mensagem;
        if ("ACEITO".equals(action)) {
            mensagem = String.format("%s aceitou o convite para a reunião \"%s\".", orientandoNome, meetingTitle);
        } else {
            mensagem = String.format(
                    "%s recusou o convite para a reunião \"%s\". Motivo: %s",
                    orientandoNome, meetingTitle, motivo
            );
        }

        notificationUseCase.createNotification(
                invite.getOrientadorId(),
                "Resposta ao Convite de Reunião",
                mensagem,
                "ACEITO".equals(action) ? NotificationType.SUCCESS : NotificationType.WARNING,
                "meeting_invites",
                invite.getId()
        );

        return ResponseEntity.ok(buildInviteDTO(invite));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/meetings/invites/{inviteId}/cancel — orientando cancela presença
    //
    // Regra:
    //   • Se o meeting tem apenas 1 convite (orientador + este orientando) → deleta o meeting inteiro
    //   • Se o meeting tem 2+ convites (3+ pessoas) → cancela apenas este invite, notifica orientador
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/invites/{inviteId}/cancel")
    public ResponseEntity<?> cancelInvite(
            @PathVariable UUID inviteId,
            @RequestBody(required = false) Map<String, String> body) {

        String motivo = body != null ? body.getOrDefault("motivo", "").trim() : "";

        Optional<MeetingInviteJpaEntity> opt = inviteRepository.findById(inviteId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MeetingInviteJpaEntity invite = opt.get();

        UUID currentUserId = getCurrentUserId();
        boolean isOrientando = invite.getOrientandoId().equals(currentUserId);
        boolean isOrientador = invite.getOrientadorId().equals(currentUserId);

        if (!isOrientando && !isOrientador) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<MeetingJpaEntity> meetingOpt = meetingRepository.findById(invite.getMeetingId());
        String meetingTitle = meetingOpt.map(MeetingJpaEntity::getTitle).orElse("reunião");
        
        Optional<User> orientandoOpt = userRepository.findById(invite.getOrientandoId());
        String orientandoNome = orientandoOpt.map(User::getFullName).orElse("Orientando");
        
        Optional<User> orientadorOpt = userRepository.findById(invite.getOrientadorId());
        String orientadorNome = orientadorOpt.map(User::getFullName).orElse("Orientador");

        if (isOrientando) {
            if (motivo.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("O motivo do cancelamento é obrigatório.");
            }

            // Conta quantos outros convites existem para este meeting
            List<MeetingInviteJpaEntity> todosConvites = inviteRepository.findByMeetingId(invite.getMeetingId());
            long outrosConvites = todosConvites.stream()
                    .filter(c -> !c.getId().equals(inviteId))
                    .count();

            if (outrosConvites == 0) {
                // Apenas 2 pessoas (orientador + este orientando) → deleta o meeting inteiro
                meetingRepository.deleteById(invite.getMeetingId()); // cascade deleta convites

                notificationUseCase.createNotification(
                        invite.getOrientadorId(),
                        "Reunião Cancelada",
                        String.format("%s cancelou a participação na reunião \"%s\" e ela foi encerrada. Motivo: %s",
                                orientandoNome, meetingTitle, motivo),
                        NotificationType.MEETING_CANCELLED,
                        "meetings",
                        invite.getMeetingId()
                );

                return ResponseEntity.ok(Map.of("action", "MEETING_DELETED", "message", "Reunião encerrada pois não há mais participantes."));
            } else {
                // 3+ pessoas → cancela apenas este invite, meeting continua para os demais
                invite.setStatus("CANCELADO");
                invite.setMotivoRecusa(motivo);
                inviteRepository.save(invite);

                notificationUseCase.createNotification(
                        invite.getOrientadorId(),
                        "Cancelamento de Participação",
                        String.format("%s cancelou a participação na reunião \"%s\". Motivo: %s",
                                orientandoNome, meetingTitle, motivo),
                        NotificationType.MEETING_CANCELLED,
                        "meeting_invites",
                        invite.getId()
                );

                return ResponseEntity.ok(Map.of("action", "INVITE_CANCELLED", "message", "Participação cancelada com sucesso."));
            }
        } else {
            // Orientador cancelando o convite
            invite.setStatus("CANCELADO");
            if (!motivo.isEmpty()) {
                invite.setMotivoRecusa(motivo);
            } else {
                invite.setMotivoRecusa("Cancelado pelo organizador.");
            }
            inviteRepository.save(invite);

            notificationUseCase.createNotification(
                    invite.getOrientandoId(),
                    "Convite Cancelado",
                    String.format("O orientador %s cancelou o convite para a reunião \"%s\".",
                            orientadorNome, meetingTitle),
                    NotificationType.MEETING_CANCELLED,
                    "meeting_invites",
                    invite.getId()
            );

            return ResponseEntity.ok(Map.of("action", "INVITE_CANCELLED", "message", "Convite cancelado com sucesso."));
        }
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private MeetingInviteDTO buildInviteDTO(MeetingInviteJpaEntity inv) {
        Optional<MeetingJpaEntity> meetingOpt = meetingRepository.findById(inv.getMeetingId());
        if (meetingOpt.isEmpty()) return null;

        MeetingJpaEntity meeting = meetingOpt.get();
        String orientadorNome = userRepository.findById(inv.getOrientadorId())
                .map(User::getFullName).orElse("Orientador");
        String orientandoNome = userRepository.findById(inv.getOrientandoId())
                .map(User::getFullName).orElse("Orientando");

        return new MeetingInviteDTO(
                inv.getId(),
                inv.getMeetingId(),
                meeting.getTitle(),
                meeting.getDescription(),
                meeting.getScheduledAt(),
                meeting.getEndTime(),
                orientadorNome,
                orientandoNome,
                inv.getStatus(),
                inv.getMotivoRecusa()
        );
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String principal = authentication.getPrincipal().toString();
        try {
            return UUID.fromString(principal);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user ID format in token");
        }
    }
}
