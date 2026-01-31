# 🚀 חבילת אונבורדינג: צוות 20 (Backend) | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Authentication & Identity  
**Status:** 🟢 **ACTIVE - PHASE 1 READY**

---

## 🎯 הגדרת תפקיד

**צוות 20 (Backend):** מימוש FastAPI בהתאמה ל-LOD 400 SQL.

**אחריות:**
- מימוש כל שכבת ה-Backend (DB, Models, Services, Routes)
- התאמה מלאה ל-SQL Schema המאסטר
- יצירת OpenAPI Spec מפורט
- אבטחה: Encryption, JWT, Password Hashing

---

## 📚 מסמכי חובה (Mandatory Reading)

**עליכם לקרוא ולשלוט במלואם לפני תחילת עבודה:**

1. **📖 PHOENIX_MASTER_BIBLE.md**
   - מיקום: `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/PHOENIX_MASTER_BIBLE.md`
   - חוקי הברזל, פרוטוקול כניסה, היררכיית סמכויות

2. **⚔️ CURSOR_INTERNAL_PLAYBOOK.md**
   - מיקום: `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md`
   - נהלי עבודה, פורמט דיווח, ארגון קבצים

3. **🗂️ D15_SYSTEM_INDEX.md**
   - מיקום: `documentation/D15_SYSTEM_INDEX.md`
   - אינדקס כל התיעוד, מבנה התיקיות

4. **📋 PHASE_1_TASK_BREAKDOWN.md**
   - מיקום: `documentation/05-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md`
   - תוכנית עבודה מפורטת עם כל המשימות שלכם

---

## 🛡️ חוקי ברזל לביצוע (Immutable Laws)

1. **Zero Invention:** אין להמציא שדות או לוגיקה. חסר מידע? פנה לצוות 10 לבקשת GIN.
2. **Plural Standard:** שמות רבים בלבד לכל הישויות (users, trades, api_keys).
3. **Identity Policy:** שימוש ב-ULID בלבד למזהים חיצוניים (⚠️ נדרש clarification על UUID→ULID mapping).
4. **Precision:** דיוק Decimal(20,8) לכל ערך כספי.
5. **Contract First:** הגדרת Pydantic Models לפני כתיבת Routes.
6. **Async Only:** שימוש מלא ב-FastAPI Async/Await.
7. **LOD 400 Compliance:** כל הקוד חייב להתאים ל-SQL Schema המאסטר.

---

## 📋 משימות לשלב הראשון (Phase 1)

### ✅ שלב 1 - יכול להתחיל עכשיו:

#### משימה 20.1.1: הקמת תשתית DB
**עדיפות:** P0 (Critical Path)  
**זמן משוער:** 4 שעות

**תת-משימות:**
- [ ] וידוא שהטבלאות `users`, `password_reset_requests`, `user_api_keys` קיימות ב-DB
- [ ] הרצת migration scripts אם נדרש (מ-GIN_004)
- [ ] וידוא indexes קיימים (email, username, phone_number, reset_token)
- [ ] בדיקת constraints (unique, check, foreign keys)

**תוצר:** DB Schema מוכן ומוכשר  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

#### משימה 20.1.4: מימוש Encryption Service
**עדיפות:** P0  
**זמן משוער:** 2 שעות

**תת-משימות:**
- [ ] בחירת library (cryptography.fernet מומלץ)
- [ ] יצירת `EncryptionService` class
- [ ] `encrypt_api_key(plain_key: str) -> str`
- [ ] `decrypt_api_key(encrypted_key: str) -> str`
- [ ] הגדרת environment variable ל-encryption key
- [ ] תיעוד key rotation strategy

**תוצר:** `services/encryption.py`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

### ⏸️ שלב 2 - ממתין ל-clarification:

#### משימה 20.1.2: הגדרת SQLAlchemy Models
**עדיפות:** P0  
**סטטוס:** ⚠️ **BLOCKED** - ממתין לתשובה על שאלה 1 (UUID vs ULID)

**תלוי ב:** Clarification על אסטרטגיית מזהים

---

#### משימה 20.1.5: מימוש Authentication Service
**עדיפות:** P0  
**סטטוס:** ⚠️ **BLOCKED** - ממתין לתשובה על שאלה 2 (JWT Structure)

**תלוי ב:** Clarification על מבנה JWT payload

---

### 📝 שאלות פתוחות שדורשות תשובה:

1. **שאלה 1:** האם UUID ב-DB צריך להיות מומר ל-ULID ב-API, או שיש שדה נפרד `external_ulid`?
2. **שאלה 2:** מה המבנה המדויק של ה-JWT payload? (claims, expiration, refresh token?)

**פעולה נדרשת:** להמתין לתשובות לפני התחלת משימות 20.1.2 ו-20.1.5

---

## 🔍 Deep Scan נדרש

**לפני תחילת עבודה, עליכם לבצע:**

1. **סריקת SQL Schema:**
   - `documentation/04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
   - התמקדות בטבלאות: `users`, `password_reset_requests`, `user_api_keys`

2. **סריקת OpenAPI Spec:**
   - `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`
   - זיהוי endpoints חסרים שצריך להוסיף

3. **סריקת UI Blueprints:**
   - `documentation/03-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md`
   - הבנת דרישות UI ל-D24 ו-D25

---

## 📡 תקשורת ודיווח

### דיווח EOD (End of Day):
כל יום בסיום העבודה, שלחו לצוות 10 סיכום:
- מה הושלם היום
- מה מתוכנן למחר
- חסמים או שאלות

### שאלות:
- כל שאלה מבנית → דרך צוות 10 בלבד
- שאלות לוגיקה → Gemini Bridge (דרך צוות 10)
- שאלות UI/UX → נמרוד ולד (דרך צוות 10)

---

## ✅ פרוטוקול "אני מוכן"

**לאחר השלמת הלימוד והסריקה, שלחו הודעה בפורמט הבא:**

```text
From: Team 20
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of Backend context and SQL Schema.
Context Check: PHX_DB_SCHEMA_V2.5_FULL_DDL.sql, OPENAPI_SPEC_V2_FINAL.yaml
Next: Ready to start Phase 1 tasks (20.1.1, 20.1.4).
log_entry | [Team 20] | READY | 001 | GREEN
```

---

## 🎯 צעדים הבאים

1. **עכשיו:** התחילו עם משימות 20.1.1 ו-20.1.4
2. **במקביל:** המתינו ל-clarification על שאלות 1 ו-2
3. **לאחר clarification:** המשיכו עם כל שאר המשימות

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** 🟢 READY FOR ACTIVATION  
**Next:** Awaiting READINESS_DECLARATION from Team 20
