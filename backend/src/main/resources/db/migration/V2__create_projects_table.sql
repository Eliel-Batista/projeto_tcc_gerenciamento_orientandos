-- V2__create_projects_table.sql

CREATE TABLE projects (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    orientador_id   UUID        NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    project_type    VARCHAR(50) NOT NULL CHECK (project_type IN ('TCC', 'INICIACAO_CIENTIFICA', 'MESTRADO', 'DOUTORADO', 'ESTAGIO_SUPERVISIONADO')),
    start_date      DATE,
    end_date        DATE,
    status          VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_projects_orientador
        FOREIGN KEY (orientador_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_orientador_id ON projects(orientador_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(project_type);

CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE projects IS 'Tabela de projetos de orientação (TCC, iniciação científica, mestrado, etc.)';
