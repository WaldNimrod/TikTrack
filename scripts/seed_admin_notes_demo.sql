-- Seed 2 demo notes for TikTrackAdmin (Team 60)
-- Note 1: with attachment, linked to trading account
-- Note 2: without attachment, linked to ticker AAPL

DO $$
DECLARE
  v_admin_id UUID := '83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29';
  v_account_id UUID := '813d675d-abf2-41b1-92d1-88dc68060071';
  v_aapl_id UUID := 'c81bd74a-86a6-43b1-bb82-8e61886aea64';
  v_note1_id UUID;
  v_att_id UUID;
  v_storage_path TEXT;
BEGIN
  -- Note 1: linked to trading account (עם קובץ — יוסף attachment אחרי)
  INSERT INTO user_data.notes (user_id, parent_type, parent_id, title, content, category, is_pinned, created_by, updated_by)
  VALUES (
    v_admin_id, 'account', v_account_id,
    'הערת דוגמה — חשבון מסחר',
    'הערה מקושרת לחשבון מסחר. דוגמה לטקסט עשיר.',
    'GENERAL', false, v_admin_id, v_admin_id
  )
  RETURNING id INTO v_note1_id;

  -- Attachment for Note 1 (קובץ דוגמה — placeholder)
  v_att_id := gen_random_uuid();
  v_storage_path := 'users/' || v_admin_id::text || '/notes/' || v_note1_id::text || '/' || v_att_id::text || '_demo_note.txt';
  INSERT INTO user_data.note_attachments (id, note_id, user_id, storage_path, original_filename, content_type, file_size_bytes, created_by)
  VALUES (v_att_id, v_note1_id, v_admin_id, v_storage_path, 'demo_note.txt', 'text/plain', 24, v_admin_id);

  -- Note 2: linked to ticker AAPL (בלי קובץ)
  INSERT INTO user_data.notes (user_id, parent_type, parent_id, title, content, category, is_pinned, created_by, updated_by)
  VALUES (
    v_admin_id, 'ticker', v_aapl_id,
    'הערת דוגמה — AAPL',
    'הערה מקושרת לטיקר Apple. ללא קבצים מצורפים.',
    'GENERAL', false, v_admin_id, v_admin_id
  );
END $$;
