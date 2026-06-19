-- V14__add_desativado_status_to_orientando_connections.sql
-- Adiciona o valor 'DESATIVADO' à constraint CHECK da coluna status
-- na tabela orientando_connections, permitindo a desativação de orientandos.

ALTER TABLE orientando_connections
    DROP CONSTRAINT IF EXISTS orientando_connections_status_check;

ALTER TABLE orientando_connections
    ADD CONSTRAINT orientando_connections_status_check
        CHECK (status IN ('PENDENTE', 'VINCULADO', 'RECUSADO', 'DESATIVADO'));
