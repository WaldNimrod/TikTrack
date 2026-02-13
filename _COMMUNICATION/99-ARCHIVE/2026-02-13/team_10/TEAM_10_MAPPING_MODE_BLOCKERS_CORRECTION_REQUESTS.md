# 📋 דרישות תיקון — ממצאים חוסמים (Team 90 MAPPING_MODE Review)

**מאת:** Team 10 (The Gateway)  
**אל:** צוות 40, צוות 20+30, צוות 10 (משימות עצמיות)  
**תאריך:** 2026-02-10  
**סטטוס:** 🔴 **חובה — אין מעבר לשלב הקידוד לפני השלמה**  
**מקור:** משוב צוות 90 — MAPPING_MODE Review (Updated); אישור: `TEAM_10_TO_TEAM_90_MAPPING_MODE_REVIEW_ACKNOWLEDGMENT.md`

---

## 1. צוות 40 — תיקונים נדרשים

### 1.1 ממצא 1 — SSOT פורמלי לפלטה המורחבת

**בעיה:** Team 40 מצהיר על "הרחבת פלטה" ועל כלל שכל הצבעים מבוססי פלטה — אך **אין קובץ SSOT מעודכן** שמגדיר את הפלטה החדשה בפועל.

**נדרש:**
- **קובץ SSOT רשמי** עם משתני הפלטה (צפוי: `ui/src/styles/phoenix-base.css` או מסמך ייעודי).
- **ציון שורות ו/או גרסה** מעודכנת (למשל גרסת קובץ או תאריך עדכון אחרון).
- אם הפלטה החדשה עדיין **לא נמצאת בקוד** — **קישור למסמך אדריכלית/SSOT** שמגדיר את הפלטה החדשה.
- **לוג שינויים קצר:** אילו משתנים נוספו ו/או שונו (רשימה או טבלה).

**מסירה:** עדכון ב־`TEAM_40_TO_TEAM_10_MAPPING_MODE_COMPLETE.md` או מסמך נפרד (למשל `PALETTE_SSOT.md`) + הפניה ב־DNA_BUTTON_SYSTEM ו־בדוח ההשלמה.

---

### 1.2 ממצא 2 — DNA_BUTTON_SYSTEM ו־SSOT יחיד

**בעיה:** DNA_BUTTON_SYSTEM מסתמך על `D15_DASHBOARD_STYLES.css` + `D15_IDENTITY_STYLES.css` לצבעים — **מפזר** את ה־SSOT במקום לרכז ב־`phoenix-base.css`.

**נדרש:**
- **החלטה מפורשת:** מהו ה־**SSOT הרשמי היחיד** לפלטה (צפוי: `phoenix-base.css`).
- **התאמת DNA_BUTTON_SYSTEM:** כל צבע/משתן יופנה **רק** ל־SSOT היחיד (למשל כל ה־variables מוגדרים או מיובאים מ־phoenix-base).
- **רשימת קבצים** שדורשים תיקון — שימוש ב־hex או צבעים חיצוניים שלא מהפלטה (למשל רשימה ב־CSS_RETROFIT_PLAN או במסמך נפרד).

**מסירה:** עדכון `DNA_BUTTON_SYSTEM.md` + עדכון `CSS_RETROFIT_PLAN.md` או מסמך רשימת קבצים לתיקון.

---

### 1.3 ממצא 3 — Admin Design Dashboard ב־CSS_RETROFIT_PLAN

**בעיה:** העמוד **/admin/design-system** (Type D) **לא מופיע** ב־CSS_RETROFIT_PLAN. חייב להיות מיפוי גם עבורו (גם אם קובץ חדש).

**נדרש:**
- **לציין** את ה־CSS/קובץ הרלוונטי לעמוד Admin Design Dashboard.
- **להוסיף** את העמוד/הקובץ ל־`CSS_RETROFIT_PLAN.md` (למשל סעיף Priority 2 או "עמודים חדשים").

**מסירה:** עדכון `_COMMUNICATION/team_40/CSS_RETROFIT_PLAN.md`.

---

### 1.4 ממצא 4 — עקביות תאריכים

**בעיה:** בדוח Team 40 מופיע "Last Updated 2026-01-31" בעוד המסירה ב־2026-02-10. יש לאשר שהמסמך משקף את **הגרסה העדכנית** אחרי היישור הוויזואלי.

