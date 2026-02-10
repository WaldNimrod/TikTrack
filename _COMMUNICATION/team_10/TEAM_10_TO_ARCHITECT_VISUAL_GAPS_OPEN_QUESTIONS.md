# דוח שאלות פתוחות — סבב חוסרים ויזואליים (Visual Gaps) — להחלטת אדריכל

**אל:** אדריכל (Gemini Bridge / נמרוד ולד)  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**הקשר:** תוכנית העבודה המאוחדת `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` — נדרשות החלטות לפני מימוש מלא  
**סטטוס:** 🔴 **נדרש החלטה — חסימת ביצוע במשימות מסוימות**  
**סקופ:** כל המשימות + **כל העמודים הקיימים במערכת** (רשימה מלאה להלן).

**דוח השלמה (מידע משלים):** `TEAM_10_VISUAL_GAPS_SUPPLEMENT_INFO_REPORT.md` — רשימת 7 פריטי השלמה מפורטת; החלטות עליהם משלימות את הדוח הזה.

**מסמך זה מעודכן — לעיון Team 90 לפני הגשה לאדריכלית.**

---

### מקור Auth Model (החלטות אדריכלית)

**המסמך היחיד שמגדיר Auth Model בהחלטות אדריכלית:** `ARCHITECT_PHASE_2_FINAL_CONSOLIDATED_VERDICT.md`.

**החלטות מחייבות משם:** Redirect ל־**Home** לכל אורח בכל עמוד **מלבד** Home / Login / Register; **User Icon** חייב להיות Success או Warning.

**אין בהחלטות (נדרש להשלים לפני הגשה):** reset-password כ־Open; Admin-only (טיפוס D); Rich-text editor; Broker list source; Button classes SSOT; Admin Design Dashboard route.

---

## 1. מטרת הדוח

לפי דרישת הנהלים (וידוא כל המידע, ההחלטות והפרטים לביצוע מסודר ומלא ללא ניחושים; בדיקות מקדימות לכל משימה):  
מסמך זה מרכז **שאלות פתוחות** ו**חוסרי מידע** שדורשים החלטת אדריכל לפני או במהלך ביצוע התוכנית המאוחדת (שער אוטנטיקציה + Visual Gaps). ללא החלטות — צוותים לא יבצעו קוד מימוש במשימות המסומנות.

---

## 2. שער אוטנטיקציה — 4 טיפוסים (A/B/C/D) — החלטות נדרשות

### 2.1 רשימת כל העמודים הקיימים במערכת (סקופ מלא)

מקור: `ui/public/routes.json` (גרסה 1.1.2) + `TT2_OFFICIAL_PAGE_TRACKER`.

| # | Route / Path | קובץ / מזהה | תיאור |
|---|--------------|-------------|--------|
| 1 | /login | login.html | כניסה |
| 2 | /register | register.html | הרשמה |
| 3 | /reset-password | PasswordResetFlow.jsx (blueprint: D15_RESET_PWD.html); React route ב־AppRouter.jsx | שחזור סיסמה — **נדרש לאשר כ־Open** (ראה להלן) |
| 4 | Home (דאשבורד/אינדקס) | D15_INDEX / index | דאשבורד |
| 5 | Profile | D15_PROF_VIEW | פרופיל |
| 6 | /trading_accounts | trading_accounts.html (D16) | חשבונות מסחר |
| 7 | /brokers_fees | brokers_fees.html (D18) | עמלות ברוקרים |
| 8 | /cash_flows | cash_flows.html (D21) | תזרים מזומנים |
| 9 | /trade_plans | trade_plans.html | תוכניות מסחר |
| 10 | /trades_history | trades_history.html | היסטוריית עסקאות |

**החלטה נדרשת — מיפוי טיפוס לכל עמוד:**

| טיפוס | הגדרה | עמודים מוצעים (לא סופי) |
|--------|--------|--------------------------|
| **A) Open** | ציבורי; Header לא מוצג | 1, 2, 3 (login, register, reset-password) |
| **B) Shared** | אורח + מחובר; שני containers ב־Home | 4 (Home בלבד) |
| **C) Auth-only** | דורש התחברות; אורח → הפניה ל־Home | 5, 6, 7, 8, 9, 10 (אלא אם יוגדרו כ־D) |
| **D) Admin-only** | למשתמש מנהל בלבד | **להחלטה — אילו עמודים** |

