# Team 10 → Team 30 | S002-P002-WP003 GATE_7 — Remediation Round 2 (Step 3)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_30_S002_P002_WP003_GATE7_R2_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 30 (Frontend)  
**date:** 2026-03-10  
**status:** ON_HOLD — **הפעלה רק לאחר Team 20 R2 completion**  
**authority:** TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_ROUND2_MANDATE_v1.0.0  

---

## 0) Order

**התהליך: 60 → 20 → 30.** אתם **שלב 3 (אחרון)**. המתן להשלמת Team 20 לפני התחלה.

---

## 1) Scope (per DETAILED_QA_FINDINGS)

| # | ממצא | פעולה |
|---|------|-------|
| **1.1** | מקור + עודכן ב ריקים | תיקון binding — העמודות חייבות להציג price_source, price_as_of_utc מה-API; אין "-" כש-payload קיים |
| **1.3** | מטבע — הכל $ | formatCurrency(amount, currency) — שימוש ב-currency מהשורה; CURRENCY_SYMBOLS |
| **1.4** | מודל פרטים לא מלא | מודל "פרטים" — כל שדות עריכה + נתוני שוק (EOD, intraday, היסטוריה) + סטטוס תקינות |
| **1.7** | טופס הוספה — שדות חסרים | הוספת שדות: מטבע, סימן בורסאי (ANAU.MI); תמיכה ב-symbol+exchange suffix |

---

## 2) Coordination

- **מאת Team 20:** קבלת חוזה API מעודכן.
- **תאום מלא:** וודא תאימות ל-API ול-DB לפני סיום.

---

## 3) Deliverable

**נתיב:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION.md`

עם השלמה → Team 10 מפעיל Team 50 ל-QA.

---

## 4) SSOT

- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_DETAILED_QA_FINDINGS_v1.0.0.md`
- Team 20 R2 completion (API contract)

---

**log_entry | TEAM_10 | WP003_G7_R2_MANDATE | TO_TEAM_30 | ON_HOLD_UNTIL_20 | 2026-03-11**
