# ⚔️ ספר הנהלים לקבלן המבצע - Cursor Playbook (v2.3)

**מיקום:** 09-GOVERNANCE/standards/  
**אחריות ואכיפה:** צוות 10 (The Gateway)  
**עודכן:** 2026-02-01 (ריענון נהלים ומשמעת אדריכלית v1.5)

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
* **צוות 10 (The Gateway):** מפקד השטח. ניהול ה-D15, סנכרון GitHub/Drive, וסינון שאלות לאדריכלים. **אחריות:** ניהול המטריצה המרכזית (`TT2_OFFICIAL_PAGE_TRACKER.md`).
* **צוות 20 (Backend):** מימוש FastAPI בהתאמה ל-LOD 400 SQL.
* **צוות 30 (Frontend):** מימוש Pixel Perfect מול Design Tokens בלבד.
* **צוות 40 (UI Assets & Design):** ניהול Design Tokens, CSS Layers (Base/Comp/Header).
* **צוות 50 (QA & Fidelity):** ולידציה של Evidence בתיקייה 08-REPORTS/artifacts. בדיקות QA ראשיות.
* **צוות 51 (QA Remote):** צוות QA נוסף הפועל מרחוק על חבילת הקבצים. בדיקות Validation Framework מקיפות.
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
- **מבנה תיקיות (FIXED - v2.0):**
  - `00-MANAGEMENT/` - מסמכי ניהול ואסטרטגיה
  - `01-ARCHITECTURE/` - מסמכי ארכיטקטורה (LOGIC, FRONTEND)
  - `02-DEVELOPMENT/` - מסמכי פיתוח
  - `03-PRODUCT_&_BUSINESS/` - לוגיקת מוצר (שונה מ-02-PRODUCT_&_BUSINESS_LOGIC)
  - `04-DESIGN_UX_UI/` - עיצוב וממשק (שונה מ-03-DESIGN_UX_UI)
  - `05-PROCEDURES/` - נהלים (שונה מ-03-PROCEDURES)
  - `06-ENGINEERING/` - הנדסה (שונה מ-04-ENGINEERING_&_ARCHITECTURE)
  - `07-CONTRACTS/` - חוזים (שונה מ-05-DEVELOPMENT_&_CONTRACTS)
  - `08-REPORTS/` - דיווחים ו-Evidence (שונה מ-05-REPORTS)
  - `09-GOVERNANCE/` - ממשל ותקינה (שונה מ-06-GOVERNANCE_&_COMPLIANCE)
  - `10-POLICIES/` - מדיניות (שונה מ-07-POLICIES)
  - `90_Architects_documentation/` - **READ ONLY** - תיקיית האדריכלית בלבד
  - `99-ARCHIVE/` - ארכיון

### 4.2 תקשורת מול צוותים (Team Communication)
**מיקום:** `/_COMMUNICATION/`
- כל התקשורת בין צוותים
- כל המסמכים הפנימיים של צוותים
- כל תיקיות הסטייג'ינג
- **מבנה תיקיות (FIXED - v2.0):**
  - `team_01/`, `team_02/`, `team_10/`, `team_20/`, `team_30/`, `team_31/`, `team_40/`, `team_50/`, `team_60/` - תיקיות צוותים
  - `90_Architects_communication/` - **READ ONLY** - תיקיית האדריכלית בלבד
  - קבצים בשורש: רק קבצים לטווח ארוך (README_COMMUNICATION.md, סיכומים כלליים)
- **חובה:** כל צוות יוצר קבצים רק בתיקיה שלו
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

## 5. מטריצת עמודים מרכזית (Official Page Tracker) 🚨 חובה

**מיקום:** `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`  
**אחריות:** צוות 10 (The Gateway)  
**מטרה:** מטריצה מרכזית המשותפת לכל הצוותים, העוקבת אחרי כל העמודים במערכת.

