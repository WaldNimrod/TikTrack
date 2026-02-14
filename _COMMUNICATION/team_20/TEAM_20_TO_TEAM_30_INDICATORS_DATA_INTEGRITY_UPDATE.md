# Team 20 → Team 30: עדכון תאום — שדה Indicators בבקרת תקינות נתונים

**id:** `TEAM_20_TO_TEAM_30_INDICATORS_DATA_INTEGRITY_UPDATE`  
**from:** Team 20 (Backend)  
**to:** Team 30 (UI)  
**date:** 2026-02-14  
**מקור:** MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC; TickerDataIntegrityResponse

---

## 1. מבנה שדה `indicators`

שדה `indicators` מוחזר בתשובת `GET /api/v1/tickers/{ticker_id}/data-integrity` כהשקפה של אינדיקטורים מחושבים (או `null` כאשר אין תשתית).

```json
{
  "indicators": {
    "atr_14": "12.34567890",
    "ma_20": "248.12345678",
    "ma_50": "245.56789012",
    "ma_150": "238.90123456",
    "ma_200": "235.12345678",
    "cci_20": "-45.67890123",
    "market_cap": "3950123456789.00"
  }
}
```

### 1.1 שדות (כולם אופציונליים)

| שדה | תיאור | מקור / תנאי חישוב |
|-----|--------|-------------------|
| `atr_14` | ATR(14) — Average True Range | מחושב מ־250d OHLC; נדרש 15+ שורות |
| `ma_20` | MA(20) — Simple Moving Average | מחושב מ־250d Close; נדרש 20+ שורות |
| `ma_50` | MA(50) | מחושב מ־250d Close; נדרש 50+ שורות |
| `ma_150` | MA(150) | מחושב מ־250d Close; נדרש 150+ שורות |
| `ma_200` | MA(200) | מחושב מ־250d Close; נדרש 200+ שורות |
| `cci_20` | CCI(20) — Commodity Channel Index | מחושב מ־250d OHLC; נדרש 20+ שורות |
| `market_cap` | שווי שוק | מ־EOD האחרון (ticker_prices.market_cap) |

**הערה:** ערכים מוחזרים כמחרוזות (Decimal) בפורמט NUMERIC(20,8).

---

## 2. משמעות השדות ותנאי החישוב

### 2.1 ATR(14)
- **TR** = max(H-L, |H-prev_close|, |L-prev_close|)
- **ATR** = ממוצע TR על 14 ימים אחרונים
- **תנאי:** נדרשות 15+ שורות (period+1)

### 2.2 MA (Moving Average)
- **SMA** של מחיר סגירה על תקופת החלון
- תקופות: 20, 50, 150, 200 ימים

### 2.3 CCI(20)
- **TP** = (High + Low + Close) / 3
- **CCI** = (TP - SMA(TP)) / (0.015 × Mean Deviation)

### 2.4 Market Cap
- לא מחושב — מגיע משדה `market_cap` בשורת EOD האחרונה
- יכול להיות `null` אם אין ערך בטבלה

### 2.5 מתי `indicators` הוא `null`?
- כאשר `history_250d.row_count < 200` (היסטוריה לא מספקת)
- כאשר חישוב נכשל (חסרים שדות OHLC)

---

## 3. עדכונים בקבצים הרלוונטיים

### 3.1 Backend (Team 20)

| קובץ | תיאור |
|------|--------|
| `api/schemas/tickers.py` | `IndicatorsOverview`, `TickerDataIntegrityResponse.indicators` |
| `api/services/tickers_service.py` | `get_ticker_data_integrity` — קורא `get_ticker_indicators_cache_first` |
| `api/integrations/market_data/indicators_service.py` | `compute_indicators`, `compute_atr`, `compute_ma`, `compute_cci` |
| `api/integrations/market_data/cache_first_service.py` | `get_ticker_indicators_cache_first` |

### 3.2 UI (Team 30)

| קובץ | תיאור |
|------|--------|
| `ui/src/views/management/tickers/tickersDataIntegrityInit.js` | הצגת `indicators` — ATR, MA, CCI, Market Cap |

**סטטוס UI:** המימוש כבר מציג את שדה `indicators` בווידג'ט בקרת תקינות (סעיף "אינדיקטורים (מ־250d)").

---

## 4. הערה על היסטוריה 250d ו־Backfill

### 4.1 תלות בהיסטוריה
- **Indicators** מחושבים **רק** כאשר קיימות לפחות **200 שורות** ב־`ticker_prices` (250 ימי מסחר).
- טיקרים חדשים או טיקרים ללא היסטוריה — `indicators` יהיה `null` או חלקי.

### 4.2 History Backfill (Team 60)
- **סקריפט:** `scripts/sync_ticker_prices_history_backfill.py`
- **Make target:** `make sync-history-backfill`
- **מטרה:** מילוי 250 ימי היסטוריה לטיקרים עם < 200 שורות
- **מסמך תאום:** `TEAM_20_TO_TEAM_60_HISTORY_BACKFILL_COORDINATION_REQUEST.md`

**המלצה ל־UI:** כאשר `indicators` ריק או `history_250d.gap_status === "INSUFFICIENT"` — להציג הודעה ברורה: "נדרש History Backfill ל־ATR/MA/CCI". ה־`gaps_summary` כבר כולל הודעה דומה.

---

## 5. SSOT

- `documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md`
- `documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md` — NUMERIC(20,8)

---

**log_entry | TEAM_20 | TO_TEAM_30 | INDICATORS_DATA_INTEGRITY_UPDATE | 2026-02-14**
