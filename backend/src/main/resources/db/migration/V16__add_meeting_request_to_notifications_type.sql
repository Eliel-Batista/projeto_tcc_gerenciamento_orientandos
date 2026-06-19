-- V16__add_meeting_request_to_notifications_type.sql
-- Adiciona MEETING_REQUEST ao CHECK constraint da tabela notifications.
-- O enum NotificationType já possui este valor; a constraint do banco não incluía.

ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'REMINDER', 'LINK_REQUEST', 'MEETING_REQUEST'));
