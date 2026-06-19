-- V17__add_cancelado_to_meeting_invites_status.sql
-- Adiciona o status CANCELADO à tabela meeting_invites.
-- Usado quando um orientando que já aceitou a reunião decide cancelar a participação.

ALTER TABLE meeting_invites DROP CONSTRAINT IF EXISTS meeting_invites_status_check;

ALTER TABLE meeting_invites
    ADD CONSTRAINT meeting_invites_status_check
    CHECK (status IN ('PENDENTE', 'ACEITO', 'RECUSADO', 'CANCELADO'));
