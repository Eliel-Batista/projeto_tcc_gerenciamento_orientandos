-- V20__create_link_assignments_table.sql
CREATE TABLE link_assignments (
    link_id          UUID NOT NULL,
    assigned_user_id UUID NOT NULL,

    CONSTRAINT fk_link_assignments_link
        FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
    CONSTRAINT fk_link_assignments_user
        FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_link_assignments_link_id ON link_assignments(link_id);
CREATE INDEX idx_link_assignments_assigned_user_id ON link_assignments(assigned_user_id);
