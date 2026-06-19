-- V10__create_orientando_connections_table.sql

CREATE TABLE orientando_connections (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    orientador_id   UUID        NOT NULL,
    orientando_id   UUID        NOT NULL,
    projeto         VARCHAR(255),
    categoria       VARCHAR(255),
    tipo_curso      VARCHAR(255),
    avatar_cor      VARCHAR(50),
    ativo           BOOLEAN     DEFAULT true,
    status          VARCHAR(50) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'VINCULADO', 'RECUSADO')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_conn_orientador
        FOREIGN KEY (orientador_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_conn_orientando
        FOREIGN KEY (orientando_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_orientador_orientando
        UNIQUE(orientador_id, orientando_id)
);

CREATE INDEX idx_orientando_connections_orientador_id ON orientando_connections(orientador_id);
CREATE INDEX idx_orientando_connections_orientando_id ON orientando_connections(orientando_id);

CREATE TRIGGER trg_orientando_connections_updated_at
BEFORE UPDATE ON orientando_connections
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE orientando_connections IS 'Tabela que armazena os vínculos e convites entre Orientador e Orientando (substitui mockup)';
