-- V18__add_meeting_cancelled_to_notifications_type.sql
-- Adiciona MEETING_CANCELLED ao CHECK constraint da tabela notifications.

ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'REMINDER', 'LINK_REQUEST', 'MEETING_REQUEST', 'MEETING_CANCELLED'));