**נדרש:**
- **לעדכן** "Last Updated" ל־2026-02-10 (או תאריך היישור הוויזואלי).
- **או** להבהיר במפורש במסמך: "מסמך זה משקף גרסה מעודכנת לאחר יישור ויזואלי (2026-02-10); פלטה וכפתורים — ראה סעיף שינוי מהותי."

**מסירה:** עדכון `_COMMUNICATION/team_40/TEAM_40_TO_TEAM_10_MAPPING_MODE_COMPLETE.md`.

---

## 2. צוות 20 + צוות 30 — תיקונים נדרשים

### 2.1 ממצא 5 — Broker API פר־משתמש + defaults JSON

**בעיה:** ב־DATA_MAP_FINAL.json עדיין נשמע כאילו הרשימה יכולה להיות distinct/Reference **כללית**. הדרישה המחייבת: **פר־משתמש** + **defaults JSON**.

**נדרש בתוך `DATA_MAP_FINAL.json` (ו/או בדוחות מסירה):**
- **"API מחזיר ברוקרים לפי user_id/tenant"** — כלומר ה־endpoint סינון לפי משתמש/טננט.
- **"אם אין נתונים — נטענים defaults JSON"** — התנהגות ברורה: אין נתונים per user → טעינת קובץ defaults (JSON).
- **אין fallback ל־text input** — כבר מקובע; לוודא שזה מופיע במפורש במיפוי ובהנחיות.

**מסירה:** עדכון `_COMMUNICATION/team_20/DATA_MAP_FINAL.json` + עדכון דוחות מסירה (Team 20, Team 30) בהתאם.

---

### 2.2 ממצא 7 — Admin Role: מקור ו־Guard

**בעיה:** ADR‑013 מחייב JWT role עבור Admin (Type D), אך **אין מקור role בקוד/SSOT**.

**נדרש:**
- **מיפוי מלא:** מקור ה־role (JWT claim — שם השדה, איך נשלח מהשרת; או DB/config).
- **Guard behavior:** איך נבדק בצד Frontend/Backend; מה קורה למשתמש לא־מנהל (redirect ל־Home או 403).

**מסירה:** מסמך מיפוי קצר (למשל סעיף ב־DATA_MAP או מסמך נפרד `ADMIN_ROLE_MAPPING.md`) תחת `_COMMUNICATION/team_20/` או `team_30/`; העתקה/סיכום ב־תוכנית העבודה (Team 10).

---

## 3. Team 10 — משימות עצמיות

### 3.1 ממצא 6 — Routes SSOT (React vs HTML)

**בעיה:** ב־`routes.json` מופיעים `login.html`, `register.html`; בפועל **React Router** עובד עם `/login`, `/register`, `/reset-password`. חסר SSOT אחיד.

**נדרש:**
- **קביעת SSOT אחיד:** האם routes.json הוא המקור ל־paths בלבד, או שמסמך אחר (למשל תוכנית העבודה) מגדיר את המיפוי React ↔ path.
- **עדכון טבלת Routes** בתוכנית העבודה (`TEAM_10_VISUAL_GAPS_WORK_PLAN.md` סעיף 4.6) כך שתכלול במפורש: path, קובץ/רכיב React אם רלוונטי, טיפוס A/B/C/D.
- **לקבע:** Home = `/` = index.html (או המסמך המקביל ל־React אם יש).

**מסירה:** עדכון `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` (סעיף 4.6) + עדכון `routes.json` או מסמך SSOT ל־routes — והפניה ברורה במסמך אחד.

---

## 4. סדר טיפול והגשה

1. **צוות 40:** תיקונים 1–4 (SSOT פלטה, DNA SSOT יחיד, Admin ב־CSS_RETROFIT, תאריכים).
2. **צוות 20+30:** תיקונים 5 ו־7 (Broker API per-user + defaults; Admin role mapping).
3. **Team 10:** תיקון 6 (Routes SSOT + טבלה).

לאחר השלמה — להודיע ל־Team 10; Team 10 יעדכן את דוח המסכם ויעביר **לבדיקה חוזרת** צוות 90.

---

**Team 10 (The Gateway)**  
**log_entry | BLOCKERS_CORRECTION_REQUESTS | ISSUED | 2026-02-10**
