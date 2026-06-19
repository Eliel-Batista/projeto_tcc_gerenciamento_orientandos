package com.siaoa.domain.ports;

import com.siaoa.domain.entities.Notification;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository {
    Notification save(Notification notification);
    Optional<Notification> findById(UUID id);
    List<Notification> findByUserId(UUID userId);
    List<Notification> findUnreadByUserId(UUID userId);
    Notification update(Notification notification);
    void delete(UUID id);
}