**שאלות להחלטה:**
1. **אישור או תיקון** מיפוי A/B/C לכל עמוד מהטבלה למעלה.  
2. **reset-password (3):** **לאשר במפורש:** reset-password כ־**Open page** (אורח יכול לגשת בלי redirect ל־Home), ולהוסיף לטבלת Routes הרשמית בתוכנית. (בקוד: קיים route `/reset-password`, רכיב `PasswordResetFlow.jsx`, blueprint `D15_RESET_PWD.html` — חוסר התאמה SSOT ↔ קוד.)  
3. **טיפוס D (Admin-only):** אילו routes/עמודים יוגדרו כ־admin-only? **מקור role:** אין בקוד/תיעוד — נדרשת החלטה על מקור הרשאות (JWT claim / DB / config) + איך נבדק + **redirect/403** (משתמש לא־מנהל → Home או 403).  
4. **התנהגות redirect ל־D:** משתמש לא־מנהל שנכנס ל־admin-only — **הפניה ל־Home** או **403 Forbidden** (או אחר)?  
5. **Profile (5):** להישאר C) Auth-only או להעביר ל־D) Admin-only?

---

## 3. שאלות לפי משימה ויזואלית

### 3.1 משימה 1: שדות Select vs Text — רשימת ברוקרים (Broker)

| שאלה | פרט |
|------|------|
| **מה חסר** | מקור אמת ל־"valid broker list" לשדה Broker בטפסים (Trading Accounts, Brokers Fees). |
| **מצב נוכחי** | ב־DB: `broker` הוא VARCHAR (חופשי). אין ב-API endpoint לרשימת ברוקרים; אין ENUM או טבלת עזר. |
| **אפשרויות** | (א) **API חדש:** GET רשימת ברוקרים (למשל distinct או טבלת עזר). (ב) **טבלת עזר ב־DB.** (ג) **רשימה סטטית** ב־SSOT (כולל **ברירות מחדל JSON** בפרויקט). (ד) **השארת free-text** — לא עומד בדרישת Team 90 (select דינמי). |
| **החלטה נדרשת** | איזו אפשרות לאמץ (API / DB / סטטי); אם סטטי — איפה מוגדר (כולל default JSON). **הגדרת אחריות:** Team 20 (API/DB) או Team 30 (לוגיקה/UI). |

---

### 3.2 משימה 2: Rich Text Editor — Description/Notes

| שאלה | פרט |
|------|------|
| **מה חסר** | תקן/ספרייה ל־Rich Text לשדות description/notes. |
| **מצב נוכחי** | ב־cashFlowsForm: `description` כ־textarea. אין רכיב Rich Text מוגדר. |
| **אפשרויות** | (א) **ספרייה:** TinyMCE / Quill / CKEditor / TipTap / אחר. (ב) **מינימלי:** bold/italic/lists (משקל קל). (ג) **textarea + markdown** — לא עומד בדרישת "rich text UI". |
| **החלטה נדרשת** | **לצרף 2–3 אופציות** עם יתרונות/חסרונות + **המלצה** (Team 90 יספק הצעת מסגרת). איזה רכיב/סטנדרט סופי; מגבלות אבטחה (סניטיזציה, אין HTML מסוכן). |

---

### 3.3 משימה 3: Modal Buttons Order + RTL

אין שאלה פתוחה — יש מספיק פרט במסמך (DOM order / row-reverse). אם תרצה להגביל לפתרון מסוים — נשמח להנחיה.

---

### 3.4 משימה 4: צבע כותרת מודל לפי Entity (Light Variant)

| שאלה | פרט |
|------|------|
| **מה חסר** | משתני CSS ל־entity D18 (Brokers Fees), D21 (Cash Flows). |
| **מצב נוכחי** | ב־phoenix-base.css: קיימים trading-account, trades, ticker, research, execution; **חסרים** brokers_fees, cash_flows. |
| **אפשרויות** | (א) **הוספת משתנים:** `--entity-brokers-fees-color`, `--entity-cash-flows-color` (וגוון בהיר). (ב) **מיפוי ל־entity קיים** (למשל trades/execution). |
| **החלטה נדרשת** | צבעים (hex/var) ל־Brokers Fees ו־Cash Flows; או אישור מיפוי ל־entity קיים. |

---

### 3.5 משימה 5: מערכת מחלקות כפתורים גלובלית

