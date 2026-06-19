-- V11__alter_meetings_table.sql

ALTER TABLE meetings ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE meetings ADD COLUMN end_time TIMESTAMPTZ;
ALTER TABLE meetings ADD COLUMN meeting_type VARCHAR(50);
