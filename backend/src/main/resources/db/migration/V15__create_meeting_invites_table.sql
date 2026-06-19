-- V15__create_meeting_invites_table.sql
-- Tabela que armazena convites de reunião enviados pelo orientador ao orientando.
-- O orientando pode aceitar ou recusar (com motivo obrigatório em caso de recusa).

CREATE TABLE meeting_invites (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id      UUID        NOT NULL,
    orientador_id   UUID        NOT NULL,
    orientando_id   UUID        NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDENTE'
                    CHECK (status IN ('PENDENTE', 'ACEITO', 'RECUSADO')),
    motivo_recusa   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_invite_meeting
        FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    CONSTRAINT fk_invite_orientador
        FOREIGN KEY (orientador_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_invite_orientando
        FOREIGN KEY (orientando_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_meeting_orientando
        UNIQUE(meeting_id, orientando_id)
);

CREATE INDEX idx_meeting_invites_meeting_id   ON meeting_invites(meeting_id);
CREATE INDEX idx_meeting_invites_orientando_id ON meeting_invites(orientando_id);
CREATE INDEX idx_meeting_invites_status        ON meeting_invites(status);

CREATE TRIGGER trg_meeting_invites_updated_at
BEFORE UPDATE ON meeting_invites
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE meeting_invites IS 'Convites de reunião enviados pelo orientador para o(s) orientando(s).';
