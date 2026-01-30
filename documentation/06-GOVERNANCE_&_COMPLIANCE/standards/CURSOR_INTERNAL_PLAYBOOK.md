# ⚔️ ספר הנהלים לקבלן המבצע - Cursor Playbook (v2.2)

**מיקום:** 06-GOVERNANCE_&_COMPLIANCE/standards/  
**אחריות ואכיפה:** צוות 10 (The Gateway)

---

## 1. פרוטוקול "אני מוכן" (Readiness Protocol)
צוות נחשב ל"פעיל" רק לאחר הצהרת מוכנות בצ'אט בפורמט הבא:

```text
From: Team [X]
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of Squad context.
Context Check: [ציין מסמך מדרייב שעליו אתה מתבסס]
Next: I am ready for the first task.
log_entry | [Team X] | READY | 001 | GREEN
```

---

## 2. הגדרות תפקיד וציפיות (Detailed Roles)
* **צוות 10 (The Gateway):** מפקד השטח. ניהול ה-D15, סנכרון GitHub/Drive, וסינון שאלות לאדריכלים.
* **צוות 20 (Backend):** מימוש FastAPI בהתאמה ל-LOD 400 SQL.
* **צוות 30 (Frontend):** מימוש Pixel Perfect מול Design Tokens בלבד.
* **צוות 50 (QA):** ולידציה של Evidence בתיקייה 05-REPORTS/artifacts.

---

## 3. תקשורת פנימית ודיווח (Internal Flow)
1. **דיווח EOD:** כל צוות שולח לצוות 10 סיכום ביצוע יומי.
2. **שער המידע:** שום שאלה לא עוברת לאדריכלים ללא בדיקה של צוות 10 מול ה-D15.

---

## 4. ארגון קבצים ותיקיות (File Organization Protocol) 🚨 חובה

**כלל ברזל:** אסור לייצר רעש וזבל בפרויקט. כל קובץ חייב להיות במקום הנכון.

### 4.1 תקשורת מול צוותים (Team Communication)
**מיקום:** `/05-REPORTS/artifacts_SESSION_XX/`
- כל מסמכי תקשורת, תוכניות עבודה, ודיווחים של סשן מסוים
- דוגמה: `PHASE_1_TASK_BREAKDOWN.md`, `READINESS_DECLARATION.md`
- **אסור:** לשמור תקשורת פעילה ב-`/99-ARCHIVE/` (רק ארכיון ישן)

### 4.2 תיעוד קבוע (Permanent Documentation)
**מיקום:** `/documentation/` (לפי מבנה התיקיות)
- כל מסמך תיעוד קבוע חייב להיכנס ל-`/D15_SYSTEM_INDEX.md`
- **חובה:** עדכון האינדקס בעת יצירת מסמך תיעוד חדש
- **אסור:** לשמור תיעוד בשורש הפרויקט

### 4.3 Evidence ו-Reports
**מיקום:** `/05-REPORTS/artifacts/` או `/05-REPORTS/artifacts_SESSION_XX/`
- כל ה-Evidence של ביצוע משימות
- דיווחי סשן וסיכומי ביצוע

### 4.4 כללים נוספים
- **אסור לשמור קבצים בשורש הפרויקט** (רק קבצי מערכת כמו `.gitignore`, `D15_SYSTEM_INDEX.md`)
- **תיקיית `/99-ARCHIVE/`** מיועדת לארכיון בלבד, לא לתקשורת פעילה
- **כל מסמך תיעוד חדש חייב להיכנס לאינדקס** (`D15_SYSTEM_INDEX.md`)

### 4.5 אחריות
- **צוות 10 (The Gateway):** אחראי על אכיפת כללי ארגון הקבצים
- **כל צוות:** חייב לבדוק את מיקום הקבצים לפני שמירה

---
*באחריות צוות 10 לוודא כי כל חבר צוות חדש עבר את ה-Onboarding.*