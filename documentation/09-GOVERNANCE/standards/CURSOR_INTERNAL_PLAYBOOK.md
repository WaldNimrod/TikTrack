# ⚔️ ספר הנהלים לקבלן המבצע - Cursor Playbook (v2.3)

**id:** `CURSOR_INTERNAL_PLAYBOOK`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - MANDATORY**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-09  
**version:** v2.5

---

**מיקום:** 09-GOVERNANCE/standards/  
**אחריות ואכיפה:** צוות 10 (The Gateway)  
**עודכן:** 2026-02-09

---

## 🚨 עקרון יסוד — תקוד קריטי וקבוע

**ה-SSOT וכל נהלי העבודה שלנו הם תקוד קריטי וקבוע.**

- מסמכי SSOT (`documentation/` — אינדקס, נהלים, ארכיטקטורה, תקנים) וכל נהלי העבודה המוגדרים בהם הם **קבועים ומחייבים**. אין לשנותם, לעקוף אותם או לטשטש את ההבחנה בינם לבין תקשורת או חומר זמני.
- עדכון ל-SSOT או לנהלים מתבצע **רק** דרך הנהלים המפורשים (קידום מידע, החלטות אדריכלית, Team 10) — לא דרך קבצי תקשורת או תיעוד זמני.
- אכיפה: צוות 10 אחראי על שמירת תקינות ה-SSOT והנהלים; כל צוות מחויב לפעול לפיהם.

### תפקיד השער — הפילטר הראשון
צוות 10 הוא **הפילטר הראשון**, לא צינור. תפקידו לתפוס בעיות מהותיות, חוסר התאמה ושגיאות **תוך כדי תהליך**, לפני שהן מגיעות לשלבי הביקורת המעמיקה בסיום כל שלב. צוות 10 הוא המכשיר שמודד כל הזמן את "דופק" המערכת ומוודא שהיא חיה ותקינה. **המטרה:** להגיע לתהליכי הבדיקה המעמיקים עם קוד מדויק ונכון וללא שגיאות מהותיות.

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

* **צוות 10 (The Gateway):** מפקד השטח. ניהול ה-D15, סנכרון GitHub/Drive, וסינון שאלות לאדריכלים. **אחריות:** ניהול המטריצה המרכזית (`TT2_OFFICIAL_PAGE_TRACKER.md`). **תיעוד:** צוות 10 אחראי על תיעוד — עדכון מסמכי SSOT, אינדקסים, רישום סטטוסי שלבים והשלמות, וקידום מידע מ-`_COMMUNICATION` ל-`documentation/` לפי הנהלים. **מהות תפקיד:** צוות 10 הוא **הפילטר הראשון** — לא צינור. תופס בעיות מהותיות, חוסר התאמה ושגיאות **תוך כדי תהליך**, לפני שהן מגיעות לשלבי הביקורת המעמיקה. המכשיר שמודד כל הזמן את "דופק" המערכת ומוודא שהיא חיה ותקינה. **המטרה:** להגיע לתהליכי הבדיקה המעמיקים (סיום כל שלב) עם קוד מדויק ונכון וללא שגיאות מהותיות — לא להעביר הלאה בלי ולידציה.
* **צוות 20 (Backend):** מימוש FastAPI בהתאמה ל-LOD 400 SQL.
* **צוות 30 (Frontend):** הפיכת רכיבי Presentational ל-Containers — לוגיקה עסקית, ניהול מצב (State), קריאות API. לא משנה CSS/מראה של רכיבים; שינוי עיצוב — דרך צוות 40.
* **צוות 40 (UI Assets & Design):** הפיכת Blueprints לרכיבי React Presentational (Pixel Perfect); בעלים בלעדיים של CSS ומראה ויזואלי (Design Tokens, CSS Layers). ראה [TT2_SLA_TEAMS_30_40.md](../../05-PROCEDURES/TT2_SLA_TEAMS_30_40.md).
* **צוות 50 (QA & Fidelity):** **QA** — שער א': הרצת סוויטת הבדיקות האוטומטיות (0 SEVERE), ולידציה בממשק, Evidence ב-05-REPORTS/artifacts. ראה [TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md](../../05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md) ו-[TEAM_50_QA_WORKFLOW_PROTOCOL.md](./TEAM_50_QA_WORKFLOW_PROTOCOL.md).
* **צוות 51 (QA Remote):** צוות QA נוסף הפועל מרחוק על חבילת הקבצים. בדיקות Validation Framework מקיפות.
* **צוות 31 (Shared Components / Blueprints):** יצירת בלופרינטים (HTML סטטי) לפי [TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md](../../05-PROCEDURES/TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md). מסירה רק לאחר Checklist ואישור Visionary.
* **צוות 60 (DevOps & Platform):** **DevOps ובסיס נתונים** — תשתיות ייצור (Build), סביבות פיתוח ו-Deployment, גיבוי DB, סקריפטי seed ונתוני בדיקה, `make db-*`. אחראי על הרצת גיבויים והזרקת נתוני בדיקה לפי נוהל.
* **צוות 90 (The Spy):** **בקרה חיצונית ויועץ** — שער ב': ביקורת חיצונית (חוסן, אבטחה, סטנדרטים ארכיטקטוניים). צוות 90 אינו מבצע את ה-QA הפורמלי (שער א') — זה באחריות צוות 50. ראה [TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md](../../05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md).

