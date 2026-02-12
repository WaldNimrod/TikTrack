# 📋 נוהל מימוש: ניהול גרסאות (ADR-016)

**id:** TT2_VERSIONING_PROCEDURE  
**owner:** Team 10 (The Gateway)  
**מבוסס על:** [TT2_VERSIONING_POLICY.md](../10-POLICIES/TT2_VERSIONING_POLICY.md) (ADR-016) — LOCKED  
**סטטוס:** מחייב ממועד פרסום.

---

## 1. מטרה

ליישם את נוהל ניהול הגרסאות (ADR-016) בפרויקט: שמירה על **תקרת גרסה מערכתית (SV)** בכל השכבות, חלוקת אחריות לעדכון גרסאות, ואימות תאימות **על ידי Team 90 בלבד** (ללא כתיבת קוד — בדיקה ודיווח).

---

## 2. עקרונות (תמצית מהנוהל)

| כלל | תיאור |
|-----|--------|
| **Ceiling** | אף שכבה לא עולה מעל ה-Major של System Version (SV). |
| **Major/Minor** | מאושרים **רק** ע"י G-Lead (נמרוד). |
| **Patch/Build** | מותרים לעדכון אוטומטי (Build/CI). |

---

## 3. מיקומי גרסאות בקוד (לצורך אימות)

| Layer | מיקום בפרויקט |
| :--- | :--- |
| **System Version (SV)** | תיעוד בלבד — [TT2_VERSION_MATRIX.md](../10-POLICIES/TT2_VERSION_MATRIX.md) |
| **API Layer** | `api/__init__.py` — `__version__` |
| **Database Schema** | תיעוד DDL (גרסה בשם/תיעוד סכמה, למשל 2.5) |
| **UI Package** | `ui/package.json` — שדה `"version"` |
| **Routes Config** | `ui/public/routes.json` — שדה `"version"` |

---

## 4. תוכנית מימוש

1. **הטמעת נוהל בתיעוד**  
   - נוהל ומטריצה ב-`documentation/10-POLICIES/`.  
   - נוהל מימוש (מסמך זה) ב-`documentation/05-PROCEDURES/`.  
   - קישור מאינדקס המאסטר.

2. **הודעות צוותים**  
   - Team 10 מעביר לכל הצוותים: נוהל ADR-016 פעיל, מיקום המסמכים, חובת ציות ל-Ceiling.  
   - Team 10 מעביר ל-**Team 90**: מנדט ביצוע **בדיקת תאימות גרסאות** (אין כתיבת קוד — אימות ודיווח בלבד).

3. **עדכון גרסאות בשכבות**  
   - עדכוני **Major/Minor** רק אחרי **אישור G-Lead**.  
   - עדכון **Patch/Build** מותר בתהליכי Build/CI.  
   - עדכון **מטריצת גרסאות** אחרי כל שינוי מאושר (מטופל על ידי Team 10 או לפי הנחיית G-Lead).

4. **בדיקה (Team 90)**  
   - Team 90 מריץ **אימות תאימות**: קריאת גרסאות ממיקומי הקוד + מטריצה, וידוא שאין שכבה מעל ה-SV Major.  
   - דיווח: תוצר בדיקה (למשל דוח קצר או עדכון מטריצה עם סטטוס Aligned / PENDING BUMP).  
   - **לא נדרש:** שינוי קוד על ידי Team 90 — רק בדיקה ודיווח.

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| נוהל משילות (ADR-016) | [TT2_VERSIONING_POLICY.md](../10-POLICIES/TT2_VERSIONING_POLICY.md) |
| מטריצת גרסאות | [TT2_VERSION_MATRIX.md](../10-POLICIES/TT2_VERSION_MATRIX.md) |
| אינדקס מאסטר | [00_MASTER_INDEX.md](../00-MANAGEMENT/00_MASTER_INDEX.md) — סעיף ניהול גרסאות |

---

**log_entry | TEAM_10 | TT2_VERSIONING_PROCEDURE | PUBLISHED**
