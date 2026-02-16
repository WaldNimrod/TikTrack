#!/bin/bash
# Notes D35 — Gate-A API verification (Rich Text + Attachments)
# Team 50 — TEAM_10_TO_TEAM_50_D35_RICH_TEXT_ATTACHMENTS_MANDATE
# Tests: 413 (>1MB), 415 (MIME), 422 (quota 4th file), 404, XSS sanitization

set -e
BACKEND="${BACKEND_URL:-http://127.0.0.1:8082}"
ADMIN_USER="${QA_USER:-TikTrackAdmin}"
ADMIN_PASS="${QA_PASS:-4181}"
TMPDIR="${TMPDIR:-/tmp}"
OUT="/tmp/notes_qa_$$"

echo "=== Notes D35 QA — Gate-A API ==="
echo "Backend: $BACKEND"

# Prepare temp files
mkdir -p "$OUT"
# Valid minimal JPEG (magic \xff\xd8\xff)
printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00' > "$OUT/valid.jpg"
# Fake EXE (MZ header — not in D35 allowed MIME)
printf 'MZ\x90\x00' > "$OUT/fake.exe"
# Oversized (>1MB) — 1MB + 1 byte
python3 -c "open('$OUT/oversized.bin','wb').write(b'X'*1048577)"

# 1. Admin Login
ADMIN_TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Admin Login failed"
  rm -rf "$OUT"
  exit 1
fi
echo "✅ Admin Login OK"

# 2. Create note
NOTE_RESP=$(curl -s -X POST "$BACKEND/api/v1/notes" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"parent_type":"general","content":"<p>Test note for D35 QA</p>","category":"GENERAL"}')
NOTE_ID=$(echo "$NOTE_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")

if [ -z "$NOTE_ID" ]; then
  echo "❌ Create note failed"
  echo "$NOTE_RESP" | head -c 300
  rm -rf "$OUT"
  exit 1
fi
echo "✅ POST /notes → 201 (note_id=$NOTE_ID)"

# 3. Upload valid attachment — 201
CODE=$(curl -s -o "$OUT/up1.json" -w "%{http_code}" -X POST "$BACKEND/api/v1/notes/$NOTE_ID/attachments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@$OUT/valid.jpg;type=image/jpeg")
[ "$CODE" = "201" ] && echo "✅ POST attachment (valid JPEG) → 201" || echo "⚠️ Valid upload → $CODE (expected 201)"

# 4. Upload 2nd valid
CODE=$(curl -s -o "$OUT/up2.json" -w "%{http_code}" -X POST "$BACKEND/api/v1/notes/$NOTE_ID/attachments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@$OUT/valid.jpg;type=image/jpeg")
[ "$CODE" = "201" ] && echo "✅ POST attachment 2 → 201" || echo "⚠️ Upload 2 → $CODE"

# 5. Upload 3rd valid
CODE=$(curl -s -o "$OUT/up3.json" -w "%{http_code}" -X POST "$BACKEND/api/v1/notes/$NOTE_ID/attachments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@$OUT/valid.jpg;type=image/jpeg")
[ "$CODE" = "201" ] && echo "✅ POST attachment 3 → 201" || echo "⚠️ Upload 3 → $CODE"

# 6. Upload 4th — 422 (quota)
CODE=$(curl -s -o "$OUT/up4.json" -w "%{http_code}" -X POST "$BACKEND/api/v1/notes/$NOTE_ID/attachments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@$OUT/valid.jpg;type=image/jpeg")
[ "$CODE" = "422" ] && echo "✅ POST attachment 4 (quota) → 422" || echo "⚠️ Quota 4th → $CODE (expected 422)"

# 7. Upload oversized — 413
CODE=$(curl -s -o "$OUT/up5.json" -w "%{http_code}" -X POST "$BACKEND/api/v1/notes/$NOTE_ID/attachments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@$OUT/oversized.bin;type=application/octet-stream")
[ "$CODE" = "413" ] && echo "✅ POST attachment (>1MB) → 413" || echo "⚠️ Oversized → $CODE (expected 413)"

# 8. Upload fake EXE (MIME magic) — 415
CODE=$(curl -s -o "$OUT/up6.json" -w "%{http_code}" -X POST "$BACKEND/api/v1/notes/$NOTE_ID/attachments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@$OUT/fake.exe;type=image/jpeg")
[ "$CODE" = "415" ] && echo "✅ POST attachment (fake EXE/MIME) → 415" || echo "⚠️ Fake MIME → $CODE (expected 415)"

# 9. GET non-existent note — 404
FAKE_UUID="00000000-0000-0000-0000-000000000001"
CODE=$(curl -s -o "$OUT/get404.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/notes/$FAKE_UUID")
[ "$CODE" = "404" ] && echo "✅ GET /notes/{fake} → 404" || echo "⚠️ GET 404 → $CODE (expected 404)"

# 10. XSS sanitization — POST note with script, verify response has no <script>
XSS_RESP=$(curl -s -X POST "$BACKEND/api/v1/notes" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"parent_type":"general","content":"<p>OK</p><script>alert(1)</script>","category":"GENERAL"}')
if echo "$XSS_RESP" | grep -q '<script>'; then
  echo "⚠️ XSS sanitization — <script> present in response (expected removed)"
else
  echo "✅ XSS sanitization — <script> removed from content"
fi

# Cleanup
rm -rf "$OUT"

echo "=== Notes D35 API QA Done ==="
