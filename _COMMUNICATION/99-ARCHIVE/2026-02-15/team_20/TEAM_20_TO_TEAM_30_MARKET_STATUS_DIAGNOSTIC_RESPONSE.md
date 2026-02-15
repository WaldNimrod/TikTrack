# Team 20 → Team 30: תגובת אבחון מצב שוק "—"

**id:** `TEAM_20_TO_TEAM_30_MARKET_STATUS_DIAGNOSTIC_RESPONSE`  
**from:** Team 20 (Backend)  
**to:** Team 30 (UI)  
**date:** 2026-01-31  
**מקור:** TEAM_30_TO_TEAM_20_MARKET_STATUS_DASH_DIAGNOSTIC

---

## 1. ממצא

בדיקה ידנית של Yahoo v7/finance/quote עבור SPY:

- **429** — Rate Limit (הגבלת קצב)
- **401** — Unauthorized ("User is unable to access this feature")

בשני המקרים הקריאה נכשלת, ה־API מחזיר `display_label: "—"`, והממשק מציג "—".

**מסקנה:** הבעיה לא בצד ה־Backend או ב־UI אלא ב־**Yahoo** — חסימות, הגבלת קצב או שינוי מדיניות לגבי ה־API.

---

## 2. שינויים שבוצעו (Team 20)

| שינוי | קובץ |
|------|------|
| לוגים ברמת WARNING | `yahoo_provider.py` — כשל fetch (כולל HTTP 429/401) |
| לוגים ברמת WARNING | `market_status_service.py` — timeout ו־exception |
| סקריפט אבחון | `scripts/debug_market_status.py` |

**הרצה:** `python3 scripts/debug_market_status.py` — בודק קריאה ל־Yahoo ומחזיר את ה־`marketState`.

---

## 3. המלצות

1. **לוגים:** לחפש ב־logs:
   - `Yahoo market status fetch failed: HTTP 429`
   - `Yahoo market status fetch failed: HTTP 401`
   - `Yahoo market status: empty result`
   - `Yahoo market status: marketState missing`

2. **מגבלות Yahoo:** Yahoo מגביל את ה־API (לפי IP, User-Agent וכו'). בסביבת dev/production ייתכנו 429 או 401.

3. **Fallback — הושלם:** נוסף פולבק דו-שלבי:
   - **Alpha Vantage** `MARKET_STATUS_CURRENT` (כשיש ALPHA_VANTAGE_API_KEY)
   - **חישוב לפי שעון מקומי** (America/New_York) — Mon–Fri 9:30–16:00 = "שוק פתוח", אחרת "שוק סגור"

**תוצאה:** גם כש־Yahoo נכשל, הממשק יציג "שוק פתוח" או "שוק סגור" (לא "—").

---

## 4. סיכום

- **לפני:** Yahoo נכשל → "—"
- **אחרי:** Yahoo נכשל → Alpha (אם זמין) → חישוב שעון מקומי → תמיד ערך מפורש ("שוק פתוח" / "שוק סגור")

---

**log_entry | TEAM_20 | TO_TEAM_30 | MARKET_STATUS_DIAGNOSTIC_RESPONSE | 2026-01-31**
