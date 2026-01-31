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
* **צוות 40 (UI Assets & Design):** ניהול Design Tokens, CSS Layers (Base/Comp/Header).
* **צוות 50 (QA):** ולידציה של Evidence בתיקייה 05-REPORTS/artifacts.
* **צוות 60 (DevOps & Platform):** תשתיות ייצור (Build), סביבות פיתוח ו-Deployment.

---

## 3. תקשורת פנימית ודיווח (Internal Flow)
1. **דיווח EOD:** כל צוות שולח לצוות 10 סיכום ביצוע יומי.
2. **שער המידע:** שום שאלה לא עוברת לאדריכלים ללא בדיקה של צוות 10 מול ה-D15.

---

## 4. ארגון קבצים ותיקיות (File Organization Protocol) 🚨 חובה

**כלל ברזל:** אסור לייצר רעש וזבל בפרויקט. כל קובץ חייב להיות במקום הנכון.

### 4.1 תיעוד קבוע (Permanent Documentation)
**מיקום:** `/documentation/` (לפי מבנה התיקיות הממוספר)
- כל מסמך תיעוד קבוע חייב להיכנס ל-`/documentation/D15_SYSTEM_INDEX.md`
- **חובה:** עדכון האינדקס בעת יצירת מסמך תיעוד חדש
- **אסור:** לשמור תיעוד בשורש הפרויקט
- **מבנה תיקיות:**
  - `00-MANAGEMENT/` - מסמכי ניהול ואסטרטגיה
  - `01-ARCHITECTURE/` - מסמכי ארכיטקטורה (LOGIC, FRONTEND)
  - `02-DEVELOPMENT/` - מסמכי פיתוח
  - `02-PRODUCT_&_BUSINESS_LOGIC/` - לוגיקת מוצר
  - `03-DESIGN_UX_UI/` - עיצוב וממשק
  - `03-PROCEDURES/` - נהלים
  - `04-ENGINEERING_&_ARCHITECTURE/` - הנדסה וארכיטקטורה
  - `05-DEVELOPMENT_&_CONTRACTS/` - חוזים
  - `05-REPORTS/` - דיווחים ו-Evidence
  - `06-GOVERNANCE_&_COMPLIANCE/` - ממשל ותקינה
  - `07-POLICIES/` - מדיניות
  - `07-QA_&_VALIDATION/` - בדיקות ואימות
  - `99-ARCHIVE/` - ארכיון

### 4.2 תקשורת מול צוותים (Team Communication)
**מיקום:** `/_COMMUNICATION/`
- כל התקשורת בין צוותים
- כל המסמכים הפנימיים של צוותים
- כל תיקיות הסטייג'ינג
- ניתן ליצור תיקיות משנה לפי צורך (למשל: `_COMMUNICATION/team_10/`, `_COMMUNICATION/staging/`)
- **אסור:** לשמור תקשורת ב-`/documentation/` או ב-`/99-ARCHIVE/`

### 4.3 Evidence ו-Reports
**מיקום:** `/documentation/05-REPORTS/artifacts/` או `/documentation/05-REPORTS/artifacts_SESSION_XX/`
- כל ה-Evidence של ביצוע משימות
- דיווחי סשן וסיכומי ביצוע
- **שימו לב:** Reports הם חלק מהתיעוד הקבוע ולכן נמצאים ב-`/documentation/`

### 4.4 כללים נוספים
- **אסור לשמור קבצים בשורש הפרויקט** (רק קבצי מערכת כמו `.gitignore`, `D15_SYSTEM_INDEX.md`)
- **תיקיית `/99-ARCHIVE/`** מיועדת לארכיון בלבד, לא לתקשורת פעילה
- **כל מסמך תיעוד חדש חייב להיכנס לאינדקס** (`/documentation/D15_SYSTEM_INDEX.md`)
- **אין כפילות:** כל קובץ במקום אחד בלבד

### 4.5 אחריות
- **צוות 10 (The Gateway):** אחראי על אכיפת כללי ארגון הקבצים
- **כל צוות:** חייב לבדוק את מיקום הקבצים לפני שמירה

---
*באחריות צוות 10 לוודא כי כל חבר צוות חדש עבר את ה-Onboarding.*