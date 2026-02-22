# תוכנית עבודה — Mini-Batch 3A (Notes → Alerts)
**project_domain:** TIKTRACK

**id:** TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN  
**owner:** Team 10 (The Gateway)  
**מקור מנדט:** [TEAM_90_TO_TEAM_10_MINI_BATCH_NOTES_ALERTS_MANDATE.md](../team_90/TEAM_90_TO_TEAM_10_MINI_BATCH_NOTES_ALERTS_MANDATE.md)  
**סטטוס:** MB3A Notes CLOSED; MB3A Alerts CLOSED (Gate-B PASS + Gate-KP 2026-02-16). Mini-Batch 3A הושלם.  
**last_updated:** 2026-02-16

---

## 1. סדר ביצוע והתניה

1. **notes.html** (D35 הערות) — **ראשון**; חייב להגיע לסגירת שער (Gate-KP) לפני התחלת Alerts.
2. **alerts.html** (D34 התראות) — **שני**; אין משלוח/ביצוע Alerts במקביל לפני ש-Notes במצב סגירת שער.

**מקור החלטות אדריכלית (SSOT):** `_COMMUNICATION/_Architects_Decisions/` — לא תיבת התקשורת.

---

## 2. שרשרת שערים לכל עמוד

לכל אחד מהעמודים (Notes, Alerts) חלה שרשרת שערים חובה:

| שער | שם | בעלים | תוצר מצופה | תנאי כניסה | תנאי יציאה | Evidence / סגירה |
|-----|-----|--------|-------------|------------|------------|-------------------|
| **Gate-0** | Scope/SSOT mapping lock | Team 10 + Team 31 | סקופ ו-SSOT נעולים; מיפוי ל-Page Tracker/SSOT | מנדט מאושר | SSOT מעודכן; אין שינוי סקופ בלי G-Lead | **תוצרי Scope lock (מחייב):** Notes: `_COMMUNICATION/team_10/TEAM_10_MB3A_NOTES_SCOPE_LOCK.md`; Alerts: `_COMMUNICATION/team_10/TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md`. Evidence path: עדכון `documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md` + Page Tracker. |
| **Gate-A** | QA validation | Team 50 | דוח QA; ריצות אימות | Gate-0 סגור; קוד/UI מוכן | PASS מדוח QA; אין SEVERE פתוח | TEAM_50_TO_TEAM_10_*_QA_REPORT; **Seal (SOP-013) חובה** לסגירה |
| **Gate-B** | Spy verification | Team 90 | אימות יושרה/תאימות | Gate-A PASS | Gate-B PASS מאושר | הודעת 90 ל-10; **Seal (SOP-013) חובה** — ללא "אם נדרש". דוח בלבד לא מספיק. |
| **Gate-KP** | Knowledge Promotion + cleanup | Team 10 | קידום ידע ל-documentation; ארכיון תקשורת; ניקוי קבצים זמניים | Gate-B PASS | נוהל קידום ידע הושלם; תיקיות לפי רשימת KEEP | CONSOLIDATION_*; ARCHIVE_MANIFEST; אי-געת ב-_Architects_Decisions |

**SOP-013:** סגירת כל שער (מעבר ל־"סגור") — **רק** עם הודעת Seal (Task Seal Message). דוח בלבד לא מספיק.

---

## 3. פירוט לפי שלב — Notes (notes.html)

| שלב | צוותים | פעולה | תלות | Evidence נדרש |
|-----|--------|--------|------|----------------|
| Gate-0 Notes | 10, 31 | נעילת סקופ/SSOT ל-D35; עדכון Page Tracker אם נדרש | — | TEAM_10_MB3A_NOTES_SCOPE_LOCK.md; עדכון TT2_PAGES_SSOT + Page Tracker |
| Build Notes | 31 → 30/40 | Blueprint/ממשק לפי SSOT; מסירה ל-30/40 | Gate-0 Notes | תוצרי 31; אינטגרציה 30/40 |
| Gate-A Notes | 50 | QA — ריצות, דוח | Build מוכן | TEAM_50_TO_TEAM_10_*_NOTES_QA_REPORT; Seal |
| Gate-B Notes | 90 | Spy verification | Gate-A PASS | Seal (SOP-013) חובה; אישור 90 |
| Gate-KP Notes | 10 | קידום ידע + ארכיון + ניקוי | Gate-B PASS | Consolidation; ARCHIVE_MANIFEST |

---

## 4. פירוט לפי שלב — Alerts (alerts.html)

| שלב | צוותים | פעולה | תלות | Evidence נדרש |
|-----|--------|--------|------|----------------|
| Gate-0 Alerts | 10, 31 | נעילת סקופ/SSOT ל-D34 | **Notes הגיע ל-Gate-KP (סגור)** | TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md; עדכון TT2_PAGES_SSOT + Page Tracker |
| Build Alerts | 31 → 30/40 | Blueprint/ממשק לפי SSOT | Gate-0 Alerts | תוצרי 31; אינטגרציה 30/40 |
| Gate-A Alerts | 50 | QA — ריצות, דוח | Build מוכן | TEAM_50_TO_TEAM_10_*_ALERTS_QA_REPORT; Seal |
| Gate-B Alerts | 90 | Spy verification | Gate-A PASS | Seal (SOP-013) חובה; אישור 90 |
| Gate-KP Alerts | 10 | קידום ידע + ארכיון + ניקוי | Gate-B PASS | Consolidation; ARCHIVE_MANIFEST |

