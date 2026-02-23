# נדרש לעדכן — נהלים, הגדרות תפקיד ופעולות Team 10 לכל שער

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)

**id:** TEAM_10_PROCEDURES_AND_GATE_ACTIONS_UPDATE_REQUIRED  
**from:** Team 10 (The Gateway)  
**re:** נעילת הגדרות מדויקות להתנהלות צוות 10 ופעולות נדרשות בכל שער ובכל שלב; חלוקת תפקידי צוותי פיתוח  
**date:** 2026-01-30  
**status:** DRAFT — רשימת עדכונים נדרשים  

---

## 1. מטרה

לנעול בהנהלים ובהגדרות התפקיד:
- **התנהלות צוות 10** — מה נדרש מאיתנו בכל שער ובכל שלב.
- **חלוקת התפקידים בין צוותי הפיתוח** (20, 30, 40, 60) כמוגדר בנוהל חוקי קרסור — כדי שכל תוכנית עבודה תקצה משימות לפי תחום ותייצר מוצר שלם ועובד.

---

## 2. חלוקת תפקידי צוותי פיתוח — מקור קנוני (חוקי קרסור)

**מקור מחייב:** `.cursorrules` (נוהל חוקי קרסור של הפרויקט).

| Squad ID | תפקיד | תחום אחריות |
|----------|--------|---------------|
| **Team 20** | Backend Implementation | מימוש צד שרת — API, לוגיקה, DB, שירותים, runtime צד שרת |
| **Team 30** | Frontend Execution | מימוש צד לקוח — קומפוננטות, דפים, אינטגרציה ל־API |
| **Team 40** | UI Assets & Design | עיצוב, Design Tokens, נכסי UI, עקביות ויזואלית |
| **Team 60** | DevOps & Platform | תשתית, הרצה, CI/CD, פלטפורמה, סביבות |

**כלל:** תוכנית עבודה (Work Package) חייבת להקצות מימוש לפי התחום — Backend→20, Frontend→30, UI/Design→40, Infrastructure/Platform→60. **לא להניח ש"צוות אחד (למשל 20) מכסה את כל המוצר** אלא אם ה־scope של החבילה מוגבל במפורש (למשל backend-only).

---

## 3. רשימת עדכונים נדרשים — קבצים וסעיפים

### 3.1 נוהל השערים (04_GATE_MODEL_PROTOCOL)

