package com.siaoa.adapters.inbound.rest;

import com.siaoa.adapters.inbound.rest.dto.OrientandoDTO;
import com.siaoa.application.ports.repository.UserRepository;
import com.siaoa.application.usecases.NotificationUseCase;
import com.siaoa.domain.entities.NotificationType;
import com.siaoa.domain.entities.User;
import com.siaoa.domain.entities.UserProfile;
import com.siaoa.infra.outbound.persistence.entities.NotificationJpaEntity;
import com.siaoa.infra.outbound.persistence.entities.OrientandoConnectionJpaEntity;
import com.siaoa.infra.outbound.persistence.repositories.NotificationJpaRepository;
import com.siaoa.infra.outbound.persistence.repositories.OrientandoConnectionJpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orientandos")
public class OrientandoController {

    private final UserRepository userRepository;
    private final NotificationUseCase notificationUseCase;
    private final OrientandoConnectionJpaRepository orientandoRepository;
    private final NotificationJpaRepository notificationJpaRepository;

    public OrientandoController(UserRepository userRepository, NotificationUseCase notificationUseCase,
                                OrientandoConnectionJpaRepository orientandoRepository,
                                NotificationJpaRepository notificationJpaRepository) {
        this.userRepository = userRepository;
        this.notificationUseCase = notificationUseCase;
        this.orientandoRepository = orientandoRepository;
        this.notificationJpaRepository = notificationJpaRepository;
    }

    @GetMapping
    public ResponseEntity<List<OrientandoDTO>> list() {
        UUID currentUserId = getCurrentUserId();

        List<OrientandoConnectionJpaEntity> connections = orientandoRepository.findAll().stream()
            .filter(c -> c.getOrientadorId().equals(currentUserId) || c.getOrientandoId().equals(currentUserId))
            .collect(Collectors.toList());

        List<OrientandoDTO> dtos = connections.stream().map(c -> {
            Optional<User> orientandoOpt = userRepository.findById(c.getOrientandoId());
            String nome = orientandoOpt.map(User::getFullName).orElse("Desconhecido");
            String email = orientandoOpt.map(User::getEmail).orElse("desconhecido");

            return new OrientandoDTO(
                c.getId(), nome, email, c.getProjeto(),
                c.getCategoria(), c.getTipoCurso(), c.getAvatarCor(), c.getAtivo(), c.getStatus(),
                c.getOrientandoId()
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody OrientandoDTO dto) {
        UUID currentUserId = getCurrentUserId();

        Optional<User> orientandoOpt = userRepository.findByEmail(dto.getEmail());
        if (orientandoOpt.isEmpty() || orientandoOpt.get().getProfile() != UserProfile.ORIENTANDO) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Usuário orientando não encontrado ou não tem o perfil adequado com o e-mail informado.");
        }

        User orientandoUser = orientandoOpt.get();

        OrientandoConnectionJpaEntity entity = new OrientandoConnectionJpaEntity(
            currentUserId,
            orientandoUser.getId(),
            dto.getProjeto(),
            dto.getCategoria(),
            dto.getTipoCurso(),
            dto.getAvatarCor(),
            true,
            "PENDENTE"
        );

        OrientandoConnectionJpaEntity saved = orientandoRepository.save(entity);

        OrientandoDTO novo = new OrientandoDTO(
            saved.getId(), dto.getNome(), dto.getEmail(), saved.getProjeto(),
            saved.getCategoria(), saved.getTipoCurso(), saved.getAvatarCor(), saved.getAtivo(), saved.getStatus(),
            saved.getOrientandoId()
        );

        Optional<User> orientadorOpt = userRepository.findById(currentUserId);
        String orientadorNome = orientadorOpt.map(User::getFullName).orElse("Orientador");
        String orientadorEmail = orientadorOpt.map(User::getEmail).orElse("");

        String mensagem = String.format(
            "Prof. %s (%s) convidou você para o projeto: %s",
            orientadorNome, orientadorEmail, dto.getProjeto()
        );

        notificationUseCase.createNotification(
            orientandoUser.getId(),
            "Novo pedido de orientação",
            mensagem,
            NotificationType.LINK_REQUEST,
            novo.getId().toString(),
            novo.getId()
        );

        return ResponseEntity.ok(novo);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrientandoDTO> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        Optional<OrientandoConnectionJpaEntity> opt = orientandoRepository.findById(id);
        if (opt.isPresent()) {
            OrientandoConnectionJpaEntity entity = opt.get();
            entity.setStatus(status);
            // Sincroniza o campo 'ativo' com base no status
            entity.setAtivo(!"DESATIVADO".equals(status));
            OrientandoConnectionJpaEntity saved = orientandoRepository.save(entity);

            Optional<User> orientandoOpt = userRepository.findById(saved.getOrientandoId());
            String nome = orientandoOpt.map(User::getFullName).orElse("Desconhecido");
            String email = orientandoOpt.map(User::getEmail).orElse("desconhecido");

            OrientandoDTO updated = new OrientandoDTO(
                saved.getId(), nome, email, saved.getProjeto(),
                saved.getCategoria(), saved.getTipoCurso(), saved.getAvatarCor(), saved.getAtivo(), saved.getStatus(),
                saved.getOrientandoId()
            );

            // Remove a notificação após o aluno responder
            List<NotificationJpaEntity> relatedNotifications = notificationJpaRepository.findByRelatedId(id);
            if (!relatedNotifications.isEmpty()) {
                notificationJpaRepository.deleteAll(relatedNotifications);
            }

            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Cancela um convite pendente: remove a conexão e apaga a notificação LINK_REQUEST do orientando.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        Optional<OrientandoConnectionJpaEntity> opt = orientandoRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Remove todas as notificações LINK_REQUEST vinculadas a este convite
        List<NotificationJpaEntity> relatedNotifications = notificationJpaRepository.findByRelatedId(id);
        notificationJpaRepository.deleteAll(relatedNotifications);

        // Remove a conexão
        orientandoRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrientandoDTO> update(@PathVariable UUID id, @RequestBody OrientandoDTO dto) {
        Optional<OrientandoConnectionJpaEntity> opt = orientandoRepository.findById(id);
        if (opt.isPresent()) {
            OrientandoConnectionJpaEntity entity = opt.get();
            entity.setProjeto(dto.getProjeto());
            entity.setCategoria(dto.getCategoria());
            entity.setTipoCurso(dto.getTipoCurso());

            OrientandoConnectionJpaEntity saved = orientandoRepository.save(entity);

            Optional<User> orientandoOpt = userRepository.findById(saved.getOrientandoId());
            String nome = orientandoOpt.map(User::getFullName).orElse("Desconhecido");
            String email = orientandoOpt.map(User::getEmail).orElse("desconhecido");

            OrientandoDTO updated = new OrientandoDTO(
                saved.getId(), nome, email, saved.getProjeto(),
                saved.getCategoria(), saved.getTipoCurso(), saved.getAvatarCor(), saved.getAtivo(), saved.getStatus(),
                saved.getOrientandoId()
            );
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
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
