-- V6__create_notifications_table.sql

CREATE TABLE notifications (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    type            VARCHAR(50) DEFAULT 'INFO' CHECK (type IN ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'REMINDER')),
    related_entity  VARCHAR(50),
    related_id      UUID,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

COMMENT ON TABLE notifications IS 'Tabela de notificações in-app para usuários';

-- V7__create_meetings_table.sql (incluída no mesmo arquivo)

CREATE TABLE meetings (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID        NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    location        VARCHAR(255),
    meeting_link    VARCHAR(500),
    status          VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')),
    created_by      UUID        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_meetings_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_meetings_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_meetings_project_id ON meetings(project_id);
CREATE INDEX idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX idx_meetings_status ON meetings(status);

CREATE TRIGGER trg_meetings_updated_at
BEFORE UPDATE ON meetings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE meetings IS 'Tabela de reuniões agendadas (agenda) com orientadores e orientandos';
