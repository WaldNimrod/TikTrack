# 🕵️ Team 90 → Architect: External Market Data — Final Update (Stage‑1)
**project_domain:** TIKTRACK

**id:** `TEAM_90_TO_ARCHITECT_EXTERNAL_DATA_FINAL_UPDATE`  
**from:** Team 90 (The Spy)  
**to:** Chief Architect  
**date:** 2026-02-13  
**status:** ✅ **UPDATED — pending closure of open items**

---

## 1) החלטות נעולות (מושרשות ב‑SSOT בתהליך קידום ידע)

**מקורות מחייבים:**
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md`

**נעילות:**
- Providers: Yahoo + Alpha בלבד (No Frankfurter).  
- FX: Alpha → Yahoo | EOD בלבד | USD/EUR/ILS.  
- Prices: Yahoo → Alpha.  
- Cache‑First חובה; Agnostic Interface חובה.  
- Guardrails: Yahoo UA Rotation; Alpha RateLimitQueue 12.5s.  
- UI: Clock‑based stale indicator (אין באנר).  
- Cadence/Precision לפי Domain + Ticker Status.  
- Fundamentals: שלבים מתקדמים בלבד.

---

## 2) סטטוס יישום SSOT

צוות 90 הכין **SSOT Integration Draft** להעברה למסמכים הבאים:
- `MARKET_DATA_PIPE_SPEC.md`
- `FOREX_MARKET_SPEC.md`
- `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- (אופציונלי) Provider Registry SSOT

המסמך המלא:
`_COMMUNICATION/team_90/TEAM_90_MARKET_DATA_SSOT_INTEGRATION_DRAFT.md`

---

## 3) פערים פתוחים לאישור/השלמה

1. **Intraday vs Yahoo Spec (1d)**  
   דרישת Owner: Intraday ל‑Active tickers כבר בשלב 1.  
   Spec Yahoo כרגע מציין interval 1d — נדרש אישור הרחבה.

2. **Rate‑Limit feasibility**  
   Alpha 5 calls/min עלול להיות צוואר בקבוק לאינטרדיי.  
   נדרש כלל SSOT למקסימום tickers פעילים/תזמון סינכרון.

3. **Provider Registry SSOT**  
   הוחלט ליישם agnostic interface, אך Registry רשמי עדיין לא ננעל.

4. **Clock‑based UI thresholds**  
   נדרש לאשר thresholds וצבעים לזיהוי staleness.

5. **Ticker Status Policy**  
   יש לנעול איפה נשמר status, ערכים חוקיים, ומי מוסמך לשינוי.

---

## 4) בקשה

אישור/הנחיה לנעילת חמשת הפערים לעיל, כדי לסגור SSOT ולהפעיל מימוש ללא ניחושים.

---

**log_entry | TEAM_90 | EXTERNAL_DATA_FINAL_UPDATE | 2026-02-13**
