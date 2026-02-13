# Team 10 → Team 20: חוסם — Register API לא עודכן ל-SSOT Option B

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend / API)  
**תאריך:** 2026-01-31  
**סטטוס:** 🚫 **חוסם — אין מעבר שער עד תיקון**

---

## 1. הבעיה

למרות שהתיקונים ב-RegisterForm.jsx הושלמו, עדיין יש 4 SEVERE errors (422) ב-Gate A.

**בדיקת API ישירה:**
```bash
curl -X POST "http://localhost:8082/api/v1/auth/register" \
  -d '{"username_or_email":"test","email":"test@example.com","password":"Test123!","phone_number":"+972501234567"}'
```

**תגובת שרת:** `{"detail":[{"type":"missing","loc":["body","username"],"msg":"Field required"}]`

---

## 2. ניתוח

### ✅ Frontend תוקן נכון:
- RegisterForm.jsx שולח `usernameOrEmail` → `username_or_email` (באמצעות reactToApi)
- טלפון מנורמל ל-E.164

### ❌ Backend לא עודכן:
- שרת עדיין מצפה ל-`username` (לא `username_or_email`)
- חוזה API לא עומד ב-SSOT Option B

---

## 3. דרישת תיקון דחופה

### Team 20 — עדכן Register API:

1. **שנה את הפרמטר מ-`username` ל-`username_or_email`** ב-register endpoint
2. **עדכן את OpenAPI schema** — `TEAM_20_TO_TEAM_10_AUTH_CONTRACT_OPTION_B_COMPLETE.md`
3. **וודא תאימות** ל-SSOT Option B (כל auth endpoints עוברים דרך Shared_Services)

### קוד לעדכון (api/schemas/identity.py):
```python
# לפני
username: str = Field(..., description="Username")

# אחרי  
username_or_email: str = Field(..., description="Username or email address")
```

---

## 4. השפעה

**בלי התיקון:** 4 SEVERE נשארים → אין מעבר שער  
**אחרי התיקון:** 0 SEVERE → אפשרות לאשר מעבר שער

---

**Team 10 (The Gateway)**  
**log_entry | REGISTER_CONTRACT_MISMATCH | BLOCKING_GATE | TEAM_20_FIX_NEEDED | 2026-01-31**
