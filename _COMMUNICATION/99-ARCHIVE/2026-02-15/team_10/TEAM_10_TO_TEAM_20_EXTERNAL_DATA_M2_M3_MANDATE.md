# Team 10 → Team 20: מנדט — External Data M2 + M3 (Provider Interface, Cache-First, Guardrails)

**id:** `TEAM_10_TO_TEAM_20_EXTERNAL_DATA_M2_M3_MANDATE`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**משימות:** P3-008 (M2), P3-009 (M3)  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE; TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md

---

## 1. מקורות מחייבים (ללא ניחושים)

| מסמך | נתיב |
|------|------|
| MARKET_DATA_PIPE_SPEC | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md — §2.1–2.5 |
| FOREX_MARKET_SPEC | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md |
| ARCHITECT_VERDICT_MARKET_DATA_STAGE_1 (ADR-022) | _COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md |
| EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC | documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md |
| EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC | documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md |

---

## 2. M2 — Provider Interface + Cache-First

| דרישה | פירוט |
|--------|--------|
| **ממשק אגנוסטי** | מימוש Interface ב-Python המאפשר החלפת ספק (Yahoo/Alpha) **ללא שינוי קוד מנוע** — config-driven. |
| **Cache-First חובה** | תמיד בדיקת cache מקומי (DB) **לפני** כל קריאת API חיצונית. Cache HIT → החזר מיידי. Cache MISS → Primary → Fallback. שניהם נכשלו → החזר stale + `staleness=na`. **Never block UI.** |
| **Priority** | FX: Alpha → Yahoo. Prices: Yahoo → Alpha. אין Frankfurter. |

---

## 3. M3 — Provider Guardrails

| ספק | חובה |
|-----|------|
| **Yahoo Finance** | **User-Agent Rotation** — חובה. |
| **Alpha Vantage** | **RateLimitQueue** — חובה. עיכוב 12.5s בין קריאות → 5 calls/min. |

---

## 4. תוצרים נדרשים

- קוד/שירותים מיושרים ל־SSOT.  
- דוח השלמה ב־`_COMMUNICATION/team_20/` (למשל TEAM_20_EXTERNAL_DATA_M2_M3_COMPLETION_REPORT.md).  
- Evidence / רשימת שינויים.

---

## 5. שאלות פתוחות (לפני מימוש)

אם יש אי־בהירות — ראה `TEAM_10_EXTERNAL_DATA_OPEN_QUESTIONS_FOR_ARCHITECT.md`. שאלות 1–3 הועלו לאדריכלית; עד להכרעה — מימוש EOD + Cache-First + Guardrails כפי שמפורט ב־SSOT.

---

**log_entry | TEAM_10 | TO_TEAM_20 | EXTERNAL_DATA_M2_M3_MANDATE | 2026-02-13**
