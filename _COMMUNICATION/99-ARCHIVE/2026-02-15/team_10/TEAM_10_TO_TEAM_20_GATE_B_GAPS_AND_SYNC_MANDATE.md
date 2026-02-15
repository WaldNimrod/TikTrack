# Team 10 → Team 20: פערי Gate B — הנחיה להשלמת שמירת מחירי טיקר (EOD)

**id:** `TEAM_10_TO_TEAM_20_GATE_B_GAPS_AND_SYNC_MANDATE`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-01-30  
**re:** TEAM_10_EXTERNAL_DATA_GATE_B_GAPS_RESPONSE — פער שמירה ל־ticker_prices

---

## 1. הקשר

דוח Gate B (Team 50) ומסמך התגובה לפערים (Team 10) מצביעים על **פער קריטי:**  
- **FX (שערי חליפין):** טעינה, שמירה, קריאה והצגה — מאומתים (sync_exchange_rates_eod.py + DB + API).  
- **מחירי טיקר (Prices):** Provider ו-cache_first קיימים, אך **אין שמירה ל-DB** — therefore אין נתוני אמת במערכת ואי־אפשר להשלים אימות E2E.

---

## 2. הבהרה — EOD גם כשהשוק סגור

סגירת השוק **אינה** סיבה ל-"No data" עבור **נתוני סוף יום (EOD)**.  
- EOD = נתונים של סיום יום המסחר (close, OHLC) — ספקים מחזירים אותם אחרי סגירת הבורסה.  
- נדרש לאפשר בדיקות והדמיות על **כל** התהליך (טעינה → שמירה → קריאה → הצגה) באמצעות EOD.  
- נתוני תוך־יומי חיים (intraday real-time) אכן לא זמינים כשהשוק סגור — זה צפוי.

---

## 3. פעולה נדרשת — צוות 20

### 3.1 יישום טעינה + שמירה למחירי טיקר EOD

- **מצב נוכחי:**  
  - קיים `scripts/sync_exchange_rates_eod.py` — טוען מ־Alpha/Yahoo ו**שומר** ל־`market_data.exchange_rates`.  
  - **אין** סקריפט מקביל ל־מחירי טיקר.  
  - ב־`api/integrations/market_data/cache_first_service.py`: בעת Cache MISS/stale הקוד קורא לספק (Yahoo → Alpha) ומקבל `PriceResult` — אך **מחזיר ל-caller בלבד** ואינו כותב ל-DB.

- **נדרש:**  
  1. **סקריפט EOD למחירים** (בדומה ל־sync_exchange_rates_eod): טעינה מ־Yahoo/Alpha ושמירה ל־`market_data.ticker_prices` (שדות: ticker_id, price, open/high/low/close, volume, market_cap, price_timestamp, provider_id וכו' לפי המודל והאפיון).  
  2. **או/בנוסף:** שמירה מתוך cache_first — בעת fetch מוצלח מספק, לכתוב שורה ל־`ticker_prices` (כדי שגם קריאות API יבנו את ה-cache).  
  3. טיפול ב-**partition/הרשאות** אם נדרש לפי DDL (למשל scripts/create_d16_tables.sql, הרשאות app_user).

### 3.2 תוצר מצופה

- הרצת sync (או קריאות שממלאות cache) מניבה שורות ב־`market_data.ticker_prices`.  
- Positions API (וקריאות אחרות שתלויות ב־ticker_prices) מחזירות נתוני אמת.  
- Team 50 יכולים להריץ אימות מלא: טעינה → שמירה → קריאה → הצגה.

---

## 4. מסמכים רלוונטיים

| מסמך | נתיב |
|------|------|
| תגובת פערי Gate B | _COMMUNICATION/team_10/TEAM_10_EXTERNAL_DATA_GATE_B_GAPS_RESPONSE.md |
| אפיון Pipeline | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md |
| מטריצת כיסוי | documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md |
| סקריפט FX (להשוואה) | scripts/sync_exchange_rates_eod.py |

---

## 5. דיווח

לאחר יישום — עדכון ל־Team 10 (ועדכון ל־Team 50 לפי נוהל QA).  
ניתן להפנות ל־Evidence / הודעת השלמה בסגנון החבילות הקודמות (P3-008–P3-015).

---

**log_entry | TEAM_10 | TO_TEAM_20 | GATE_B_SYNC_MANDATE | 2026-01-30**
