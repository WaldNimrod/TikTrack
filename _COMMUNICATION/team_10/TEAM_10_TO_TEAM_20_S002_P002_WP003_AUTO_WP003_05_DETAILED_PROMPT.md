# Team 10 → Team 20 | S002-P002-WP003 — AUTO-WP003-05 פרומט מפורט (עד PASS)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P002_WP003_AUTO_WP003_05_DETAILED_PROMPT  
**from:** Team 10 (Gateway)  
**to:** Team 20 (Backend)  
**cc:** Team 60, Team 50, Team 90  
**date:** 2025-01-31  
**status:** ACTION_REQUIRED  
**שורה תחתונה:** אימות נוכחי = **BLOCK**. נדרש עד PASS בסקריפט האימות.  

---

## 1) מטרה (חד-משמעית)

**AUTO-WP003-05:** בשורת המחיר **האחרונה** ב־`market_data.ticker_prices` לכל אחד מהסמלים **ANAU.MI, BTC-USD, TEVA.TA** — השדה **market_cap** חייב להיות **לא null** (3/3).

**אימות:**  
```bash
python3 scripts/verify_g7_prehuman_automation.py
```  
**תוצאה נדרשת:** `AUTO-WP003-05: PASS — market_cap non-null for 3/3: ['ANAU.MI', 'BTC-USD', 'TEVA.TA']`

---

## 2) מצב נוכחי

| פריט | פרט |
|------|-----|
| **אימות אחרון** | **BLOCK** — market_cap null עבור שלושת הסמלים. |
| **סיבה אפשרית** | Yahoo היה ב-cooldown (429) בהרצות קודמות; נתיב last-known/backfill לא מילא עדיין, או backfill לא הורצה אחרי יציאה מ-cooldown. |
| **מה כבר בוצע (R1+R2)** | R1: Yahoo v8/chart + _fetch_market_cap_only_v7 כשהנתיב Yahoo מצליח. R2: העשרת last-known, _fetch_market_cap_for_symbol (Yahoo v7 → yfinance → Alpha OVERVIEW), backfill בסוף EOD, סקריפט `backfill_market_cap_auto_wp003_05.py` + `make backfill-market-cap-auto-wp003-05`. |

---

## 3) מה נדרש מצוות 20 (לבצע עד PASS)

### שלב א — וידוא שהקוד והנתיבים תקינים

1. **בדיקה:** וודא ש־`scripts/sync_ticker_prices_eod.py` כולל:
   - העשרת last-known עבור ANAU.MI, BTC-USD, TEVA.TA (קריאה ל־`_fetch_market_cap_for_symbol` כשמחזירים last-known ו־market_cap null).
   - `_fetch_market_cap_for_symbol(symbol)` עם סדר: Yahoo v7/quote → yfinance → Alpha OVERVIEW (מניות בלבד).
   - אחרי `upsert_prices(rows)` — קריאה ל־`backfill_market_cap_auto_wp003_05()`.

2. **בדיקה:** וודא ש־`scripts/backfill_market_cap_auto_wp003_05.py` קיים וקורא ל־`backfill_market_cap_auto_wp003_05()` מ־sync_ticker_prices_eod (או מ־module path תקין).

3. **בדיקה:** ב־Makefile קיים target: `make backfill-market-cap-auto-wp003-05`.

### שלב ב — הרצה ואימות (בסביבה עם DB + ספקים)

4. **הרץ EOD sync:**  
   ```bash
   make sync-ticker-prices
   ```  
   אם Yahoo ב-cooldown — הלוג יראה last-known לרוב הטיקרים; Backfill בסוף EOD אמור לנסות למלא market_cap לשורות עם null.

5. **אם עדיין BLOCK:** המתין ~20 דק׳ (יציאה מ-cooldown) והרץ backfill ידני:  
   ```bash
   make backfill-market-cap-auto-wp003-05
   ```

6. **אימות:**  
   ```bash
   python3 scripts/verify_g7_prehuman_automation.py
   ```  
   **עד שמתקבל:** `AUTO-WP003-05: PASS`.

### שלב ג — דיווח

7. **עדכן/צור דוח השלמה:**  
   `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_AUTO_WP003_05_COMPLETION.md`  
   - סטטוס: **DONE**.  
   - ציון שסקריפט האימות החזיר **PASS** (כולל ציטוט פלט או תאריך הרצה).  
   - אם בוצעו שינויי קוד נוספים — לתאר בקצרה.

8. **הודעה ל-Team 10:** דוח ההשלמה ממוקם ב־_COMMUNICATION; Team 10 יפעיל Team 60 re-verify לפי נוהל.

---

## 4) מסמכים רלוונטיים

| מסמך | תיאור |
|------|--------|
| `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_S002_P002_WP003_AUTO_WP003_05_REMEDIATION_REQUEST.md` | דרישת תיקון מפורטת (Evidence, סיבת כשל, מיקום בקוד, אפשרויות תיקון). |
| `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_AUTO_WP003_05_COMPLETION.md` | דוח השלמה R2 (טבלת תיקונים, סדר ניסיונות, אימות). |
| `scripts/verify_g7_prehuman_automation.py` | סקריפט אימות — PASS רק אם 3/3 market_cap non-null. |

---

## 5) קריטריון סגירה

- **PASS** בפקודה: `python3 scripts/verify_g7_prehuman_automation.py`  
- דוח השלמה מעודכן עם תוצאת PASS  
- לאחר מכן: Team 10 מפעיל Team 60 לאימות חוזר רשמי; Team 90 משחרר GATE_7 Human בהתאם.

---

**log_entry | TEAM_10 | AUTO_WP003_05_DETAILED_PROMPT | TO_TEAM_20 | 2025-01-31**
