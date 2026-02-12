# תרחישים לבדיקה ויזואלית — שער ג' (Visionary)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-11  
**מקור:** `TT2_QUALITY_ASSURANCE_GATE_PROTOCOL` (שער ג' — אישור ויזואלי סופי), `TT2_DESIGN_FIDELITY_FIX_PROTOCOL`, `TEAM_10_VISUAL_GAPS_WORK_PLAN`  
**מטרה:** רשימת תרחישים לבדיקה ידנית-ויזואלית בדפדפן — השוואה ל-Blueprint, UX, מראה ותחושה.

---

## 1. עמודי Open (Type A) — ללא Header

| # | תרחיש | מה לבדוק |
|---|--------|----------|
| V1 | **/login** | אין Header; עמוד מלא (לוגו/טופס); עיצוב תואם Blueprint; שדות ו-Labels קריאים; כפתור Submit ברור. |
| V2 | **/register** | אין Header; טופס רישום; שדות מסודרים; הודעות validation (אם מוצגות) קריאות. |
| V3 | **/reset-password** | אין Header; זרימת איפוס סיסמה; שלבים ברורים; כפתורים וקישורים נראים. |

---

## 2. Home (Type B — Shared)

| # | תרחיש | מה לבדוק |
|---|--------|----------|
| V4 | **אורח ב־/** | מוצג **Guest Container** בלבד (תוכן שיווקי/הסבר); אין Header? — לפי ADR: ב-Type B Header **מוצג**; אורח רואה את ה-Header עם User Icon ב-**Warning** (לא שחור). |
| V5 | **מחובר ב־/** | לאחר Login → ניווט ל־Home; מוצג **Logged-in Container** (נתונים/דאשבורד); User Icon ב-**Success** (ירוק). |
| V6 | **מעבר Login → Home** | לחיצה על Login, התחברות מוצלחת → redirect ל־Home; **Header נשאר** ולא נעלם; תצוגה מחליפה מ-Guest ל-Logged-in. |

---

## 3. Header ו-User Icon (כל העמודים מלבד A)

| # | תרחיש | מה לבדוק |
|---|--------|----------|
| V7 | **Header תמיד נראה** | בכל עמוד C/B/D — Header קיים; לוגו, ניווט, User Icon במקום עקבי. |
| V8 | **User Icon — צבע** | מחובר: אייקון ב-**Success** (ירוק). אורח: אייקון ב-**Warning** (כתום/צהוב). **אסור:** אייקון שחור. |
| V9 | **RTL / Layout** | Header מיושר נכון ל-RTL; כפתורים וטקסט לא "שבורים". |

---

## 4. עמודי Auth-only (Type C) — D16, D18, D21

| # | תרחיש | מה לבדוק |
|---|--------|----------|
| V10 | **אורח נכנס ל־/trading_accounts** | מופנה ל־**Home** (לא ל־/login); הודעת redirect או ניווט ברור. |
| V11 | **אורח נכנס ל־/brokers_fees או /cash_flows** | כמו V10 — redirect ל־Home. |
| V12 | **D16 — Trading Accounts (מחובר)** | טבלה/רשימה; כפתור הוספה; **מודל הוספה/עריכה:** שדה **Broker** כ־**dropdown** (לא טקסט חופשי); הרשימה נטענת מ-API (כ־15 אופציות). |
| V13 | **D18 — Brokers Fees (מחובר)** | כמו D16 — Broker כ־dropdown מ-API; סדר כפתורים במודל: **Cancel ימין, שמור שמאל** (RTL). צבע כותרת מודל לפי Entity (אם הוגדר). |
| V14 | **D21 — Cash Flows (מחובר)** | שדה **Description** כ־**Rich-Text Editor** (TipTap): סרגל כלים; כפתור "סגנון" מוסיף רק צבעים (Success/Warning/Danger/Highlight) — **בלי** Inline Style גלוי; שמירה וטעינה — התוכן מוצג עם המחלקות (.phx-rt--*). |
| V15 | **מודלים — כפתורים ו-RTL** | בכל מודל (D16/D18/D21): כפתורים עם עיצוב אחיד (.phx-btn); ב-RTL סדר הגיוני (Cancel ימין, Confirm שמאל). |
| V16 | **מודלים — צבע כותרת** | כותרת המודל (Entity) בצבע לפי מפרט (צבעי Entity מהפלטה). |

---

## 5. Design System (Type D — Admin only)

| # | תרחיש | מה לבדוק |
|---|--------|----------|
| V17 | **מנהל נכנס ל־/admin/design-system** | הדף נטען; **טבלאות** מוצגות: **Rich-Text Styles** (מילון .phx-rt--success, warning, danger, highlight) ו-**Color Variables** (משתני פלטה). עיצוב מסודר וקריא. |
| V18 | **אורח מנסה /admin/design-system** | מופנה (redirect) או 403; **לא** רואה את תוכן הדף. |
| V19 | **משתמש רגיל (לא admin) מנסה /admin/design-system** | כמו V18 — מופנה; לא נגיש. |

---

## 6. Rich-Text (TipTap) — התנהגות ויזואלית

| # | תרחיש | מה לבדוק |
|---|--------|----------|
| V20 | **הזנת טקסט + סגנון Success** | בוחרים "סגנון" → Success; הטקסט בירוק; שמירה → רענון — הצבע נשמר ונראה זהה. |
| V21 | **הזנת טקסט + סגנון Warning/Danger/Highlight** | כל ארבעת הסגנונות נראים שונה (ירוק, כתום, אדום, highlight); אין `style="..."` גלוי ב-DOM בתצוגה (רק class). |
| V22 | **קישור ב-Rich-Text** | הוספת לינק; שמירה וטעינה — הלינק מוצג ופעיל. |

---

## 7. רספונסיביות ו-Breakpoints (במידת הרלוונטיות)

| # | תרחיש | מה לבדוק |
|---|--------|----------|
| V23 | **מסך צר (מובייל)** | טבלאות/טפסים לא יוצאים מהמסך; כפתורים ומודלים נגישים; Header מתכווץ/מתאים. |
| V24 | **מסך רחב** | תוכן ממורכז/מגבול רוחב סביר; אין "מתיחה" מוגזמת. |

---

## 8. סיכום — Checklist מהיר

- [ ] V1–V3: Open (ללא Header)
- [ ] V4–V6: Home (Guest / Logged-in / מעבר)
- [ ] V7–V9: Header + User Icon
- [ ] V10–V16: Auth-only (redirect, D16/D18/D21, Broker dropdown, Rich-Text, מודלים)
- [ ] V17–V19: Design System (Admin only + redirect)
- [ ] V20–V22: Rich-Text סגנונות וקישורים
- [ ] V23–V24: רספונסיביות (אופציונלי לפי זמן)

---

**הפניה:** Blueprint / דפי D15–D21 בתיקיית blueprints או documentation; `TT2_DESIGN_FIDELITY_FIX_PROTOCOL` — תיקון סטיות.  
**תוצר:** אישור סופי (Sign-off) או רשימת תיקונים ויזואליים ל-Team 10.

**Team 10 (The Gateway)**  
**log_entry | VISUAL_TEST_SCENARIOS_GATE_C | 2026-02-11**
