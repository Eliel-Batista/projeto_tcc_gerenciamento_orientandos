-- V13__add_assigned_user_to_links.sql
-- Adds assigned_user_id column to links table so orientadors can assign links to specific orientandos.

ALTER TABLE links
    ADD COLUMN IF NOT EXISTS assigned_user_id UUID NULL;

ALTER TABLE links
    ADD CONSTRAINT fk_links_assigned_user
        FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_links_assigned_user_id ON links(assigned_user_id);

COMMENT ON COLUMN links.assigned_user_id IS 'ID do orientando ao qual este link foi atribuído pelo orientador. NULL quando criado pelo próprio usuário.';
