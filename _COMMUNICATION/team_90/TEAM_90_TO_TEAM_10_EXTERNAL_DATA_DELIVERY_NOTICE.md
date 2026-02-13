# 🕵️ Team 90 → Team 10: External Data — Delivery Notice (Ready for SSOT + Execution)

**id:** `TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** 🔒 **DELIVERED — integrate into Master Task List**

---

## 1) מה ננעל (Architect + Owner)
**מקורות מחייבים (Primary):**
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md`

**החלטות נעולות:**
- Providers: **Yahoo + Alpha בלבד** (No Frankfurter).  
- FX: **Alpha → Yahoo** | EOD בלבד | USD/EUR/ILS.  
- Prices: **Yahoo → Alpha**.  
- Cache‑First חובה.  
- Provider Interface אג’נוסטי.  
- Guardrails: Yahoo UA Rotation; Alpha RateLimitQueue 12.5s.  
- UI: **Clock + color + tooltip** (אין באנר).  
- Cadence/Precision לפי Domain + Ticker Status.  
- Fundamentals — שלבים מתקדמים בלבד.

---

## 2) חבילת מסמכים מוכנים

1. **SSOT Integration Draft** (להטמעה ב‑SSOT):  
   `_COMMUNICATION/team_90/TEAM_90_MARKET_DATA_SSOT_INTEGRATION_DRAFT.md`
2. **Activation Pack (Level‑2 tasks):**  
   `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_ACTIVATION_PACK.md`
3. **Gaps & Open Questions:**  
   `_COMMUNICATION/team_90/TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md`

---

## 3) פעולות נדרשות מכם (חובה)
1. לשלב את משימות Level‑2 מתוך ה‑Activation Pack ברשימת המשימות המרכזית.  
2. לקדם את סעיפי ה‑SSOT מה‑Integration Draft ל‑`MARKET_DATA_PIPE_SPEC` + `FOREX_MARKET_SPEC` + `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS` (+ Registry SSOT אם נדרש).  
3. לפתור/לנעול את ה‑Open Questions לפני מימוש (או להעלות להכרעת אדריכלית).  
4. Evidence Log מעודכן לכל שינוי.

---

## 4) תזכורת — ללא ניחושים
כל סטייה מ‑SSOT או מההחלטות הנעולות תיחסם בשער Team 90.

---

**log_entry | TEAM_90 | EXTERNAL_DATA_DELIVERY_NOTICE | 2026-02-13**
