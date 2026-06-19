package com.siaoa.adapters.inbound.rest;

import com.siaoa.adapters.inbound.rest.dto.NotificationResponse;
import com.siaoa.application.usecases.NotificationUseCase;
import com.siaoa.domain.entities.Notification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class NotificationController {
    private final NotificationUseCase notificationUseCase;

    public NotificationController(NotificationUseCase notificationUseCase) {
        this.notificationUseCase = notificationUseCase;
    }

    @GetMapping("/user/notifications")
    public ResponseEntity<List<NotificationResponse>> listUserNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        List<Notification> notifications = notificationUseCase.listUserNotifications(userId);

        List<NotificationResponse> response = notifications.stream().map(n -> new NotificationResponse(
                n.getId(), n.getUserId(), n.getTitle(), n.getMessage(), n.getType(), n.getRelatedEntity(), n.getRelatedId(), n.getReadAt(), n.getCreatedAt()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable("id") UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        Notification updated = notificationUseCase.markAsRead(id, userId);

        NotificationResponse resp = new NotificationResponse(
                updated.getId(), updated.getUserId(), updated.getTitle(), updated.getMessage(), updated.getType(), updated.getRelatedEntity(), updated.getRelatedId(), updated.getReadAt(), updated.getCreatedAt()
        );

        return ResponseEntity.ok(resp);
    }
}
