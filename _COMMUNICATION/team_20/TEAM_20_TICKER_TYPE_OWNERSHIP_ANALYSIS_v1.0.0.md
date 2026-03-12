# Team 20 | ניתוח אחריות ticker_type — מי מתקן?

**project_domain:** TIKTRACK  
**id:** TEAM_20_TICKER_TYPE_OWNERSHIP_ANALYSIS  
**from:** Team 20 (Backend)  
**ref:** TEAM_10_TICKER_TYPE_QUICK_FIX_NOTE_v1.0.0  
**date:** 2026-03-12  
**status:** ANALYSIS_COMPLETE  

---

## 1) תוצאות בדיקת Runtime (Team 20)

| שכבת | בדיקה | תוצאה |
|------|-------|-------|
| **DB** | `SELECT symbol, ticker_type FROM market_data.tickers WHERE deleted_at IS NULL` | ✅ SPY=ETF, QQQ=ETF, BTC-USD=CRYPTO, אקסטרים=STOCK |
| **API** | `GET /api/v1/tickers` + Bearer token | ✅ ticker_type מוחזר נכון לכל טיקר |
| **Seed** | `scripts/seed_market_data_tickers.py` DEFAULT_TICKERS | ✅ SPY=ETF, QQQ=ETF, BTC-USD=CRYPTO |

---

## 2) אבחנה

**בסביבת הפיתוח הנוכחית:** DB ו-API תקינים.

- אם המשתמש רואה "stock" לכולם – כנראה אחת מהאפשרויות:
  1. **סביבה שונה** – staging/prod שבו ה-seed לא רץ אחרי R2 (טיקרים קיימים לא עודכנו)
  2. **מקור נתונים אחר** – למשל `/me/tickers` (הטיקרים שלי) במקום `/tickers`
  3. **Frontend** – binding ל־`ticker_type` חסר או שגוי (למשל רק `tickerType` camelCase)

---

## 3) חלוקת אחריות

| מצב | בעלים | פעולה |
|-----|--------|-------|
| DB מחזיק STOCK ל-SPY/QQQ/BTC-USD | **Team 20** | הרצת seed או הוספת UPDATE ל-seed לעדכון ticker_type בטיקרים קיימים |
| API לא מחזיר ticker_type ב-response | **Team 20** | וידוא ש־`_ticker_to_response` מעביר ticker_type (כיום מעביר ✓) |
| API מחזיר נכון, UI מציג "stock" לכולם | **Team 30** | בדיקת binding ב־`tickersTableInit.js` שורה 202: `t.ticker_type ?? t.tickerType ?? 'STOCK'` |
| Seed לא רץ / טיקרים ישנים | **Team 20** | שיפור seed: UPDATE ticker_type כשהסמל כבר קיים והערך ב-DEFAULT_TICKERS שונה |

---

## 4) המלצת תיקון Team 20 (מניעתי)

ב־`scripts/seed_market_data_tickers.py`: כשה-seed רץ, לעדכן גם טיקרים קיימים:

```python
# בתוך seed(), אחרי INSERT — הוסף:
for row in DEFAULT_TICKERS:
    symbol, _, ticker_type, _ = row[0], row[1], row[2] if len(row)>=3 else "STOCK", row[3] if len(row)>=4 else None
    cur.execute("""
        UPDATE market_data.tickers SET ticker_type = %s, updated_at = NOW()
        WHERE symbol = %s AND deleted_at IS NULL AND (ticker_type IS NULL OR ticker_type != %s)
    """, (ticker_type, symbol, ticker_type))
    if cur.rowcount > 0:
        print(f"  🔄 Updated ticker_type: {symbol} → {ticker_type}")
```

כך בכל הרצת seed גם טיקרים קיימים יקבלו ticker_type נכון.

---

## 5) המלצת תיקון Team 30 (מניעתי)

ב־`ui/src/views/management/tickers/tickersTableInit.js` שורה 202:

```javascript
// נוכחי:
typeBadge.textContent = t.ticker_type ?? 'STOCK';
// מומלץ (גם camelCase):
typeBadge.textContent = t.ticker_type ?? t.tickerType ?? 'STOCK';
```

---

## 6) סיכום

| צוות | תיקון |
|------|-------|
| **Team 20** | seed עם UPDATE ל-ticker_type קיימים (מתאים לסביבות שבהן טיקרים נוצרו לפני R2) |
| **Team 30** | הוספת fallback ל־`tickerType` (מתאים אם ה-API או middleware מחזירים camelCase) |

**במצב הנוכחי:** DB + API תקינים. אם הבעיה עדיין מופיעה – לבדוק את ממשק ה-Frontend (binding + מקור הנתונים).

---

**log_entry | TEAM_20 | TICKER_TYPE_OWNERSHIP_ANALYSIS | DONE | 2026-03-12**
