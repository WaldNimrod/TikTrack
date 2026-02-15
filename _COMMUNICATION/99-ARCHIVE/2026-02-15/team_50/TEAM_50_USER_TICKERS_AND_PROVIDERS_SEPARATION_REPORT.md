# Team 50 — הפרדה: ניהול טיקרים vs נתונים חיצוניים

**From:** Team 50 (QA & Fidelity)  
**To:** Team 10 (Gateway), Team 20 (Backend)  
**Date:** 2026-02-14  
**נושא:** הפרדה ברורה בין שני נושאים

---

## 1. ניהול "הטיקרים שלי" — הוספה, עריכה, הסרה

**תיאור:** הוספה לרשימה, הסרה מהרשימה, הוספת טיקר חדש שלא קיים כלל במערכת (לרשימת הטיקרים הכללית).

### 1.1 פלואו (API)

| פעולה | endpoint | תיאור |
|-------|----------|-------|
| רשימה | GET /me/tickers | רשימת הטיקרים שלי |
| הוספה (קיים) | POST /me/tickers?ticker_id=ULID | הוספת טיקר קיים במערכת |
| הוספה (חדש) | POST /me/tickers?symbol=X&ticker_type=Y | יצירת טיקר חדש + הוספה (דורש live data check) |
| הסרה | DELETE /me/tickers/{ticker_id} | הסרה soft מהרשימה |

**עריכה:** אין עריכת מטא-דאטה — עמוד "הטיקרים שלי" מאפשר Add/Remove בלבד. עריכת טיקר במערכת = Admin.

### 1.2 מה עובד בפועל

| בדיקה | תוצאה | הערות |
|-------|-------|-------|
| GET /me/tickers | ✅ 200 | רשימה מתקבלת |
| POST (ticker_id קיים) | ✅ | — |
| POST (symbol=AAPL חדש) | ✅ 201/409 | יצירה + הוספה עובדת (live check עבר) |
| POST (symbol מזויף) | ⚠️ 500 | **צפוי 422** — provider failure צריך להחזיר 422, לא 500 |
| POST (symbol=BTC CRYPTO) | ⚠️ 500 | פרסור Alpha נכשל (ראה §2) |
| POST (TEVA.TA, ANAU.MI) | ⚠️ 500 | ספקים לא מחזירים נתונים |
| DELETE /me/tickers/{id} | — | לא נבדק במפורש בסבב זה |

### 1.3 סיכום ניהול טיקרים

**חלקי.**  
- רשימה, הוספת טיקר קיים, הוספת AAPL (חדש) — עובד.  
- טיקר מזויף: מחזיר 500 במקום 422 (רגרסיה ב-error handling).  
- הוספת טיקרים מסוג BTC, TEVA.TA, ANAU.MI — נכשלות 500 עקב בעיות בספקים (ראה §2).

---

## 2. נתונים חיצוניים — ספקים וטיקרים

**בדיקה ישירה** של YahooProvider ו-AlphaProvider (LIVE), סקריפט `scripts/test-providers-direct.py`.

### 2.1 טבלת ספקים (אחרי Root Fix — 2026-02-14)

| Symbol | Type | Yahoo | Alpha | הערות |
|--------|------|-------|-------|-------|
| AAPL | STOCK | ❌ | ✅ | Alpha price=255.78 |
| BTC | CRYPTO | ❌ | ✅ | **תוקן** — Alpha price=68944 (volume int(float)) |
| TEVA.TA | STOCK | ❌ | ❌ | שניהם None |
| ANAU.MI | STOCK | ❌ | ❌ | שניהם None |
| ZZZZZZZFAKE999 | STOCK | ❌ | ❌ | כמצופה — אין נתונים |

### 2.2 פירוט

| ספק | מצליח | נכשל | הערות |
|-----|-------|------|-------|
| **Yahoo** | — | הכל | מחזיר None — env/rate limit |
| **Alpha** | AAPL, BTC | TEVA.TA, ANAU.MI, Fake | Root Fix: volume תוקן — BTC עובד |

---

## 3. מסקנות

1. **ניהול טיקרים:** לוגיקת Add/Remove/List עובדת; יש לתקן החזרת 500 במקום 422 עבור טיקר מזויף.
2. **נתונים חיצוניים:** Alpha עובד ל-AAPL בלבד; Yahoo לא מחזיר נתונים; Alpha BTC נכשל עקב bug פרסור volume.

---

**log_entry | TEAM_50 | USER_TICKERS_AND_PROVIDERS_SEPARATION_REPORT | 2026-02-14**
