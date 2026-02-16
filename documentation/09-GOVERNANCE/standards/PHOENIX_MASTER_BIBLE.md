# 🛡️ ספר החוקים המאסטר: פרויקט הפניקס (v2.7)

**id:** `PHOENIX_MASTER_BIBLE`  
**owner:** Team 10 (The Gateway) + Architect (Gemini Bridge)  
**status:** 🔒 **SSOT - MANDATORY**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-02  
**version:** v2.7

---

**בעל החזון:** נמרוד ולד | **אדריכלות:** Gemini | **ביצוע:** Cursor  
**עודכן:** 2026-02-09

**עקרון יסוד:** ה-SSOT וכל נהלי העבודה הם **תקוד קריטי וקבוע** — מחייבים, קבועים, ומתעדכנים רק דרך הנהלים המפורשים. ראה `CURSOR_INTERNAL_PLAYBOOK.md` סעיף עקרון יסוד.

---
## 1. המבנה הארגוני
* **אדריכל ראשי:** נמרוד ולד (חזון ובקרה סופית).
* **אדריכל גשר ובקרה:** Gemini Bridge (השער האדריכלי - ולידציה ותקשורת).
* **צוות 01 (Frontend Arch):** תכנון לוגיקת ממשק וחוזים ויזואליים.
* **צוות 02 (Backend Arch):** תכנון סכימות נתונים (SQL) וארכיטקטורה.
* **צוות 10 (The Gateway):** הקבלן המתזמר (סנכרון Drive/Git, ניהול מטריצת עמודים מרכזית). **הפילטר הראשון** — תופס בעיות מהותיות תוך כדי תהליך; מודד את "דופק" המערכת; המטרה: להגיע לבדיקות המעמיקות (סיום כל שלב) עם קוד מדויק וללא שגיאות מהותיות.
---
## 2. נוהל מרחב נקי
כל מסמכי העבודה הפנימיים ב-/_COMMUNICATION/team_[ID]/. ניקוי חובה בסיום סשן.

---
## 3. ריענון נהלים ומשמעת אדריכלית (v1.5) 🚨 חובה

**תאריך:** 2026-02-01  
**מקור:** Chief Architect (Gemini)  
**סטטוס:** 🛡️ **MANDATORY**

### 3.1 ניהול קבצים ודוקומנטציה

**מקור אמת:**
- **תיקיית `90_Architects_documentation/` היא המקור הבלעדי** לכל הנחיות אדריכליות
- כל שינוי בקבצי מפתח מחייב **תיאום מול האדריכל**

**קבצי מפתח:**
- `PHOENIX_ORGANIZATIONAL_STRUCTURE.md` (v2.4)
- `TT2_OFFICIAL_PAGE_TRACKER.md`
- `CSS_EXCELLENCE_PROTOCOL.md`

**איסור דריסה:**
- **אסור לשנות** קבצים אלו מחוץ לתיאום מול האדריכל
- כל שינוי יבוצע רק לאחר **אישור מפורש** מהאדריכל

### 3.2 ולידציה וסביבת עבודה

**חובת G-Bridge:**
- **אין לקדם עמוד לסטטוס 5. APPROVED** ללא בדיקת G-Bridge שעברה (ירוק)
- כל עמוד חייב לעבור **ולידציה של G-Bridge** לפני אישור סופי
- G-Bridge הוא השער האדריכלי - ולידציה ותקשורת

**ניהול מקומי:**
- צוות 10 ממשיך לנהל את ה-Tracking בתיקיית הסטייג'ינג (`team_10_staging/`)
- האדריכל יבצע סנכרון ל-Bible

### 3.3 לוגיקה ו-JavaScript

**Transformation Layer:**
- **הקפדה מוחלטת** על ה-Transformation Layer
- כל ה-Payloads ב-Network חייבים לעבור ב-`snake_case`
- Frontend משתמש ב-`camelCase`, Backend ב-`snake_case`
- Transformation Layer אחראי על המרה בין הפורמטים

**אימות:**
- יש לוודא שכל ה-Payloads ב-Network עוברים ב-`snake_case`
- כל סטייה מהתקן הזה היא שגיאה קריטית

---
## 4. מטריצת עמודים מרכזית (Official Page Tracker)

**מיקום:** `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`  
**אחריות:** צוות 10 (The Gateway)  
**מטרה:** מטריצה מרכזית המשותפת לכל הצוותים, העוקבת אחרי כל העמודים במערכת.

