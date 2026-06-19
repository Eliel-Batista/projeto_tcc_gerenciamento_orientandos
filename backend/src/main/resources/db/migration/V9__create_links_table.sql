-- V9__create_links_table.sql

CREATE TABLE links (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    titulo      VARCHAR(255) NOT NULL,
    link        VARCHAR(500) NOT NULL,
    autor       VARCHAR(255),
    comentario  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_links_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_links_user_id ON links(user_id);

CREATE TRIGGER trg_links_updated_at
BEFORE UPDATE ON links
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE links IS 'Tabela de links/materiais de leitura recomendados';