---

## 3. תקשורת פנימית ודיווח (Internal Flow)
1. **דיווח EOD:** כל צוות שולח לצוות 10 סיכום ביצוע יומי.
2. **שער המידע:** שום שאלה לא עוברת לאדריכלים ללא בדיקה של צוות 10 מול האינדקס המאוחד (00_MASTER_INDEX): ניהול — `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`; אדריכל (חוקי יסוד) — `documentation/90_ARCHITECTS_DOCUMENTATION/00_MASTER_INDEX.md`.

---

## 4. ארגון קבצים ותיקיות (File Organization Protocol) 🚨 חובה

**כלל ברזל:** אסור לייצר רעש וזבל בפרויקט. כל קובץ חייב להיות במקום הנכון.

### 4.1 תיעוד קבוע (Permanent Documentation)
**מיקום:** `/documentation/` (לפי מבנה התיקיות הממוספר)
- כל מסמך תיעוד קבוע חייב להיכנס לאינדקס המאוחד. **אינדקס ניהול:** `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`; **אינדקס אדריכל (חוקי יסוד):** `_COMMUNICATION/90_Architects_comunication/00_MASTER_INDEX.md`. דפי D15_SYSTEM_INDEX מבוטלים (DEPRECATED).
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

### 4.2 תקשורת מול צוותים (Team Communication) 🚨 חובה קפדנית
**מיקום:** `/_COMMUNICATION/`
- כל התקשורת בין צוותים וכל קבצים זמניים — **רק** בתיקיית הצוות שלכם (למשל צוות 10 → `_COMMUNICATION/team_10/` בלבד).
- **חוק ברזל:** קבצי תקשורת וקבצים זמניים **חובה** ליצור **רק** בתוך תיקיית הצוות שלכם. **אסור** ליצורם בשורש הפרויקט, ב-`documentation/`, או בתיקיית צוות אחר.
- **אין להוסיף לאינדקס:** קבצי `_COMMUNICATION` וקבצים זמניים **לא מתווספים** ל-00_MASTER_INDEX או לאינדקסים אחרים. רק תיעוד קבוע שמועלה ל-`documentation/` דרך נוהל קידום המידע (Knowledge Promotion) מתועד באינדקס.
- **הפרדה:** שמירה קפדנית על ההפרדה בין תיקיות העבודה/תקשורת לבין התיעוד הקבוע (`documentation/`) ותהליך קידום המידע כפי שמוגדר בנהלים.
- **מבנה תיקיות (FIXED - v2.0):**
  - `team_01/`, `team_02/`, `team_10/`, `team_20/`, `team_30/`, `team_31/`, `team_40/`, `team_50/`, `team_60/` - תיקיות צוותים (כל צוות רק בתיקיה שלו)
  - `90_Architects_communication/` - **READ ONLY** - תיקיית האדריכלית בלבד
  - קבצים בשורש _COMMUNICATION: רק קבצים לטווח ארוך (README_COMMUNICATION.md, סיכומים כלליים) — באישור.
- **אסור:** לשמור תקשורת או קבצים זמניים ב-`/documentation/` או ב-`/99-ARCHIVE/`

### 4.3 Evidence ו-Reports
**מיקום:** `/documentation/05-REPORTS/artifacts/` או `/documentation/05-REPORTS/artifacts_SESSION_XX/`
- כל ה-Evidence של ביצוע משימות
- דיווחי סשן וסיכומי ביצוע
- **שימו לב:** Reports הם חלק מהתיעוד הקבוע ולכן נמצאים ב-`/documentation/`

### 4.4 כללים נוספים
- **אסור לשמור קבצים בשורש הפרויקט** (רק קבצי מערכת כמו `.gitignore`; אינדקסים ב-`documentation/00-MANAGEMENT/` ו-`documentation/90_ARCHITECTS_DOCUMENTATION/`)
- **תיקיית `/99-ARCHIVE/`** מיועדת לארכיון בלבד, לא לתקשורת פעילה. **ארכוב:** לפי `TT2_KNOWLEDGE_PROMOTION_PROTOCOL` — רק דוחות/Evidence לארכיון; נהלים, מפרטים והגדרות נשארים בתקשורת פעילה (ראה נוהל "הפרדה — מה לא לארכיון").
- **כל מסמך תיעוד קבוע** (ב-`documentation/`) **חייב להיכנס לאינדקס**. קבצי תקשורת (`_COMMUNICATION/`) **לא** מתווספים לאינדקס.
- **אין כפילות:** כל קובץ במקום אחד בלבד

### 4.5 גיבוי ל-GitHub
- **תיקיית `documentation/`** — **תמיד** נכללת בגיבוי (commit + push).
- **תיקיית `_COMMUNICATION/`** — **לא** נכללת בגיבוי.

### 4.6 אחריות
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
