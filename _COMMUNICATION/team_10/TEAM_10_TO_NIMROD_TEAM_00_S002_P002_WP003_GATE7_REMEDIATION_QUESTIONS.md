# Team 10 → Nimrod, Team 00 | S002-P002-WP003 GATE_7 Remediation — Questions

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_NIMROD_TEAM_00_WP003_GATE7_REMEDIATION_QUESTIONS  
**from:** Team 10 (Gateway Orchestration)  
**to:** Nimrod, Team 00 (Chief Architect)  
**date:** 2026-03-11  
**status:** AWAITING_RESPONSE  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  

---

## Context

Team 10 מנהלת את סבב התיקונים ל-BF-G7-WP003-001..005. כדי לממש ללא הנחות או ניחושים — נדרשות הבהרות על שלושה נושאים.

---

## Q1 — Currency (BF-002)

**Background:**  
- `market_data.tickers` יש `exchange_id`.  
- `market_data.exchanges` יש `country` אך **אין** עמודת `currency`.  
- CRYPTO (לדוגמה BTC-USD) — ה-quote מופיע בסימבול.

**אפשרויות:**
- **A:** הוספת עמודת `currency` לטבלת tickers (מיגרציה).
- **B:** גזירה מ-exchange (TASE→ILS, Borsa Italiana→EUR); הוספת exchange.currency או metadata.
- **C:** גזירה מסימבול (BTC-USD→USD); מיפוי exchange→currency למניות.

**שאלה:** איזו גישה מאושרת אדריכלית? אם B/C — האם קיים או נדרש מיפוי exchange→currency?

---

## Q2 — Data-Status Traffic Light (BF-003)

**Background:**  
"ירוק/צהוב/אדום" דורש הגדרה של "current complete" vs "historical complete".

**שאלה:**  
האם `GET /tickers/{id}/data-integrity` הוא המקור? אם כן — כיצד למפות `gap_status` / `has_data` לירוק/צהוב/אדום? נדרש מיפוי מדויק.

---

## Q3 — Staleness "24 days" (BF-004)

**Background:**  
בבדיקה אנושית נצפה תצוגה "24 days" שלא תואמת לרעננות המצופה.

**שאלה:**  
איפה זה מוצג (נתיב קומפוננטה)? מהי ה-staleness המרבית המצופה בשעות סגירה (למשל 48h EOD_STALE לפי הקבוע הקיים)?

---

## Response Path

**נתיב תשובה:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_WP003_GATE7_REMEDIATION_ANSWERS.md`  
(או הודעה ישירה ל-Team 10)

לאחר קבלת תשובות — Team 10 תעדכן את הצוותים ותאפשר השלמת BF-002, BF-003 במלואם.

---

**log_entry | TEAM_10 | WP003_G7_QUESTIONS | TO_NIMROD_TEAM_00 | 2026-03-11**