| קובץ | פעולה נדרשת |
|------|--------------|
| `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` (או גרסה עתידית בנתיב הקנוני) | להוסיף **§ חדש: Team 10 (Gateway) — פעולות נדרשות לכל שער.** לכל gate_id (GATE_0 … GATE_8, ו־PRE_GATE_3): רשימת פעולות חובה של Team 10 (למשל: GATE_3 — הפעלת צוותי פיתוח לפי scope, קבלת תוצרים, internal verification, GATE_3 exit, הגשת חבילת QA ל־Team 50; GATE_4 — הגשת חבילת QA; GATE_5 — הגשת WORK_PACKAGE_VALIDATION_REQUEST; וכו'). |

### 3.2 הגדרת תפקיד צוות 10 (TEAM_10_GATEWAY_ROLE_AND_PROCESS)

| קובץ | פעולה נדרשת |
|------|--------------|
| `_COMMUNICATION/team_10/TEAM_10_GATEWAY_ROLE_AND_PROCESS.md` | (1) **הוספת סעיף:** "חלוקת צוותי פיתוח — מקור קנוני" — הפניה ל־.cursorrules (Team 20=Backend, 30=Frontend, 40=UI, 60=DevOps). (2) **כלל:** בבניית תוכנית ביצוע (מסמך EXECUTION_AND_TEAM_PROMPTS), לקבוע אילו צוותים (20/30/40/60) בסקופ לפי ה־WORK_PACKAGE_DEFINITION ולהפעיל **כל** צוות בסקופ — לא רק צוות אחד אלא לפי תחום. (3) **אופציונלי:** טבלת "פעולות Team 10 לכל שער" (תמצית) או קישור לפרוטוקול השערים §Team 10. |

### 3.3 נוהל רשימת המשימות (TEAM_10_MASTER_TASK_LIST_PROTOCOL)

| קובץ | פעולה נדרשת |
|------|--------------|
| `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md` | בתוך §1.2.1.1 (לאחר Pre-GATE_3 PASS): **להוסיף:** (א) קביעת צוותי הפיתוח בסקופ לפי חלוקת התפקידים הקנונית (20/30/40/60); (ב) הוצאת מנדט/פרומט **לכל** צוות פיתוח בסקופ — לא רק לצוות אחד, אלא לכל ענף רלוונטי (Backend, Frontend, UI, DevOps לפי הצורך). |

### 3.4 .cursorrules (חוקי קרסור)

| קובץ | פעולה נדרשת |
|------|--------------|
| `.cursorrules` | **לוודא** שההגדרות הקיימות של 20/30/40/50/51/60 נשארות מקור אמת. **אופציונלי:** להוסיף שורה אחת: "Team 10 (Gateway) — בעלים GATE_3 (Implementation); תפקיד: אורקסטרציה, הפעלת צוותי פיתוח לפי scope, ואיסוף תוצר עד GATE_3 exit והגשה ל־GATE_4." כך שכל סוכן יידע את חלוקת התפקידים ואת תפקיד 10. |

### 3.5 PHOENIX_MASTER_BIBLE / CURSOR_INTERNAL_PLAYBOOK

| קובץ | פעולה נדרשת |
|------|--------------|
| `documentation/docs-governance/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` (או הנתיב המעודכן) | אם קיים — להוסיף או לעדכן: (1) חלוקת צוותי פיתוח 20/30/40/60 (כמו ב־.cursorrules). (2) תפקיד Team 10 בכל שער — תמצית או הפניה ל־04_GATE_MODEL_PROTOCOL §Team 10. |
| `06-GOVERNANCE_&_COMPLIANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md` (או מקביל) | אם קיים — לוודא התייחסות לרשימת המשימות ולאחריות צוות 10; התייחסות לחלוקת 20/30/40/60 כשבנים תוכנית עבודה. |

### 3.6 WSM / נוהל עדכון WSM

| קובץ | פעולה נדרשת |
|------|--------------|
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` (או PHOENIX_CANONICAL) | כבר מוגדר: Gate Owner מעדכן CURRENT_OPERATIONAL_STATE בכל סגירת שער. **לוודא** שבמסמכי Team 10 (GATEWAY_ROLE, PROTOCOL) מופיעה הפניה ברורה: Team 10 כבעלים GATE_3 מעדכן WSM עם סגירת GATE_3 (ו־last_gate_event, next_required_action, next_responsible_team). |
| `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0.md` | אין חובה לשינוי — רק לוודא ש־Team 10 מציית: עדכון WSM מיד עם סגירת שער כשאנחנו Gate Owner. |

---

## 4. פעולות Team 10 לכל שער — טבלת תמצית (לנעילה בפרוטוקול השערים או ב־GATEWAY_ROLE)

| שער | פעולות חובה של Team 10 |
|-----|--------------------------|
| **PRE_GATE_3** | הגשת WORK_PACKAGE_DEFINITION + תוכנית ביצוע ל־Team 90; המתנה ל־VALIDATION_RESPONSE PASS; עדכון רשימות ו־WSM כשנפתח GATE_3. |
| **GATE_3** | (1) קביעת צוותי פיתוח בסקופ (20/30/40/60 לפי scope). (2) הפעלת כל צוות פיתוח בסקופ — מנדט + פרומט. (3) קבלת תוצרים (קוד/מבנה). (4) Internal verification + GATE_3 exit criteria. (5) חבילת GATE_3 exit; הגשה ל־Team 50 (GATE_4). (6) עדכון WSM (current_gate, last_gate_event, next_required_action). |
| **GATE_4** | הגשת חבילת QA ל־Team 50 (קונטקסט, קישורים, evidence); המתנה לדוח QA (0 SEVERE); עדכון רשימות; עם PASS — מעבר ל־GATE_5. |
| **GATE_5** | הגשת WORK_PACKAGE_VALIDATION_REQUEST (gate_id GATE_5) ל־Team 90 עם חבילה מלאה; המתנה ל־VALIDATION_RESPONSE; עדכון רשימות ו־WSM עם PASS. |
| **GATE_6** | העברת חבילת GATE_6 ל־Team 190; המתנה ל־EXECUTION approval; עדכון רשימות ו־WSM עם PASS. |
| **GATE_7** | העברת בקשה לחתימת Nimrod (Human UX Approval); עדכון עם חתימה. |
| **GATE_8** | תיאום עם Team 70 (מבצע) ו־Team 190 (בעלים); וידוא AS_MADE_REPORT וסגירת lifecycle; עדכון WSM. |

---

## 5. תוכנית עבודה מלאה — עקרון למוצר שלם ועובד

- **חבילה שמוגבלת ל־backend/runtime בלבד** (כמו WP002 — Agents_OS): צוותי פיתוח בסקופ = **20** (קוד validator, runtime) + **60** אם נדרש runner/תשתית; 30 ו־40 לא בסקופ.
- **חבילה שמוגבלת ל־frontend בלבד:** צוותי פיתוח בסקופ = **30** (+ 40 אם נדרש עיצוב/נכסים).
- **חבילה "מוצר מלא"** (UI + שרת + תשתית): צוותי פיתוח בסקופ = **20 + 30 + 40 + 60** לפי התחומים — כל ענף מקבל מנדט ופרומט מפורש; תוכנית העבודה מפרטת מי מוסר מה ובאיזה סדר.

**מסמך הביצוע (EXECUTION_AND_TEAM_PROMPTS)** לכל Work Package חייב לכלול: (1) אילו צוותים (20/30/40/60) בסקופ; (2) פרומט/מנדט לכל אחד מהם; (3) סדר תלויות והגשות — כך שהתוצר הסופי הוא מוצר שלם ועובד, לא רק תיעוד.

---

**log_entry | TEAM_10 | PROCEDURES_AND_GATE_ACTIONS_UPDATE_REQUIRED | DRAFT | 2026-01-30**
