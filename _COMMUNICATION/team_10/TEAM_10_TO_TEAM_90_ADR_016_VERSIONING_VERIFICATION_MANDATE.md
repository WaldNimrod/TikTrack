# Team 10 → Team 90: מנדט בדיקת תאימות גרסאות (ADR-016)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 90 (The Spy)  
**תאריך:** 2026-01-30  
**נושא:** ADR-016 — אימות תאימות גרסאות לכל השכבות — **בדיקה בלבד (ללא כתיבת קוד)**

---

## 1. מנדט

Team 90 מתבקש לבצע **בדיקת תאימות גרסאות** לפי נוהל ADR-016:

- **מטרה:** לוודא שכל השכבות (API, DB, UI, Routes) עומדות ב-**חוק ה-Ceiling** — אף שכבה לא מעל ה-Major של System Version (SV). כרגיל **SV = 1.0.0** → Ceiling **1.x.x**.
- **היקף:** אימות מול [TT2_VERSION_MATRIX.md](../../documentation/10-POLICIES/TT2_VERSION_MATRIX.md) ומול מיקומי הגרסאות בקוד (כמפורט בנוהל המימוש).
- **תוצר:** דוח קצר — סטטוס כל שכבה (Aligned / PENDING BUMP), והמלצות אם יש פער (ללא ביצוע שינוי קוד על ידי Team 90).

---

## 2. נוהל ומיקומים

- **נוהל מימוש (מיקומי גרסאות):** [TT2_VERSIONING_PROCEDURE.md](../../documentation/05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md)  
- **מטריצה:** [TT2_VERSION_MATRIX.md](../../documentation/10-POLICIES/TT2_VERSION_MATRIX.md)  
- **מיקומים בקוד (תמצית):**  
  - API: `api/__init__.py` — `__version__`  
  - UI: `ui/package.json` — `"version"`  
  - Routes: `ui/public/routes.json` — `"version"`  
  - DB: גרסה בתיעוד DDL (למשל 2.5).

---

## 3. הגבלה

**לא נדרש ולא מותר:** כתיבת קוד או עדכון גרסאות בשם ADR-016 על ידי Team 90.  
**נדרש:** אימות, רישום ממצאים, דיווח ל-Team 10 (ולג-Lead בהתאם לצורך).

---

## 4. דיווח

לאחר הבדיקה — דוח קצר ל-Team 10 (למשל מסמך ב-`_COMMUNICATION/team_90/` עם סטטוס שכבות והמלצות). עדכון מטריצה רשמי יבוצע על ידי Team 10 / G-Lead לפי הממצאים.

---

**log_entry | TEAM_10 | ADR_016_VERSIONING_VERIFICATION_MANDATE | TEAM_90 | 2026-01-30**
