# Team 20 — Evidence: 8 בדיקות תקינות (4 טיקרים × 2 ספקים)

**תאריך:** 2026-01-31  
**מנדט:** PHOENIX_MASTER_BIBLE — לקבל נתונים תקינים משני הספקים לכל 4 הטיקרים  
**סקריפט:** `python3 scripts/test-providers-direct.py`

---

## 1. מטריצת הבדיקות הנדרשת

| # | סימבול | סוג | Yahoo | Alpha |
|---|--------|-----|-------|-------|
| 1 | AAPL | STOCK | בדיקה 1 | בדיקה 2 |
| 2 | BTC | CRYPTO | בדיקה 3 | בדיקה 4 |
| 3 | TEVA.TA | STOCK | בדיקה 5 | בדיקה 6 |
| 4 | ANAU.MI | STOCK | בדיקה 7 | בדיקה 8 |

**סה"כ:** 8 בדיקות תקינות.

---

## 2. תוצאות הרצה (2026-01-31)

**סביבה:** Cursor automated run  
**ALPHA_VANTAGE_API_KEY:** SET

| Symbol | Type | Yahoo | Alpha | Yahoo note | Alpha note |
|--------|------|-------|-------|------------|------------|
| AAPL | STOCK | ❌ | ❌ | None | None |
| BTC | CRYPTO | ❌ | ❌ | None | None |
| TEVA.TA | STOCK | ❌ | ❌ | None | None |
| ANAU.MI | STOCK | ❌ | ❌ | None | None |

**פירוש "None":** `r` (תוצאת Provider) = None — ה־Provider החזיר None.

---

## 3. ניתוח

**סיבות אפשריות:**
- Yahoo מחזיר 401/429 (Too Many Requests) — חסימת או rate-limit ל־IP
- מגבלות רשת בסביבת הרצה אוטומטית (sandbox)
- Alpha: API key קיים אך תגובה None — ייתכן rate limit או חסימה

**המלצה:** להריץ את הבדיקה **מקומית** (מחשב המשתמש) עם:
- גישה לרשת חופשית
- `ALPHA_VANTAGE_API_KEY` ב־`api/.env`

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
python3 scripts/test-providers-direct.py
```

---

## 4. קריטריון הצלחה

**מצופה:** 8/8 ✅ — כל 4 הטיקרים מחזירים `price > 0` מ־Yahoo **וגם** מ־Alpha.

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | PROVIDERS_8_TESTS_EVIDENCE | 2026-01-31**
