-- ============================================================================
-- D35 Notes — Rich Text + Attachments Lock (MB3A)
-- ============================================================================
-- Source: Team 90 Feedback Lock (D35 Notes)
-- SSOT: TEAM_10_D35_RICH_TEXT_ATTACHMENTS_LOCK_SPEC.md (or Master Task List ref)
-- Integration: Append to PHX_DB_SCHEMA_V2.5_FULL_DDL / run as migration
-- ============================================================================
-- Rules (LOCKED):
--   Max 3 attachments per note (enforcement: app + optional trigger).
--   Max file size 1MB (1048576 bytes) per file.
--   Allowed MIME: image (jpg,png,webp), pdf, xls/xlsx, doc/docx.
--   Storage path: storage/uploads/users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}
-- ============================================================================

-- Table: user_data.note_attachments
CREATE TABLE IF NOT EXISTS user_data.note_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES user_data.notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,

    -- File metadata (storage path relative to base uploads dir)
    storage_path VARCHAR(1024) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(128) NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 1048576),

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_data.users(id)
);

CREATE INDEX idx_note_attachments_note_id ON user_data.note_attachments(note_id);
CREATE INDEX idx_note_attachments_user_id ON user_data.note_attachments(user_id);
-- Max 3 attachments per note: אכיפה באפליקציה (Backend) חובה.

COMMENT ON TABLE user_data.note_attachments IS 'D35 Notes attachments. Max 3 per note, 1MB per file. Allowed: jpg/png/webp, pdf, xls/xlsx, doc/docx. MIME validation (magic-bytes) in app.';
COMMENT ON COLUMN user_data.note_attachments.file_size_bytes IS 'Max 1048576 (1MB) per file - LOCKED';
COMMENT ON COLUMN user_data.note_attachments.storage_path IS 'Relative path: users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}';

-- Max 3 attachments per note: אכיפה באפליקציה (Backend) חובה.