### 5.1 מטרת המטריצה
המטריצה המרכזית מהווה מקור אמת יחיד (Single Source of Truth) עבור:
- כל העמודים במערכת (D15, D24, D25, D16, D18, D21, וכו')
- התקדמות כל עמוד (COMPLETE, IN PROGRESS, PENDING)
- חלוקה לפי קוביות LEGO (Identity, API Management, Security, Financial)
- חלוקה לפי שלבי עבודה (Phase 1.1-1.5)
- הגדרת סקופ (Batches)
- תת-משימות מפורטות לכל עמוד

### 5.2 חובת עדכון
- **כל שינוי סטטוס עמוד** חייב להיות מתועד במטריצה המרכזית
- **כל תת-משימה חדשה** חייבת להיות מתועדת במטריצה המרכזית
- **כל שינוי בשלב עבודה** חייב להיות מתועד במטריצה המרכזית
- **צוות 10 אחראי** על עדכון המטריצה המרכזית

### 5.3 שימוש במטריצה
- **כל צוות** חייב להתייחס למטריצה המרכזית לפני התחלת עבודה על עמוד חדש
- **כל צוות** חייב לעדכן את צוות 10 על שינויי סטטוס כדי שיוכל לעדכן את המטריצה
- **המטריצה המרכזית** היא המקור האמת היחיד למעקב התקדמות עמודים

### 5.4 מבנה המטריצה
המטריצה כוללת:
- חלוקה לפי קוביות LEGO
- מטריצת עמודים עם סטטוס והתקדמות
- שלבי עבודה (Work Phases)
- סיכום לפי סטטוס
- הגדרת סקופ (Scope Definition)
- עדכונים אחרונים

---

## 6. הנחיות אדריכליות v1.5 🚨 חובה

**תאריך:** 2026-02-01  
**מקור:** Chief Architect (Gemini)  
**סטטוס:** 🛡️ **MANDATORY**

### 6.1 ניהול קבצים ודוקומנטציה

**מקור אמת:**
- תיקיית `90_Architects_documentation/` היא **המקור הבלעדי** לכל הנחיות אדריכליות
- כל שינוי בקבצי מפתח מחייב **תיאום מול האדריכל**

**קבצי מפתח:**
- `PHOENIX_ORGANIZATIONAL_STRUCTURE.md` (v2.4)
- `TT2_OFFICIAL_PAGE_TRACKER.md`
- `CSS_EXCELLENCE_PROTOCOL.md`

**איסור דריסה:**
- **אסור לשנות** קבצים אלו מחוץ לתיאום מול האדריכל
- כל שינוי יבוצע רק לאחר **אישור מפורש** מהאדריכל

### 6.2 ולידציה וסביבת עבודה

**חובת G-Bridge:**
- **אין לקדם עמוד לסטטוס 5. APPROVED** ללא בדיקת G-Bridge שעברה (ירוק)
- כל עמוד חייב לעבור **ולידציה של G-Bridge** לפני אישור סופי
- G-Bridge הוא השער האדריכלי - ולידציה ותקשורת

**ניהול מקומי:**
- צוות 10 ממשיך לנהל את ה-Tracking בתיקיית הסטייג'ינג (`team_10_staging/`)
- האדריכל יבצע סנכרון ל-Bible

### 6.3 לוגיקה ו-JavaScript

**Transformation Layer:**
- **הקפדה מוחלטת** על ה-Transformation Layer
- כל ה-Payloads ב-Network חייבים לעבור ב-`snake_case`
- Frontend משתמש ב-`camelCase`, Backend ב-`snake_case`
- Transformation Layer אחראי על המרה בין הפורמטים

**אימות:**
- יש לוודא שכל ה-Payloads ב-Network עוברים ב-`snake_case`
- כל סטייה מהתקן הזה היא שגיאה קריטית

---

*באחריות צוות 10 לוודא כי כל חבר צוות חדש עבר את ה-Onboarding.*