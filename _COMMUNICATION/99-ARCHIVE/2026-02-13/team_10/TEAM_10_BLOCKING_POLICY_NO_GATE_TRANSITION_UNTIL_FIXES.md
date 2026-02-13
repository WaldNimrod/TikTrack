# 🚫 Team 10: מדיניות חוסמת — אין מעבר לשער הבא לפני תיקון כל הבעיות

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-01-30  
**סטטוס:** 🔒 **מחייב — SSOT למדיניות**  
**הקשר:** חובה לתקן את כל הבעיות שזוהו לפני מימוש מעבר לשער הבא.

---

## 1. עקרון

- **אין מעבר לשער הבא** (מעבר משער א' לשער ב', או כל שער עוקב) **לפני שכל הבעיות שזוהו בדוחות QA/ביקורת תוקנו**.
- **הודעות תיקון** יוצאות מהשער (Team 10) **לצוותים הרלוונטיים** עם הפניה למסמכי המשוב המפורטים (Team 50 / ארטיפקטים).
- **אין אישור "מעבר לשער"** לפני:
  1. השלמת כל התיקונים על ידי הצוותים.
  2. דיווח השלמה ל־Team 10 (או ל־Team 50 לפי הנהלים).
  3. אימות/הרצת בדיקות מחדש (לפי נהלי QA) — **0 SEVERE** ו־התנאים של השער מתקיימים.

---

## 2. רשימת בעיות שזוהו (מקורות)

להלן **מקורות הממצאים**; הודעות התיקון המפורטות לצוותים מפנות אליהם.

| מקור | תיאור | צוותים |
|------|--------|--------|
| **Gate B — משוב מפורט** | `_COMMUNICATION/team_50/TEAM_50_GATE_B_DETAILED_ERROR_REPORT_AND_VERIFICATION_GUIDE.md` | 20, 30 |
| **Gate B Re-Run Evidence** | `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_GATE_B_RE_RUN_EVIDENCE.md` — SEVERE: headerLoader, favicon, import.meta | 30 / תשתית |
| **D16_ACCTS_VIEW — Clean Slate** | `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_D16_ACCTS_VIEW_QA_COMPLETE.md`, `TEAM_50_TO_TEAM_30_D16_ACCTS_VIEW_QA_ISSUES.md` | 30 |

---

## 3. פירוט לפי צוות (תמצית)

- **Team 30:**  
  - נתיבי אייקונים בדפי HTML (D16, D18, D21) — `../../../public/images` → `/images/...` (מקור: Gate B Detailed Report).  
  - Clean Slate Rule ב־D16 — הסרת inline handlers, inline script, inline style (מקור: TEAM_50_TO_TEAM_30_D16_ACCTS_VIEW_QA_ISSUES).  
  - אם רלוונטי: תיקון SEVERE ב־headerLoader / navigationHandler בדפי HTML (מקור: Gate B Re-Run).

- **Team 20:**  
  - `GET /api/v1/brokers_fees/summary` מחזיר 400 — יש להפוך פרמטרים לאופציונליים ולהחזיר 200 גם בלי פרמטרים (מקור: Gate B Detailed Report).

---

## 4. הודעות שהוצאו

| צוות | מסמך הודעה |
|------|-------------|
| **30** | `TEAM_10_TO_TEAM_30_FIX_REQUESTS_BEFORE_NEXT_GATE.md` |
| **20** | `TEAM_10_TO_TEAM_20_FIX_REQUESTS_BEFORE_NEXT_GATE.md` |
| **כולם** | `TEAM_10_TO_ALL_TEAMS_BLOCKING_FIXES_MANDATE.md` |

---

## 5. לאחר התיקונים

1. צוותים מדווחים השלמה ל־Team 10 (או ל־Team 50 לפי הנהלים).  
2. Team 50 מריצה E2E/בדיקות מחדש לפי הנהלים.  
3. Team 10 מאשר מעבר לשער הבא **רק** כאשר כל הממצאים סגורים ו־0 SEVERE (ותנאי השער מתקיימים).

---

**Team 10 (The Gateway)**  
**log_entry | BLOCKING_POLICY | NO_GATE_TRANSITION_UNTIL_FIXES | 2026-01-30**
