# 🕵️ Team 90 → Team 10: Enforcement — ADR‑022 + POL‑015 v1.1

**id:** `TEAM_90_TO_TEAM_10_ADR_022_AND_POL_015_1_ENFORCEMENT`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY — ARCHITECT LOCKED**

---

## 1) מקור ההכרעה (LOCKED)

- **ADR‑022:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md`  
- **ARCH‑STRAT‑002:** `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md`  
- **Provider Specs:**  
  - `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`  
  - `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`  
- **POL‑015 v1.1:** `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT_v1.1.md`

---

## 2) ADR‑022 — דרישות מחייבות (Market Data)

### 2.1 Providers (Stage‑1)
- **Yahoo + Alpha Vantage בלבד.**
- **Frankfurter מוסר לחלוטין.**
- **IBKR ברוקר בלבד** (לא ספק מחירי שוק בשלב זה).

### 2.2 Mandatory Caching
- **אין פנייה ל‑API חיצוני לפני בדיקת Local Cache.**
- נדרש Evidence בקוד (service layer): Cache‑first → fallback → update DB.

### 2.3 Agnostic Interface (Python)
- חייב להיות **Provider Interface** שמאפשר החלפת ספק ללא שינוי קוד מנוע.
- בחירת ספקים נעשית דרך config בלבד.

### 2.4 Visual Warning
- חובה להציג **אזהרה ויזואלית** כאשר מחיר EOD מוצג למשתמש.

### 2.5 Provider Guardrails (חובה)
- **Yahoo Finance:** User‑Agent Rotation חובה.  
- **Alpha Vantage:** RateLimitQueue חובה (12.5s delay, 5 calls/min).

---

## 3) POL‑015 v1.1 — תבנית עמוד (Unified Shell)

- **אין חריגות לעמודי Auth.**
- צוות 30 חייב לייצר **תבנית HTML אחת גמישה** לכל Type A/B/C/D דרך UAI config.

---

## 4) פעולות נדרשות מ‑Team 10 (חובה)

1. **עדכון SSOT** (תחת נוהל קידום ידע):
   - `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md`
   - `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
   - `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
   - אם נדרש: SSOT חדש ל‑**Provider Registry / Connector Contract**

2. **פתיחת משימות ראשיות** ב‑Master Task List (Level‑2):
   - Provider Lock (Yahoo+Alpha)
   - Cache‑First enforcement
   - Agnostic Provider Interface
   - EOD Visual Warning
   - Unified Shell (Auth included)

3. **Evidence Log**: יצירת לוג ייעודי לכל שינוי + קישורים ל‑SSOT ולמימוש.

---

## 5) Acceptance Criteria (Gate B)

- **אין אזכור ל‑Frankfurter** בקוד/SSOT/Docs.
- Cache‑First מאומת: אין קריאה ל‑API חיצוני ללא בדיקת DB.
- Provider Interface ב‑Python מוגדר ומופעל לפי config.
- אזהרת EOD מוצגת בפועל ב‑UI.
- תבנית אחידה לכל העמודים כולל Auth (אין החרגות).

---

**log_entry | TEAM_90 | ADR_022_POL_015_1_ENFORCEMENT | 2026-02-13**
