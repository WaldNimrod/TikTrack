-- ============================================================================
-- D35 Notes — Rich Text + Attachments (MB3A)
-- ============================================================================
-- Source: PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql
-- Mandate: TEAM_10_TO_TEAM_60_D35_RICH_TEXT_ATTACHMENTS_MANDATE
-- Max 3 attachments/note; 1MB/file; trigger + Backend enforcement
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS user_data;

CREATE TABLE IF NOT EXISTS user_data.note_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES user_data.notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,

    storage_path VARCHAR(1024) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(128) NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 1048576),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_data.users(id)
);

CREATE INDEX IF NOT EXISTS idx_note_attachments_note_id ON user_data.note_attachments(note_id);
CREATE INDEX IF NOT EXISTS idx_note_attachments_user_id ON user_data.note_attachments(user_id);

CREATE OR REPLACE FUNCTION user_data.check_note_attachment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM user_data.note_attachments WHERE note_id = NEW.note_id) >= 3 THEN
    RAISE EXCEPTION 'Max 3 attachments per note (D35 lock)' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_note_attachments_max_3 ON user_data.note_attachments;
CREATE TRIGGER tr_note_attachments_max_3
  BEFORE INSERT ON user_data.note_attachments
  FOR EACH ROW EXECUTE FUNCTION user_data.check_note_attachment_count();

COMMENT ON TABLE user_data.note_attachments IS 'D35 Notes attachments. Max 3 per note (trigger), 1MB per file. Allowed: jpg/png/webp, pdf, xls/xlsx, doc/docx. MIME validation (magic-bytes) in app.';
