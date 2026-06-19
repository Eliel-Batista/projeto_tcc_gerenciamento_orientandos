-- V8__add_link_request_to_notifications.sql

ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'REMINDER', 'LINK_REQUEST'));
