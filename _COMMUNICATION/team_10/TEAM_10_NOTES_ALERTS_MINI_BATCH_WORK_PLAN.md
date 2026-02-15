# תוכנית עבודה — Mini-Batch 3A (Notes → Alerts)

**id:** TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN  
**owner:** Team 10 (The Gateway)  
**מקור מנדט:** [TEAM_90_TO_TEAM_10_MINI_BATCH_NOTES_ALERTS_MANDATE.md](../team_90/TEAM_90_TO_TEAM_10_MINI_BATCH_NOTES_ALERTS_MANDATE.md)  
**סטטוס:** DRAFT — ממתין לאישור Team 90 לפני הפעלת צוותים  
**last_updated:** 2026-02-15

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

## 5. Critical path ותלויות

```
Notes:   [Gate-0] → [Build] → [Gate-A] → [Gate-B] → [Gate-KP]
              ↓
Alerts:  (המתנה ל-Gate-KP Notes) → [Gate-0] → [Build] → [Gate-A] → [Gate-B] → [Gate-KP]
```

- **צוות 20:** מעורב אם נדרש API/Backend ל-Notes או Alerts (לפי סקופ).
- **צוות 60:** מעורב אם נדרש תשתית/DB (לפי סקופ).

---

## 6. הפניות להחלטות אדריכלית

- **מקור יחיד להחלטות:** `_COMMUNICATION/_Architects_Decisions/`
- רלוונטי ל-MB3A (בהתאם לתוכן): Page Template/Blueprint, LEGO, Table/UI — ראה `00_MASTER_INDEX.md` בתיקייה.

---

## 7. טיוטות הפעלה (לא לשליחה לפני אישור 90)

טיוטות מנדטי הפעלה לצוותים מוכנות בקבצים נפרדים; **לא ישלחו** עד אישור Team 90 על תוכנית זו:

- TEAM_10_TO_TEAM_20_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md  
- TEAM_10_TO_TEAM_30_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md  
- TEAM_10_TO_TEAM_40_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md  
- TEAM_10_TO_TEAM_50_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md  
- TEAM_10_TO_TEAM_60_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md  

---

**log_entry | TEAM_10 | MB3A | NOTES_ALERTS_WORK_PLAN_DRAFT | 2026-02-15**
