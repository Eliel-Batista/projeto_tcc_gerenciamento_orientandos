-- V3__create_project_orientandos_table.sql

CREATE TABLE project_orientandos (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID        NOT NULL,
    orientando_id   UUID        NOT NULL,
    role            VARCHAR(50) DEFAULT 'ORIENTANDO' CHECK (role IN ('ORIENTANDO', 'CO_ORIENTADOR')),
    added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    removed_at      TIMESTAMPTZ,

    CONSTRAINT fk_proj_orient_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_proj_orient_user
        FOREIGN KEY (orientando_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_project_orientando
        UNIQUE(project_id, orientando_id)
);

CREATE INDEX idx_project_orientandos_project_id ON project_orientandos(project_id);
CREATE INDEX idx_project_orientandos_orientando_id ON project_orientandos(orientando_id);

COMMENT ON TABLE project_orientandos IS 'Associação entre projetos e orientandos (alunos vinculados a cada projeto)';
