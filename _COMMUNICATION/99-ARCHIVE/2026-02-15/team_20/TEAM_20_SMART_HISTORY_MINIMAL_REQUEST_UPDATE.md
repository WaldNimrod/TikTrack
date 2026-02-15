# Team 20: עדכון — בקשה מינימלית מהספקים (Smart History)

**id:** `TEAM_20_SMART_HISTORY_MINIMAL_REQUEST_UPDATE`  
**from:** Team 20 (Backend)  
**date:** 2026-01-31

---

## 1. עקרון

לבקש מהספק החיצוני את **מינימום המידע** הנדרש — לא חבילות גדולות מיותרות.

- יש 101 ימים → למשוך רק את ~149 החסרים
- חסר יום אחד → למשוך רק את היום הספציפי

---

## 2. שינויים

### 2.1 Alpha Vantage

| לפני | אחרי |
|------|------|
| `outputsize=full` (20 שנים) | `outputsize=compact` (מינימום) |
| החזרת כל הנתונים | **סינון** לפי `date_from`/`date_to` — החזרה רק של התאריכים בטווח הנדרש |

**מגבלה:** Alpha API לא תומך בפרמטרי טווח — תמיד מחזיר 100 ימים. הסינון מבטיח שנחזיר ונכניס ל־DB רק תאריכים בטווח הפערים.

### 2.2 Yahoo — SPEC-PROV-YF-HIST (מנוקה)

**מחיר היסטורי (EOD) זמין מלא** — שוק פתוח, שוק סגור, סוף שבוע. **אין דילוג** על Yahoo.  
Retry: 3 ניסיונות, 5 שניות ביניהם (תחזוקת שרתים בסופי שבוע).

### 2.3 קבלת תוצאה חלקית (Gap-fill)

| סוג | סף מינימלי |
|-----|------------|
| Gap-fill (יש `date_from`/`date_to`) | 1 שורה — מקבלים גם יום בודד |
| Full fetch | 50 שורות |

---

## 3. קבצים

| קובץ | שינוי |
|------|--------|
| `api/integrations/market_data/providers/alpha_provider.py` | compact + סינון לפי טווח |
| `api/services/market_status_service.py` | `get_market_status_sync()` |
| `scripts/sync_ticker_prices_history_backfill.py` | `min_rows=1` ל־gap-fill (ללא דילוג Yahoo) |
| `yahoo_provider.py` | Retry 3×5s per SPEC-PROV-YF-HIST |

---

## 4. מגבלת Alpha

Alpha `compact` מחזיר רק 100 הימים האחרונים. פערים ישנים מ־100 יום לא יוכלו להתמלא באמצעות Alpha. לשם כך נדרש Yahoo.

---

**log_entry | TEAM_20 | SMART_HISTORY_MINIMAL | 2026-01-31**
