# Team 60: תיקון DB — market_cap overflow + partitions

**date:** 2026-02-13  
**מקור:** בעיות שדווחו — numeric overflow, no partition

---

## 1. בעיות שטופלו

| בעיה | תיאור | פתרון |
|------|--------|--------|
| **numeric field overflow** | market_cap ~4T > 10^12 — NUMERIC(20,8) max ≈ 999B | P3-019: NUMERIC(24,4) — תומך עד ~10^20 |
| **no partition** | אין פרטיציה ל־ticker_prices לתאריך הרלוונטי | ensure_ticker_prices_partitions — 2025, 2026, 2027 |

---

## 2. מיגרציות שבוצעו

| Migration | תוצאה |
|-----------|--------|
| `p3_019_market_cap_precision_mega_caps.sql` | ticker_prices, ticker_prices_intraday — market_cap → NUMERIC(24,4) |
| `ensure_ticker_prices_partitions.sql` | 2025 (12), 2026 (12), 2027 (2) — סה"כ 26 פרטיציות |

---

## 3. Make targets

```bash
make migrate-p3-019                  # market_cap precision
make ensure-ticker-prices-partitions # partitions
```

---

## 4. הערות

- **PRECISION_POLICY_SSOT:** market_cap נקבע (20,8) — סטייה מאושרת בשל overflow ל-mega caps.
- **Team 20:** אין שינוי נדרש בקוד — ה-DB מקבל ערכים עד 10^20.

---

**log_entry | TEAM_60 | DB_OVERFLOW_PARTITIONS_FIX | 2026-02-13**
