# Team 10 → Team 60 | S002-P002-WP003 GATE_7 — Remediation Round 2 (Step 1)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_S002_P002_WP003_GATE7_R2_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 60 (Infrastructure)  
**date:** 2026-03-11  
**status:** MANDATE_ACTIVE — **שלב 1 של 3; מתחילים בכם**  
**authority:** TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_ROUND2_MANDATE_v1.0.0  

---

## 0) Order

**התהליך: 60 → 20 → 30.** אתם **הראשונים**. אין Team 20/30 מתחילים עד שתסיימו.

---

## 1) Scope (per DETAILED_QA_FINDINGS)

| # | ממצא | פעולה |
|---|------|-------|
| **1.2** | רמזור אדום — price_source null | וידוא sync EOD/intraday רץ; `market_data.exchange_rates` job (R1); בדיקת pipelines |
| **1.5** | ticker_type שגוי (SPY, QQQ = ETF) | seed/עדכון: ticker_type נכון לכל נכס |
| **1.6** | ניקוי seed | הסרת DDD, TSLA, MSFT (מיותרים/שגויים); הוספת SPY, QQQ עם ticker_type=ETF |
| **1.3** | exchange_id null | וידוא exchange_id מקושר לטיקרים (TEVA.TA→TASE, ANAU.MI→MIL) ב-seed/DB |

---

## 2) Handoff to Team 20

לפני סיום — העבר ל-Team 20:
- מבנה DB מעודכן (exchange_id, ticker_type)
- seed scripts / migration notes
- רשימת טיקרים לדוגמה עם exchange ו-ticker_type

---

## 3) Deliverable

**נתיב:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION.md`

עם השלמה → Team 10 מפעיל את Team 20.

---

## 4) SSOT

- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_DETAILED_QA_FINDINGS_v1.0.0.md`
- `_COMMUNICATION/team_10/TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_ROUND2_MANDATE_v1.0.0.md`

---

**log_entry | TEAM_10 | WP003_G7_R2_MANDATE | TO_TEAM_60 | 2026-03-11**
