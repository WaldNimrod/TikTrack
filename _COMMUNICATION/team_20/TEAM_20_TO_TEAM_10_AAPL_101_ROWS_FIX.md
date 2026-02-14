# Team 20 → Team 10: תיקון — AAPL תקוע על 101 רשומות

**id:** `TEAM_20_TO_TEAM_10_AAPL_101_ROWS_FIX`  
**from:** Team 20 (Backend)  
**to:** Team 10 (Gateway)  
**date:** 2026-01-31  
**נושא:** מדוע הרצות חוזרות לא מוסיפות נתונים + תיקון

---

## 1. הבעיה

טיקר AAPL (ו־אחרים) תקוע על ~101 רשומות. הרצות חוזרות של backfill לא מוסיפות שורות.

---

## 2. שורש הבעיה — שני גורמים

### 2.1 Alpha Vantage — תמיד מחזיר את 100 הימים האחרונים

| עובדה | הסבר |
|------|------|
| **Alpha API** | `TIME_SERIES_DAILY` + `outputsize=compact` = **תמיד** ~100 ימי מסחר אחרונים |
| **ללא תמיכה בטווח** | `date_from`/`date_to` **לא נתמכים** ב־Alpha — הקוד מעביר אותם אבל Alpha מתעלם |
| **תוצאה** | בכל ריצה: Alpha מחזיר את **אותם** 100 ימים. כבר יש לנו אותם → **0 שורות חדשות** |

כשיש לנו 101 שורות (100 האחרונות + אולי 1 ישן), ואנחנו מבקשים להשלים **פערים** (149 הימים **הישנים** שחסרים) — Alpha מחזיר שוב את 100 האחרונים. כולם כפולים. 0 inserted.

### 2.2 Yahoo — לא השתמש ב־User-Agent

| עובדה | הסבר |
|------|------|
| **Yahoo חוסם** | ללא User-Agent מתאים — Yahoo מחזיר 401 או 429 |
| **קוד קודם** | `yf.Ticker(symbol)` — **בלי** session עם User-Agent |
| **תוצאה** | Yahoo נכשל → Fallback ל־Alpha → Alpha נותן אותם 100 → אין התקדמות |

Yahoo **כן** תומך ב־`start`/`end` — ויכול להחזיר 250+ ימים. אבל הוא נכשל כי חסר User-Agent.

---

## 3. התיקון

**קובץ:** `api/integrations/market_data/providers/yahoo_provider.py`

**שינוי:** `_fetch_history_sync` — שימוש ב־session עם User-Agent:

```python
from requests import Session
session = Session()
session.headers["User-Agent"] = _next_user_agent()
ticker = yf.Ticker(symbol, session=session)
```

עכשיו Yahoo אמור לעבוד ולחזור כ־Primary. עם 250+ ימים (period=2y או start/end).

---

## 4. מה לעשות עכשיו

1. **להריץ שוב** backfill ל־AAPL (כפתור "הפעל History Backfill" או `make sync-history-backfill`)
2. Yahoo יישאר Primary — עם User-Agent אמור להצליח
3. **תוצאה צפויה:** 250+ שורות (במקום 101)

אם Yahoo עדיין נכשל (למשל חסימת IP) — נשארים עם Alpha ומקסימום ~100. במצב כזה יש לבדוק הרשאות/רשת.

---

## 5. סיכום

| ספק | מגבלה | תמיכה בטווח תאריכים | מקסימום |
|-----|-------|----------------------|---------|
| **Yahoo** | צריך User-Agent | ✓ start/end | ~400 ימים |
| **Alpha** | free tier = compact | ✗ מתעלם | ~100 ימים |

**התיקון:** Yahoo משתמש עכשיו ב־User-Agent — יש סיכוי טוב להגיע ל־250+.

---

**log_entry | TEAM_20 | AAPL_101_FIX | YAHOO_USER_AGENT | 2026-01-31**
