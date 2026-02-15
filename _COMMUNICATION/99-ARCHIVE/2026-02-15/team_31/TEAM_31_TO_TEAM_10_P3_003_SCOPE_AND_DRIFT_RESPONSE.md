# Team 31 → Team 10: P3-003 — תשובה: Scope + Drift (אישור ורשימת Drift)

**from:** Team 31 (Blueprint)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-15  
**re:** TEAM_10_TO_TEAM_31_P3_003_FOLLOW_UP_WHAT_IS_REQUIRED — תשובה

---

## 1. אישור המטריצה

**Team 31 מאשרים את מטריצת Scope + Drift** כפי שמתועדת ב־  
`TEAM_10_P3_003_BLUEPRINT_SCOPE_AND_DRIFT_MATRIX.md`.

- **IN SCOPE** (D15–D23, user_tickers, alerts, notes, executions, preferences) — תואם את מה שאנחנו מכירים ואת הבלופרינטים שהושלמו/מתוכננים במסגרת Batches 3–4.
- **OUT OF SCOPE** (research.*, planning.*, tracking.*, management מעבר ל־tickers, data_import, tag_management) — מקובל עלינו; עמודים אלה קיימים אצלנו כ־Blueprint או כ־"סלוט" באינדקס אך אינם נדרשים לסגירת P3-003 או ל־Kickoff Batch 3–4.

אין הערות או תיקונים למטריצה.

---

## 2. רשימת Drift — עמודים/Blueprint שלא ב־Roadmap v2.1 (Batches 3–4)

לצורך השלמת תיעוד, להלן רשימת פריטים שקיימים באינדקס הסאנדבוקס שלנו (תבניות + עמודים + מודולים) ומסומנים במטריצה כ־**OUT OF SCOPE** או שלא מפורשים ב־Roadmap v2.1 Batches 3–4.

### 2.1 תבניות (Templates)

| קובץ | הערה |
|------|------|
| D15_PAGE_TEMPLATE_V2.html | תבנית בסיסית — משותפת לכל העמודים |
| D15_PAGE_TEMPLATE_V3.html | תבנית V3 נעולה — IN SCOPE (תמיכה ב־D15) |
| D15_PAGE_TEMPLATE_FULL_V2.html | תבנית מלאה V2 — תמיכה כללית |

### 2.2 עמודים — IN SCOPE (מתיישרים עם המטריצה)

כל אלה מופיעים במטריצה כ־IN SCOPE; הבלופרינטים קיימים והושלמו/באישור:

- index, login, register, reset_password, user_profile (D15)
- trading_accounts (D16), brokers_fees (D18), cash_flows (D21)
- tickers (D22)
- user_ticker, alerts, notes, executions (data.*)
- preferences (סלוט — לא התחיל)

### 2.3 עמודים — OUT OF SCOPE (Drift לתיעוד)

| Blueprint / עמוד | התאמה למטריצה | סטטוס אצלנו |
|-------------------|----------------|-------------|
| trade_plans_BLUEPRINT.html | planning.* (OUT OF SCOPE) | הושלם |
| trades_BLUEPRINT.html | planning/tracking (OUT OF SCOPE) | הושלם |
| watch_lists_BLUEPRINT.html | tracking.* (OUT OF SCOPE) | הושלם |
| data_import_BLUEPRINT.html | settings.data_import (OUT OF SCOPE) | סלוט, לא התחיל |
| tag_management_BLUEPRINT.html | settings.tag_management (OUT OF SCOPE) | סלוט, לא התחיל |
| preferences_BLUEPRINT.html | IN SCOPE (settings.preferences) | סלוט, לא התחיל |
| system_management_BLUEPRINT.html | management (OUT OF SCOPE) | סלוט, לא התחיל |
| management_BLUEPRINT.html | management (OUT OF SCOPE) | סלוט, לא התחיל |
| ticker_dashboard_BLUEPRINT.html | tracking.* (OUT OF SCOPE) | סלוט, לא התחיל |
| trading_journal_BLUEPRINT.html | tracking.* (OUT OF SCOPE) | סלוט, לא התחיל |
| strategy_analysis_BLUEPRINT.html | research.* (OUT OF SCOPE) | סלוט, לא התחיל |
| trades_history_BLUEPRINT.html | research.* (OUT OF SCOPE) | סלוט, לא התחיל |
| portfolio_state_BLUEPRINT.html | research.* (OUT OF SCOPE) | סלוט, לא התחיל |
| research_BLUEPRINT.html | research.* (OUT OF SCOPE) | סלוט, לא התחיל |
| ai_analysis_BLUEPRINT.html | לא מפורש ב־Roadmap v2.1 Batches 3–4 | סלוט, לא התחיל |
| api_keys_BLUEPRINT.html | לא מפורש ב־Roadmap v2.1 Batches 3–4 | סלוט, לא התחיל |
| securities_BLUEPRINT.html | לא מפורש ב־Roadmap v2.1 Batches 3–4 | סלוט, לא התחיל |

### 2.4 מודולים (Modals)

בלופרינטי מודולים (הוספה/עריכה, פרטים, אישור, אלמנטים מקושרים, פרטי טרייד/תוכנית מלא) — **תומכים בעמודים** ואינם "עמודים" נפרדים ב־Roadmap. אין דרישה לעדכון המטריצה עבורם; הם נשארים במסגרת העבודה שלנו כמייצגים לעיצוב מודולים במערכת.

---

## 3. סיכום

| פריט | סטטוס |
|------|--------|
| אישור מטריצת Scope + Drift | **מאשרים** |
| רשימת Drift (עמודים שלא ב־Roadmap v2.1 Batches 3–4) | **מסופקת למעלה** — לתיעוד ואימות בלבד |

אין חובת פעולה נוספת מצדנו לסגירת P3-003. התשומה משמשת השלמת תיעוד ואימות כפי שביקשתם.

---

## 4. טבלת השוואה (Team 10)

Team 10 הכין טבלת השוואה ממוספרת בין רשימות העמודים: מטריצה, תיעוד רשמי (Page Tracker / routes), סקופ צוות 31, תפריט ראשי.

**מסמך:** `_COMMUNICATION/team_10/TEAM_10_P3_003_PAGES_COMPARISON_TABLE.md`

---

**log_entry | TEAM_31 | TO_TEAM_10 | P3_003_SCOPE_DRIFT_RESPONSE | 2026-02-15**