---

## 5. D35 Feedback Lock — Rich Text + Attachments (משימת-על נעולה)

**מקור:** Team 90 Feedback Lock (D35 Notes) — Mini-Batch 3A.  
**משימת-על ב-Master Task List:** D35_RICH_TEXT_ATTACHMENTS_LOCK.

**החלטות נעולות (LOCKED):**
- עד 3 קבצים פעילים לכל הערה; כל קובץ עד 1MB (1048576 bytes).
- סוגים מותרים: jpg, png, webp, pdf, xls, xlsx, doc, docx.
- אחסון: `storage/uploads/users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}`.
- `notes.content` — Rich Text עם סניטיזציה בשרת (מנגנון קיים); ולידציה MIME לפי magic-bytes (לא רק סיומת).

**פירוק תתי-משימות (חובה):**

| תת-משימה | צוות | תיאור | Acceptance Criteria מדידים |
|----------|------|--------|----------------------------|
| **DB** | 60 | Migration, טבלת `user_data.note_attachments`, CHECK גודל, אינדקסים; נתיב אחסון בפועל, הרשאות כתיבה, מדיניות ניקוי | DDL רץ; נתיב דיסק תואם תבנית; Evidence ב-05-REPORTS/artifacts |
| **API** | 20 | מודל/שירות/ראוטים ל-attachments; ולידציות MIME (magic-bytes), גודל, מכסה (3); סניטיזציה ל-`notes.content` | 413/415/422/403/404 לפי OpenAPI; קובץ רביעי נדחה; קובץ >1MB נדחה; סוג לא מורשה נדחה |
| **UI** | 30 | עורך Rich Text ב-Notes; העלאת קבצים; חסימות UI (סוג/גודל/מכסה 3) | יצירה/עריכה עם Rich Text נשמרת ומוצגת; עד 3 קבצים; הודעות ברורות לדחייה |
| **QA** | 50 | E2E + API: קבצים פסולים, חריגת גודל, חריגת מכסה, regression אבטחה (XSS) | דוח Gate-A; כל ה-AC מאומתים; Seal (SOP-013) |
| **KP** | 10 | עדכון SSOT, Index, Evidence; סגירה רק עם Seal (SOP-013); אין Gate-B לפני תוכנית + SSOT + מנדטים + Gate-A | 00_MASTER_INDEX מעודכן; Evidence מלא; Seal מאושר |

**SSOT עודכנו:**  
- DDL: `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql`  
- OpenAPI: `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml`  
- Rich Text: `api/utils/RICH_TEXT_SANITIZATION_POLICY.md` (שדה `notes.content`); `api/utils/rich_text_sanitizer.py`  
- Index: `documentation/00-MANAGEMENT/00_MASTER_INDEX.md` — הפניה ל-D35 Notes Attachments + Rich Text lock.

---

## 6. Critical path ותלויות

```
Notes:   [Gate-0] → [Build] → [Gate-A] → [Gate-B] → [Gate-KP]
              ↓         ↑ D35 Lock (DB, API, UI, QA) משולב ב-Build
Alerts:  (המתנה ל-Gate-KP Notes) → [Gate-0] → [Build] → [Gate-A] → [Gate-B] → [Gate-KP]
```

- **צוות 20:** API/Backend ל-Notes (כולל attachments, MIME/size/count, sanitization content).
- **צוות 60:** Migration, אחסון, הרשאות, cleanup (D35).
- **צוות 30:** UI Notes — Rich Text editor, העלאת קבצים, חסימות.
- **צוות 50:** QA — תרחישי E2E/API מלאים; Seal חובה.

---

## 7. הפניות להחלטות אדריכלית

- **מקור יחיד להחלטות:** `_COMMUNICATION/_Architects_Decisions/`
- רלוונטי ל-MB3A (בהתאם לתוכן): Page Template/Blueprint, LEGO, Table/UI — ראה `00_MASTER_INDEX.md` בתיקייה.

---

## 8. טיוטות הפעלה (לא לשליחה לפני אישור 90)

טיוטות מנדטי הפעלה לצוותים מוכנות בקבצים נפרדים; **לא ישלחו** עד אישור Team 90 על תוכנית זו:

- TEAM_10_TO_TEAM_20_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md  
- TEAM_10_TO_TEAM_30_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md  
- TEAM_10_TO_TEAM_40_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md  
- TEAM_10_TO_TEAM_50_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md  
- TEAM_10_TO_TEAM_60_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md  

---

**log_entry | TEAM_10 | MB3A | NOTES_ALERTS_WORK_PLAN_DRAFT | 2026-02-15**
