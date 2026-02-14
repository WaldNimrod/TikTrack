# Team 10: מנדט תיקונים דחופים — Smart History Fill QA

**id:** `TEAM_10_SMART_HISTORY_FILL_QA_URGENT_FIXES_MANDATE`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend), Team 30 (Frontend), Team 50 (QA)  
**date:** 2026-02-14  
**נושא:** 🔴 תיקונים דחופים — 403, הודעות שגיאה UI, Seed ל־250+ — לא לסגור עד רה־ריצת QA מלאה

---

## 1. רקע

בדיקת QA של Team 50 חשפה **2 פערים** + **חסר בנתוני בדיקה**. נדרש **סבב תיקונים מיידי** לפני סגירת Smart History Fill.

---

## 2. תיקון 1 — Backend: 403 למשתמש רגיל (Team 20)

| פריט | תוכן |
|------|------|
| **בעיה** | `force_reload` למשתמש רגיל מחזיר **200** (צריך 403). |
| **מקור** | `history_backfill_service.py` / `decide()` — כאשר `mode=force_reload` ו־`!is_admin`, ה־decide לא מחזיר FULL_RELOAD ולכן הזרימה ממשיכה ל־GAP_FILL/NO_OP ו־200. |
| **דרישה** | **לפני** קריאה ל־`decide()` (או **ב־router**): אם `mode=force_reload` ו־`!is_admin` → **403**. מומלץ: ב־`api/routers/tickers.py` — מיד אחרי ולידציית `mode_val`, אם `mode_val == "force_reload"` ו־`not is_admin` → להחזיר `HTTPException(403, detail="force_reload requires Admin.")`. |
| **קריטריון הצלחה** | קריאה ל־`POST /api/v1/tickers/{id}/history-backfill?mode=force_reload` עם **משתמש רגיל** (לא Admin) מחזירה **403** והודעת "דורש הרשאת Admin". |

**בעלים:** Team 20  
**סטטוס תיקון:** ✅ **בוצע (Team 10)** — נוסף guard ב־`api/routers/tickers.py`: אם `mode_val == "force_reload"` ו־`not is_admin` → 403 לפני קריאה ל־service. נא לוודא בבדיקה.

---

## 3. תיקון 2 — Frontend: הודעות שגיאה (Team 30)

| פריט | תוכן |
|------|------|
| **בעיה** | 404 מציג "ממתין ל־API" במקום הודעת השגיאה מהשרת. |
| **מקור** | `tickersDataIntegrityInit.js` → `doBackfill()` ב־catch. |
| **דרישה** | להשתמש ב־`e.message` (או בשדה הודעת השגיאה מה־API) ולהציג למשתמש "טיקר לא נמצא" או את ההודעה המדויקת מהתשובה (למשל `detail` מ־JSON). |
| **קריטריון הצלחה** | תשובה 404 מהשרת → בממשק מוצגת הודעת ה־API בפועל (למשל "Ticker not found" / "טיקר לא נמצא"). |

**בעלים:** Team 30  
**סטטוס תיקון:** ✅ **בוצע (Team 10)** — ב־`tickersDataIntegrityInit.js`: ב־doBackfill() ו־doForceReload() — שימוש ב־`e?.response?.data?.detail ?? e?.detail` כ־הודעת API; 404 → fallback "טיקר לא נמצא". נא לוודא שהתאמת השדה (detail) תואמת את תשובת ה־API.

---

## 4. תיקון 3 — QA: Seed ל־250+ ימים (Team 20 + Team 50)

| פריט | תוכן |
|------|------|
| **בעיה** | פריטים 2–3 בבדיקת QA ב־SKIP — אין טיקר עם 250+ שורות. |
| **דרישה** | **Team 20:** להכין טיקר עם **250+ שורות** ב־`market_data.ticker_prices` (seed / הרצת backfill / cron) — כך שבדיקות "הנתונים מלאים" ו־"force_reload כ־Admin" יוכלו לרוץ. **Team 50:** לאחר שהנתונים מוכנים — **רה־ריצה מלאה** של סוויטת QA (כל 5 הפריטים) והגשת Evidence מעודכן. |
| **קריטריון הצלחה** | פריט 2 (בלוק "הנתונים מלאים — לטען מחדש?") + פריט 3 (force_reload כ־Admin) עוברים **PASS** עם Evidence. |

**בעלים:** Team 20 (נתונים) + Team 50 (רה־ריצת QA + דוח)

---

## 5. סדר ביצוע

1. **Team 20:** תיקון 403 (router guard) + הכנת טיקר 250+ (seed/backfill).
2. **Team 30:** תיקון הצגת הודעות שגיאה (404 ואחרות) ב־doBackfill.
3. **Team 50:** רה־ריצת סוויטת QA המלאה לאחר התיקונים והנתונים; הגשת דוח מעודכן + Evidence.

---

## 6. תנאי סגירה

**לא לסגור** את סבב Smart History Fill עד:
- רה־ריצה מלאה של QA (כל 5 הפריטים),
- הוכחות מעודכנות (Evidence) שהתיקונים עמדו בקריטריונים.

לאחר דוח QA מעודכן — Team 10 יאשר סגירה או ימשיך סבב תיקונים.

---

## 7. הפניות

| מסמך | נתיב |
|------|------|
| בקשת QA מקורית | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_SMART_HISTORY_FILL_QA_REQUEST.md |
| Router (תיקון 403) | api/routers/tickers.py — post_ticker_history_backfill |
| Service | api/services/history_backfill_service.py |
| UI (תיקון הודעות) | ui — tickersDataIntegrityInit.js, doBackfill() catch |

---

**log_entry | TEAM_10 | MANDATE | SMART_HISTORY_FILL_QA_URGENT_FIXES | 2026-02-14**
