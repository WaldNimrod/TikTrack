# סטטוס טיקר והתנהגות טעינת נתונים — SSOT

**id:** `TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - LOCKED**  
**last_updated:** 2026-02-14  
**מקור:** דרישת תיאום — שדה סטטוס בעמוד טיקרים חייב להיות לפי הסטטוסים המערכתיים; התנהגות טעינת נתונים מתואמת לכל סטטוס.

**תלות:** [TT2_SYSTEM_STATUS_VALUES_SSOT.md](./TT2_SYSTEM_STATUS_VALUES_SSOT.md) — ערכים קנוניים ועברית בלבד (pending, active, inactive, cancelled).

---

## 1. עקרון

שדה **סטטוס** בעמוד טיקרים (D22) ובכל מקום שמציג/מנהל סטטוס טיקר — **חייב** להשתמש **רק** בסטטוסים המערכתיים (ממתין, פתוח, סגור, מבוטל) ובמשמעות המתוארת להלן לגבי טעינת נתוני שוק.

---

## 2. טבלת סטטוס טיקר → טעינת נתונים

**ערכים קנוניים (DB/API):** `pending` | `active` | `inactive` | `cancelled`  
**תצוגה (עברית):** ממתין | פתוח | סגור | מבוטל

| סטטוס (עברית) | ערך קנוני | התנהגות טעינת נתונים |
|----------------|------------|------------------------|
| **ממתין** | `pending` | בדיקת נתונים בלבד — **משפיע** נתוני סוף יום (EOD) והיסטוריה (250d) בלבד. אין טעינת Intraday בקצב מלא. |
| **פתוח** | `active` | טעינת נתונים **מלאה בקצב מלא** — Intraday + EOD + היסטוריה (250d). |
| **סגור** | `inactive` | טעינת נתונים **מלאה בקצב מופחת** — EOD + היסטוריה; Intraday בקצב מופחת או רק EOD (לפי הגדרות מערכת). |
| **מבוטל** | `cancelled` | **לא פעיל** — **לא טוען נתונים** (אין Intraday, אין EOD, אין היסטוריה ממושכת). |

---

## 3. השלכה ל-Backend ו-Infrastructure

- **Team 20 (Backend):** לוגיקת סנכרון / סקריפטים (EOD, Intraday, History Backfill) — **חייבת** להתייחס לשדה סטטוס הטיקר לפי טבלה זו (למשל: טיקר `cancelled` לא נכלל ב-backfill; `pending` — EOD + history בלבד; `active` — full rate; `inactive` — reduced rate).
- **Team 60 (Infrastructure):** Cron / Jobs — תזמון ורשימת טיקרים לסנכרון — **חייב** להתבסס על סטטוס טיקר לפי טבלה זו (למשל: backfill רק לטיקרים שאינם `cancelled`; intraday רק ל-`active` או לפי cadence ל-`inactive`).
- **Team 30 (Frontend):** עמוד טיקרים (D22) — שדה סטטוס **חובה** שיהיה לפי [TT2_SYSTEM_STATUS_VALUES_SSOT](TT2_SYSTEM_STATUS_VALUES_SSOT.md) (ארבעת הערכים, דרך statusValues.js + statusAdapter.js). התנהגות התצוגה/סינון תואמת לטבלה זו.

---

## 4. מקורות תיעוד קשורים

| מסמך | תוכן |
|------|------|
| TT2_SYSTEM_STATUS_VALUES_SSOT | ערכים קנוניים + עברית — מקור יחיד לתצוגה וסינון |
| MARKET_DATA_PIPE_SPEC | Cadence לפי ticker status; Intraday ל-Active בלבד |
| MARKET_DATA_COVERAGE_MATRIX | Stage-1 Rules — Intraday only for Active tickers |

---

**log_entry | TEAM_10 | TICKER_STATUS_MARKET_DATA_LOADING_SSOT | LOCKED | 2026-02-14**
