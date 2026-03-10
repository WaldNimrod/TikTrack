# Team 10 | S002-P002-WP003 GATE_7 — Remediation Round 2 Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_ROUND2_MANDATE_v1.0.0  
**from:** Team 10 (Gateway Orchestration)  
**to:** Teams 60, 20, 30  
**date:** 2026-03-10  
**status:** MANDATE_ACTIVE  
**authority:** TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_QA_REPORT (BLOCK); Nimrod 8 findings  

---

## 0) Context

הבדיקות **לא עברו**. נדרש **סבב תיקונים נוסף ומפורט**.  

**דרישה מבנית:** התהליך **תמיד** מתחיל מ-Team 60 → Team 20 → ורק בסוף Team 30 (ממשק משתמש).  
**דרישת תאום:** הצוותים חייבים לבצע **תאום מלא ביניהם** — handoff מפורש בין שלבים.

---

## 1) Execution Order (חובה)

| שלב | צוות | פעולה | Handoff |
|-----|------|-------|---------|
| **1** | **Team 60** | Seed/ניקוי בסיס; exchange_id; ticker_type ב-DB | דוח השלמה → Team 10 → הפעלת Team 20 |
| **2** | **Team 20** | API: EOD/intraday, exchange linking, currency, ticker_type, add-form contract | דוח השלמה → Team 10 → הפעלת Team 30 |
| **3** | **Team 30** | UI: binding, formatCurrency, details modal, add form | דוח השלמה → Team 10 → Team 50 QA |

**אין לחרוג מהסדר.** Team 20 לא מתחיל עד ש-Team 60 מסיים; Team 30 לא מתחיל עד ש-Team 20 מסיים.

---

## 2) Finding Matrix (per DETAILED_QA_FINDINGS)

| # | ממצא | P | Team 60 | Team 20 | Team 30 |
|---|------|---|---------|---------|---------|
| 1.1 | מקור + עודכן ב ריקים | P0 | — | — | ✅ binding |
| 1.2 | רמזור אדום לכולם (price_source null) | P0 | ✅ sync/jobs | ✅ EOD/intraday data flow | — |
| 1.3 | מטבע — הכל $ | P0 | ✅ exchange_id | ✅ _derive_currency, linking | ✅ formatCurrency |
| 1.4 | מודל פרטים לא מלא | P1 | — | — | ✅ כל השדות |
| 1.5 | סוג נכס — ETF שגוי | P1 | ✅ ticker_type ב-seed | ✅ API validation | — |
| 1.6 | ניקוי seed (DDD/TSLA/MSFT; SPY/QQQ) | P1 | ✅ | — | — |
| 1.7 | טופס הוספה — מטבע, בורסה, ANAU.MI | P0 | — | ✅ API contract | ✅ UI |
| 1.8 | OPTION/FUTURE לא נתמכים | P2 | — | — | — |

---

## 3) SSOT

- **ממצאים:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_DETAILED_QA_FINDINGS_v1.0.0.md`
- **דוח QA:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_QA_REPORT.md`

---

## 4) Coordination Requirement

- **Team 60:** לפני סיום — לוודא ש-Team 20 מקבל מידע על מבנה ה-DB (exchange_id, ticker_type), seed scripts.
- **Team 20:** לפני סיום — לוודא ש-Team 30 מקבל חוזה API מעודכן (שדות, endpoints).
- **Team 30:** לפני סיום — לוודא תאימות מלאה ל-API ול-DB.

במידת הצורך — **תאום ישיר** בין הצוותים (לא רק דרך Team 10).

---

## 5) Deliverables

| צוות | נתיב |
|------|------|
| Team 60 | `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION.md` |
| Team 20 | `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION.md` |
| Team 30 | `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION.md` |

---

**log_entry | TEAM_10 | WP003_G7_REMEDIATION_R2_MANDATE | v1.0.0 | 2026-03-11**
