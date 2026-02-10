# Team 50 → Team 90: תיקון Login לבדיקות Runtime — אישור

**id:** `TEAM_50_TO_TEAM_90_LOGIN_FIX_CONFIRMATION`  
**to:** Team 90 (The Spy)  
**date:** 2026-02-08  
**context:** תגובה ל־תקלה בבדיקות Runtime (Login Token)

---

## סיכום התיקון

הבדיקות השתמשו ב־credentials שלא תואמים ל־seed הרשמי של הפרויקט. עודכן כך שיתאימו למשתמש שנוצר ב־`scripts/create-admin.sh` / `api/scripts/create_admin_user.py`.

---

## מה שונה

### 1. `tests/phase2-runtime.test.js`

**לפני:**
```javascript
const TEST_USER = { username_or_email: 'TikTrackAdmin', password: '4181' };
```

**אחרי:**
```javascript
const TEST_USER = {
  username_or_email: process.env.PHASE2_TEST_USERNAME || 'admin',
  password: process.env.PHASE2_TEST_PASSWORD || '418141'
};
```

### 2. `tests/selenium-config.js`

**לפני:**  
`admin: { username: 'TikTrackAdmin', password: '4181', ... }`

**אחרי:**  
`admin: { username: process.env.PHASE2_TEST_USERNAME || 'admin', password: process.env.PHASE2_TEST_PASSWORD || '418141', ... }`

---

## פרטי משתמש תקינים (ברירת מחדל)

| שדה | ערך |
|-----|-----|
| **username** | `admin` |
| **password** | `418141` |
| **email** | admin@tiktrack.com |

משתמש זה נוצר על ידי:
- `./scripts/create-admin.sh` (מהשורש)
- או `python api/scripts/create_admin_user.py` (מתוך `api/`)

---

## Override לפי סביבה

אם ב־DB יש משתמש אחר, אפשר להגדיר:

```bash
export PHASE2_TEST_USERNAME=YourUsername
export PHASE2_TEST_PASSWORD=YourPassword
npm run test:phase2
```

אותו דבר חל על E2E (אותו config).

---

## האם נדרש seed/DB reset?

- **אם רצתם כבר `./scripts/create-admin.sh`** — המשתמש `admin` / `418141` אמור להיות קיים; אין צורך ב־reset, רק להריץ שוב את הבדיקות.
- **אם לא רצתם create-admin** — יש להריץ פעם אחת:
  ```bash
  ./scripts/create-admin.sh
  ```
  (מהשורש של הפרויקט, עם Backend/DB זמינים)

---

## אימות

- שמות השדות ל־login נשארו **username_or_email** ו־**password** (תואם ל־API).
- ברירת המחדל תואמת את `api/scripts/create_admin_user.py`: ADMIN_USERNAME = "admin", ADMIN_PASSWORD = "418141".

---

**Team 50 (QA & Fidelity)**  
**log_entry | GATE_B | LOGIN_FIX_CONFIRMATION | 2026-02-08**
