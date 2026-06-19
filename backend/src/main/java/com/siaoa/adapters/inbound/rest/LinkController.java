package com.siaoa.adapters.inbound.rest;

import com.siaoa.adapters.inbound.rest.dto.LinkDTO;
import com.siaoa.application.ports.repository.UserRepository;
import com.siaoa.application.usecases.NotificationUseCase;
import com.siaoa.domain.entities.NotificationType;
import com.siaoa.domain.entities.User;
import com.siaoa.infra.outbound.persistence.entities.LinkJpaEntity;
import com.siaoa.infra.outbound.persistence.repositories.LinkJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Collections;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/links")
public class LinkController {

    private final LinkJpaRepository linkRepository;
    private final NotificationUseCase notificationUseCase;
    private final UserRepository userRepository;

    public LinkController(LinkJpaRepository linkRepository,
                          NotificationUseCase notificationUseCase,
                          UserRepository userRepository) {
        this.linkRepository = linkRepository;
        this.notificationUseCase = notificationUseCase;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<LinkDTO>> list() {
        UUID currentUserId = getCurrentUserId();
        // Return links where the current user is the creator OR the assigned user
        List<LinkDTO> dtoList = linkRepository.findAll().stream()
                .filter(entity ->
                    entity.getUserId().equals(currentUserId) ||
                    (entity.getAssignedUserIds() != null && entity.getAssignedUserIds().contains(currentUserId))
                )
                .map(entity -> new LinkDTO(
                        entity.getId(),
                        entity.getTitulo(),
                        entity.getLink(),
                        entity.getAutor(),
                        entity.getComentario(),
                        entity.getUserId().equals(currentUserId),
                        entity.getAssignedUserIds()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping
    public ResponseEntity<LinkDTO> create(@RequestBody LinkDTO dto) {
        UUID currentUserId = getCurrentUserId();
        
        List<UUID> targetUserIds = dto.getAssignedUserIds();
        if (targetUserIds == null) {
            targetUserIds = Collections.emptyList();
        }

        LinkJpaEntity entity = new LinkJpaEntity(
                currentUserId,
                targetUserIds,
                dto.getTitulo(),
                dto.getLink(),
                dto.getAutor(),
                dto.getComentario()
        );
        LinkJpaEntity saved = linkRepository.save(entity);

        // Send notification to the assigned orientandos
        if (saved.getAssignedUserIds() != null) {
            Optional<User> orientador = userRepository.findById(currentUserId);
            String orientadorNome = orientador.map(User::getFullName).orElse("Seu orientador");
            String tituloLink = saved.getTitulo() != null && !saved.getTitulo().isBlank()
                    ? saved.getTitulo()
                    : saved.getLink();

            for (UUID targetId : saved.getAssignedUserIds()) {
                if (targetId != null) {
                    notificationUseCase.createNotification(
                            targetId,
                            "Novo link recomendado",
                            orientadorNome + " recomendou um novo link para você: " + tituloLink,
                            NotificationType.INFO,
                            "link",
                            saved.getId()
                    );
                }
            }
        }

        LinkDTO novo = new LinkDTO(
            saved.getId(), saved.getTitulo(), saved.getLink(), saved.getAutor(), saved.getComentario(), true, saved.getAssignedUserIds()
        );
        return ResponseEntity.ok(novo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        linkRepository.deleteById(id);
        return ResponseEntity.noContent().build();
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
