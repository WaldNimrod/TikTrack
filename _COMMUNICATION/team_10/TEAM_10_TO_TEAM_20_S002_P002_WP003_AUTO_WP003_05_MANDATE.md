# Team 10 → Team 20 | S002-P002-WP003 — AUTO-WP003-05 Remediation Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P002_WP003_AUTO_WP003_05_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 20 (Backend)  
**date:** 2026-03-11  
**status:** MANDATE_ACTIVE  
**trigger:** TEAM_50_TO_TEAM_90_S002_P002_WP003_G7_PREHUMAN_FINAL_FEEDBACK (BLOCK)  
**context:** GATE_7 Human Hold — אין שחרור עד תיקון AUTO-WP003-05  

---

## 1) Finding

| # | תנאי | מצב | סיבה |
|---|------|-----|------|
| **AUTO-WP003-05** | market_cap NOT NULL ל-ANAU.MI, BTC-USD, TEVA.TA | 0/3 null | FIX-4: Alpha לא שולף market_cap; EOD לא ממלא |

---

## 2) Required Action

**מילוי market_cap** מ-Yahoo (v7/quote או v8/chart) עבור ANAU.MI, BTC-USD, TEVA.TA — כך שהשורה האחרונה ב־`market_data.ticker_prices` לכל סמל תכלול `market_cap` לא null.

**אלטרנטיבה:** אם אדריכלית תחליט להרפות — Team 10 יעדכן. כרגע נדרש תיקון.

---

## 3) Evidence

- סקריפט אימות: `scripts/verify_g7_prehuman_automation.py`
- דוחות: Team 50 Final Feedback, Team 60 Runtime Report

---

## 4) Deliverable

**נתיב:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_AUTO_WP003_05_COMPLETION.md`

- תיאור תיקון
- תוצאת `verify_g7_prehuman_automation.py` → PASS

---

## 5) On Completion

Team 10 → Team 60/50 re-verify → Team 90 release GATE_7 Human.

---

**log_entry | TEAM_10 | AUTO_WP003_05_MANDATE | TO_TEAM_20 | 2026-03-11**
