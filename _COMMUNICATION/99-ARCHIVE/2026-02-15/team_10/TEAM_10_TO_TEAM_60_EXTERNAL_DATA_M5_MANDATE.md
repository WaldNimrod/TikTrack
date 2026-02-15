# Team 10 → Team 60: מנדט — External Data M5 (FX EOD Sync)

**id:** `TEAM_10_TO_TEAM_60_EXTERNAL_DATA_M5_MANDATE`  
**from:** Team 10 (The Gateway)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**משימה:** P3-011 (M5)  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE; TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md

---

## 1. מקורות מחייבים

| מסמך | נתיב |
|------|------|
| FOREX_MARKET_SPEC | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md — §2.1–2.4 |
| MARKET_DATA_PIPE_SPEC | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md — §2.1, 2.3, §5 |

---

## 2. דרישות M5 — FX EOD Sync

| דרישה | פירוט |
|--------|--------|
| **ספקים** | **Alpha Vantage** (Primary) → **Yahoo Finance** (Fallback). **אין Frankfurter.** |
| **Scope מטבעות** | USD, EUR, ILS בלבד. |
| **Cadence** | EOD בלבד. סנכרון (cron/job) — למשל 22:00 UTC ימים א'–ה'. |
| **Cache-First** | אין קריאה חיצונית מתוך request — רק job מרענן את `market_data.exchange_rates`. |
| **Evidence** | Evidence Log / דוח השלמה ב־`_COMMUNICATION/team_60/`. |

---

## 3. תוצר נדרש

- סקריפט/תהליך סנכרון EOD — Alpha → Yahoo (fallback); Scope USD/EUR/ILS.  
- וידוא שאין שימוש ב-Frankfurter.  
- דוח השלמה + Evidence.

---

**log_entry | TEAM_10 | TO_TEAM_60 | EXTERNAL_DATA_M5_MANDATE | 2026-02-13**