### 3.1 מטרת המטריצה
המטריצה המרכזית מהווה מקור אמת יחיד (Single Source of Truth) עבור:
- כל העמודים במערכת (D15, D24, D25, D16, D18, D21, וכו')
- התקדמות כל עמוד (COMPLETE, IN PROGRESS, PENDING)
- חלוקה לפי קוביות LEGO (Identity, API Management, Security, Financial)
- חלוקה לפי שלבי עבודה (Phase 1.1-1.5)
- הגדרת סקופ (Batches)
- תת-משימות מפורטות לכל עמוד

### 3.2 חובת עדכון
- **כל שינוי סטטוס עמוד** חייב להיות מתועד במטריצה המרכזית
- **כל תת-משימה חדשה** חייבת להיות מתועדת במטריצה המרכזית
- **כל שינוי בשלב עבודה** חייב להיות מתועד במטריצה המרכזית
- **צוות 10 אחראי** על עדכון המטריצה המרכזית

### 3.3 שימוש במטריצה
- **כל צוות** חייב להתייחס למטריצה המרכזית לפני התחלת עבודה על עמוד חדש
- **כל צוות** חייב לעדכן את צוות 10 על שינויי סטטוס כדי שיוכל לעדכן את המטריצה
- **המטריצה המרכזית** היא המקור האמת היחיד למעקב התקדמות עמודים

---
## 5. אחריות צוות 10 (The Gateway)

**בהתאם להנחיות אדריכליות v1.5:**
- ניהול מטריצת עמודים מרכזית (`TT2_OFFICIAL_PAGE_TRACKER.md`)
- אי-שינוי קבצי מפתח ללא תיאום מול האדריכל
- אי-קידום עמודים לסטטוס APPROVED ללא בדיקת G-Bridge
- ניהול Tracking מקומי ב-`team_10_staging/`
- אכיפת Transformation Layer ו-`snake_case` בכל ה-Payloads

---
---

## 6. Final Governance Lock (v2.0) 🛡️ **MANDATORY**

**תאריך:** 2026-02-02  
**מקור:** Chief Architect (Gemini)  
**סטטוס:** 🛡️ **FINAL GOVERNANCE LOCK**  
**מקור:** `ARCHITECT_DECISION_LEGO_CUBES_FINAL.md`

**⚠️ חשוב:** כל חריגה מהכללים תגרור פסילת G-Bridge מיידית.

### 6.1 מבנה התיקיות והיררכיית Cubes 🔴
- **`src/components/core/`:** רכיבים "טיפשים" (Button, Input, Spinner) - ללא לוגיקה עסקית
- **`src/cubes/shared/`:** רכיבים המשמשים יותר מקוביה אחת (PhoenixTable, Contexts, Transformers)
- **`src/cubes/{cube-name}/`:** יחידות לוגיות עצמאיות (Identity, Financial)

### 6.2 רספונסיביות אוטומטית (Fluid Design Mandate) 📱
- **ללא קוד נפרד:** חל איסור על שימוש ב-Media Queries עבור גדלי פונטים וריווחים
- **הנחיה טכנית:** שימוש בלעדי ב-`clamp()`, `min()`, ו-`max()`
- **Layout:** שימוש ב-Grid עם `auto-fit` / `auto-fill`

### 6.3 אסטרטגיית Design Tokens 🔴
- **SSOT:** קובץ `phoenix-base.css` הוא מקור האמת היחיד
- **Cleanup:** קבצי ה-JSON מבוטלים ברמת הקוד
- **הסרה:** יש להסיר את `design-tokens.css` מהפרויקט

### 6.4 משמעת סקריפטים (The Hybrid Scripts Policy) 🔴
- **מותר:** תגי `<script src="...">` לטעינת תשתיות (Bridge, Loaders, Auth Guard)
- **אסור:** קוד Inline JavaScript בתוך תגי `<script>` בקבצי HTML או JSX
- **רטרואקטיביות:** כל עמודי ה-Auth הקיימים חייבים לעבור Refactor להוצאת הלוגיקה לקבצים חיצוניים
- **G-Bridge:** כל חריגה תגרור פסילת G-Bridge מיידית
- **מקור:** `ARCHITECT_POLICY_HYBRID_SCRIPTS.md` (2026-02-04)

---
## 7. SOP-013 — פרוטוקול משילות: דיווחי Agents וחיתום שלב 🛡️ **מחייב**

**id:** SOP-013 | **owner:** Architect / Team 10 | **סטטוס:** LOCKED — MANDATORY (2026-02-13)

- **סגירת משימות:** **רק** באמצעות **הודעת Seal (SOP-013)** — לא דוח או דוח השלמה לבד. פורמט: `--- PHOENIX TASK SEAL ---` עם TASK_ID, STATUS, FILES_MODIFIED, PRE_FLIGHT, HANDOVER_PROMPT.
- **שרשרת:** צוותי ביצוע (20–60) מפיקים Seal → Team 10 מעדכן MASTER_TASK_LIST ומפעיל 90 → Team 90 סריקה ו-PASS/FAIL. **חיתום שלב (PCS):** רק Team 10 מייצר PCS_[ID].md בסיום באץ' שלם.
- **אכיפה:** No Seal No Pay; LCI Integrity (90 דוחה שינוי קוד בלי Seal); **Zero Noise** — קבצי תיעוד זמניים שלא זוקקים ל-PCS יימחקו.
- **מקור מלא:** `documentation/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md` | הנחיית אדריכלית: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md`

---

**עודכן על ידי:** צוות 10 (The Gateway) | 2026-02-15  
**גרסה:** v2.9 (SOP-013 משילות מלאה — Seal, PCS, Zero Noise)