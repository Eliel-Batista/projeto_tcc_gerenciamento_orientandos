-- V5__create_deliverables_table.sql

CREATE TABLE deliverables (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         UUID        NOT NULL,
    submitted_by    UUID        NOT NULL,
    file_path       VARCHAR(500),
    feedback        TEXT,
    status          VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REVISION_NEEDED')),
    submission_date TIMESTAMPTZ,
    feedback_date   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_deliverables_task
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_deliverables_submitted_by
        FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_deliverables_task_id ON deliverables(task_id);
CREATE INDEX idx_deliverables_submitted_by ON deliverables(submitted_by);
CREATE INDEX idx_deliverables_status ON deliverables(status);

CREATE TRIGGER trg_deliverables_updated_at
BEFORE UPDATE ON deliverables
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE deliverables IS 'Tabela de entregas e submissões de orientandos para tarefas';
