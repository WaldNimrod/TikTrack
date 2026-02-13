# Team 10 → Team 90: External Data — Resubmission (SSOT Expansion Complete)

**id:** `TEAM_10_TO_TEAM_90_EXTERNAL_DATA_RESUBMISSION`  
**from:** Team 10 (The Gateway)  
**to:** Team 90 (The Spy)  
**date:** 2026-02-13  
**status:** 📤 **RESUBMITTED — SSOT expansion + Evidence**

---

## 1) בוצע לפי TEAM_90_RESUBMISSION_REQUIRED

### מסמכי SSOT חדשים (הוטמעו)

| מסמך | נתיב |
|------|------|
| **Market Data Coverage Matrix** | documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md |
| **Indicators & Fundamentals** | documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md |

### תיקוני SSOT קיימים

| מסמך | עדכון |
|------|--------|
| **MARKET_DATA_PIPE_SPEC.md** | §2.4 — Market Cap, Indicators (ATR/MA/CCI), 250d historical daily, cadence detail; הפניה למטריצה. §4.1 — market_cap, 250d, Indicators; הפניה ל־MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC. הסרת אזכור מספקים מלוג. |
| **PRECISION_POLICY_SSOT.md** | **market_cap = (20,8)** ב־ticker_prices. |
| **WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md** | יישור למטריצה — provider_mapping_data + הפניה ל־MARKET_DATA_COVERAGE_MATRIX. |
| **לוגים/חתימות** | הסרת אזכור מספקים ישן מלוגי MARKET_DATA_PIPE_SPEC. |

---

## 2) Evidence Log

- **נתיב:** documentation/05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_SSOT_EVIDENCE_LOG.md  
- **תוכן:** שינויים M1 + **Resubmission — SSOT Expansion** (טבלת מסמכים ועדכונים).

---

## 3) קישורים למסמכי SSOT מעודכנים

- [MARKET_DATA_PIPE_SPEC](../../documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md)
- [MARKET_DATA_COVERAGE_MATRIX](../../documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md)
- [MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC](../../documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md)
- [PRECISION_POLICY_SSOT](../../documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md)
- [WP_20_09_FIELD_MAP_TICKERS_MAPPINGS](../../documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md)
- [FOREX_MARKET_SPEC](../../documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md) (ללא שינוי בהגשה זו)
- [00_MASTER_INDEX](../../documentation/00-MANAGEMENT/00_MASTER_INDEX.md) — עודכן עם שני המסמכים החדשים + PRECISION_POLICY market_cap.

---

## 4) סטטוס משימות Level‑2

| משימה | תיאור | סטטוס |
|-------|--------|--------|
| P3-007 | M1 — SSOT Lock | CLOSED |
| P3-008 | M2 — Provider Interface + Cache-First | OPEN |
| P3-009 | M3 — Guardrails | OPEN |
| P3-010 | M4 — Cadence + Ticker Status | OPEN |
| P3-011 | M5 — FX EOD Sync | OPEN |
| P3-012 | M6 — Clock Staleness UI | OPEN |
| **P3-013** | **M6 (Addendum) — Market Cap** | OPEN |
| **P3-014** | **M7 — Indicators ATR/MA/CCI** | OPEN |
| **P3-015** | **M8 — 250d Historical Daily** | OPEN |

רשימת משימות מלאה: _COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md

---

## 5) פערים פתוחים (לפני מימוש)

לפי TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md — **לא נסגרו** בהגשה זו; דורשים הכרעה/אדריכלית:

1. **Intraday vs Yahoo Spec (1d)** — עדכון EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC אם נדרש intraday.  
2. **Interval dimension** — `price_interval` (ENUM) או טבלה נפרדת ל־intraday.  
3. **Ticker Status Policy** — מקור שדה + ערכים חוקיים (System Settings).

סגירת פערים — בהמשך (אדריכלית / Team 10).

---

**log_entry | TEAM_10 | TO_TEAM_90 | EXTERNAL_DATA_RESUBMISSION | 2026-02-13**
