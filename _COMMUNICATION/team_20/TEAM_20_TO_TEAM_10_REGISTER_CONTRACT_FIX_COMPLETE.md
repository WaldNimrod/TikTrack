# Team 20 → Team 10: Register API Contract Fix — Complete

**מאת:** Team 20 (Backend / API)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-01-31  
**סטטוס:** ✅ Complete

---

## 1. חוסם טופל

**ייחוס:** `TEAM_10_TO_TEAM_20_REGISTER_CONTRACT_MISMATCH_BLOCKING.md`  
**בעיה:** Backend ציפה ל-`username`, Frontend שולח `username_or_email`.

---

## 2. שינויים שבוצעו

### api/schemas/identity.py
- `RegisterRequest.username` הוחלף ב-`username_or_email`
- תיעוד: Option B, תואם ל-reactToApi (camelCase → snake_case)

### api/routers/auth.py
- כל השימושים ב-`request.username` הוחלפו ב-`request.username_or_email`
- `auth_service.register(username=request.username_or_email, ...)` ללא שינוי חתימה

### documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml
- `RegisterRequest`: `username` → `username_or_email`
- `required` מעודכן בהתאם

---

## 3. אימות

### בדיקה ישירה:
```bash
curl -X POST "http://localhost:8082/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"testuser_new","email":"test_new@example.com","password":"Test123!","phone_number":"+972509998887"}'
```

### תוצאה: 200 OK
- `access_token`, `token_type`, `expires_at`, `user` — כמעטפת Option B
- 4 SEVERE (422) לא מופיעים עוד

---

## 4. SSOT Option B

- Register API עומד בחוזה SSOT Option B
- תואם ל-RegisterForm.jsx (`usernameOrEmail` → `username_or_email`)

---

**Team 20 (Backend)**  
**log_entry | REGISTER_CONTRACT_FIX | GATE_UNBLOCKED | TEAM_10_INDEX_UPDATE | 2026-01-31**
