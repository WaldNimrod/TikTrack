# רשימת משימות משמעותיות — לצד (Backlog)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-11  
**מטרה:** משימות **גדולות או משמעותיות** — לא נסגרות בסבב המהיר; לנייצר מהן רשימה מסודרת ולתכנן בנפרד.  
**סבב זנבות:** `TEAM_10_QUICK_ROUND_TAILS.md`.

---

## 1. Code Evidence (§4.5) — תיקוני קוד

**מקור:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` §4.5.

| # | נושא | דרישה | אחראי | הערה |
|---|------|--------|--------|------|
| S1 | **AppRouter.jsx** | Home לא ב־ProtectedRoute (או redirect נכון ל־Home לא ל־/login). | Team 30 | ✅ **נסגר** — מאומת. תשובה: `TEAM_30_TO_TEAM_10_CODE_EVIDENCE_AND_AB_CD_RESPONSE.md` |
| S2 | **ProtectedRoute.jsx** | אורח ב־auth-only → redirect ל־**Home** (לא ל־/login). | Team 30 | ✅ **נסגר** — מאומת. תשובה: כנ"ל |
| S3 | **HomePage.jsx** | שני containers — Guest (אורח) + Logged-in (מחובר); אין עמודים נפרדים. | Team 30 | ✅ **נסגר** — מאומת. תשובה: כנ"ל |
| S4 | **Header — אייקון ברירת מחדל** | אייקון לא שחור (unified-header / phoenix-header.css). | Team 40 (בתיאום 30) | ✅ **נסגר** — מאומת. תשובה: `TEAM_40_TO_TEAM_10_HEADER_ICON_AND_BATCH1_RESPONSE.md` |

---

## 2. פיצ'רים והרחבות

| # | נושא | תיאור | אחראי | הערה |
|---|------|--------|--------|------|
| S5 | **Broker Select ב־D21** | הוספת dynamic select מ־GET /api/v1/reference/brokers ב־Cash Flows (אם נכנס ל־scope). | Team 30 | **בוטל** — יגיע משהו שונה בקרוב |
| S6 | **אימות מלא A/B/C/D (T30.6)** | וידוא ותיקון כל סטייה: Redirect C→Home, Type B שני containers, User Icon success/warning. | Team 30 | ✅ **נסגר** — מאומת. תשובה: `TEAM_30_TO_TEAM_10_CODE_EVIDENCE_AND_AB_CD_RESPONSE.md` |

---

## 3. עיצוב והעברת בעלות

| # | נושא | תיאור | אחראי | הערה |
|---|------|--------|--------|------|
| S7 | **Header Batch 1 (30→40)** | אישור ובעלות Team 40 על תיקוני Header: RTL תפריט רמה 2, גובה כפתורים, header-container padding. | Team 40 (אישור); Team 30 (העברת ידע) | ✅ **נסגר** — מאושר/בבעלות Team 40. תשובה: `TEAM_40_TO_TEAM_10_HEADER_ICON_AND_BATCH1_RESPONSE.md` |
| S8 | **פערים ויזואליים נוספים** | ריכוז כל הממצאים מהבדיקה הוויזואלית; שיוך ל־30/40 וסגירה. | Team 10 (ריכוז); 30/40 (ביצוע) | ✅ **רשימה הוקמה:** `TEAM_10_VISUAL_GAPS_FINDINGS_LOG.md` — ממצאים יירשמו שם |

---

## 4. החלטות אדריכל / מוצר (אם לא נסגרו בסבב המהיר)

| # | נושא | תיאור | הערה |
|---|------|--------|------|
| S9 | **מיפוי A/B/C/D לכל עמוד** | החלטת אדריכל סופית לכל route + התנהגות ל־D. | ✅ **נסגר** — אורח → Home; משתמש לא מורשה → הודעת חסימה. Work Plan §4.7 [x]; קוד ב־ProtectedRoute.jsx. |
| S10 | **/profile — טיפוס C או D** | החלטה סופית + עדכון ROUTES_MAP. | ✅ נסגר (Q10 — טיפוס C; `TEAM_10_DECISION_PROFILE_ROUTE.md`) |

---

## 5. עתידי

| # | נושא | תיאור | הערה |
|---|------|--------|------|
| S11 | **user_tier / required_tier (T20.4)** | תמיכה ב־JWT ו־routes כשהמוצר ידרוש. | מוכנות לעתיד — לא לתכנון נוכחי |

---

## 6. עדכון הרשימה

- **הוספה:** ממצאים חדשים מהבדיקה הוויזואלית או מתוך תוכניות — להוסיף כאן עם מספר S וקטגוריה.
- **הסרה:** משימה שנסוגה — לסמן "נסגר" או להעביר לארכיון; לעדכן STATE doc.
- **תכנון:** כשמתחילים סבב על משימה משמעותית — לציין תאריך התחלה ואחראי ברור.

---

**Team 10 (The Gateway)**  
**log_entry | SIGNIFICANT_TASKS_BACKLOG | 2026-02-11**