| שאלה | פרט |
|------|------|
| **מה חסר** | רשימה רשמית של מחלקות כפתור (למשל .phoenix-btn-primary, .phoenix-btn-secondary) ומתי להשתמש. |
| **מצב נוכחי** | שימוש ב־`.phoenix-modal__save-btn`, `.phoenix-modal__cancel-btn`; ייתכן ad-hoc. אין SSOT אחד. |
| **אפשרויות** | (א) **תיעוד קיים** — להפנות ולוודא יישום. (ב) **הגדרה חדשה** — Team 40 מגדיר **מסמך SSOT למחלקות כפתור** (שמות + שימוש) + תיעוד. |
| **החלטה נדרשת** | **מסמך מחלקות כפתור (שמות + שימוש)** — **להעביר לאישור אדריכלית.** האם קיים תקן כתוב; אם לא — לאשר הגדרת תקן (Team 40). |

---

### 3.6 משימה 6: דף טבלת צבעים דינמית (Admin Design Dashboard)

| שאלה | פרט |
|------|------|
| **מה חסר** | העמוד הוגדר **Admin-only** אך **בלי route מוסכם**. |
| **נדרש** | **קביעת route רשמי** (למשל `/admin/design-dashboard` או `/dev/color-palette`) + **קישור להחלטת Admin-only** (מקור role — פריט 3 בדוח השלמה). |
| **החלטה נדרשת** | לאשר route + לוודא חיבור להחלטת טיפוס D. |

---

### 3.7 משימה 7: Header תמיד אחרי Login → Home

אין שאלה פתוחה — דרישה ברורה; בדיקה מקדימה = תיעוד זרימה. אם יתגלה חוסר מידע — יעודכן בדוח.

---

## 4. שאלות כלליות

| נושא | שאלה |
|------|------|
| **סדר ביצוע** | האם סדר הביצוע (שער 0 → 7 → 1,2 → 3→4→5→6) מאושר? |
| **Design Fidelity** | האם כל משימה חייבת לעבור שלב "דיוק עיצוב" מול Visionary לפני Gate B, או רק subset? |
| **בדיקות מקדימות** | האם יש הנחיה נוספת לבדיקות מקדימות (מיפוי/תיעוד) מעבר למה שמופיע בתוכנית? |

---

## 5. רשימת מידע משלים (דוח השלמה) — 7 פריטים

כל פריט מפורט ב־`TEAM_10_VISUAL_GAPS_SUPPLEMENT_INFO_REPORT.md`. כאן — סיכום להחלטה:

| # | נושא | נדרש להחלטה/השלמה |
|---|------|---------------------|
| 1 | **שחזור סיסמה** | קובץ חסר — נתיב אמיתי או החלטה ליצור קובץ + מיקום |
| 2 | **Home — SSOT** | טבלת Routes רשמית + הצהרה מפורשת: Home = `/` = index.html |
| 3 | **Admin-only — מקור role** | מקור הרשאות מנהל (JWT/DB/config) + איך נבדק + redirect/403 |
| 4 | **Rich-text editor** | בחירת כלי (TipTap/Quill/TinyMCE) + מדיניות סניטיזציה (allowed tags) |
| 5 | **רשימת ברוקרים** | API חדש / טבלת עזר / רשימה סטטית ב־SSOT + מי אחראי |
| 6 | **מחלקות כפתור — SSOT** | מסמך SSOT למחלקות כפתור + בעלות (Team 40) |
| 7 | **עמוד צבעים דינמיים** | Admin-only — חיבור להחלטת פריט 3 + route מוסכם |

החלטות על פריטים אלה יועדכנו בדוח ההשלמה ובתוכנית העבודה.

---

## 6. צעדים לאחר החלטות

- Team 10 יעדכן את `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` בהתאם (מיפוי A/B/C/D, החלטות משימות).  
- Team 10 יעדכן את `TEAM_10_VISUAL_GAPS_SUPPLEMENT_INFO_REPORT.md` — סטטוס כל פריט (✅ לאחר החלטה).  
- החלטות יקודמו ל־documentation/ לפי נוהל (GIN/ADR).  
- צוותים (20, 30, 40) יקבלו הודעות מעודכנות עם הפרטים לביצוע.

---

**Team 10 (The Gateway)**  
**log_entry | TO_ARCHITECT | VISUAL_GAPS_OPEN_QUESTIONS | UPDATED | 2026-02-10 — סקופ מלא, 4 טיפוסים, דוח השלמה (7 פריטים)**
