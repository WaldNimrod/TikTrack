# Team 10 → Team 90: אישור — External Data Full Re-Review + Exchange Rates History

**id:** `TEAM_10_TO_TEAM_90_EXTERNAL_DATA_MODULE_REVIEW_ACK`  
**from:** Team 10 (The Gateway)  
**to:** Team 90 (The Spy)  
**date:** 2026-02-13  
**re:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MODULE_REVIEW_AND_EXCHANGE_RATES_HISTORY.md

---

## 1. קבלה

הודעת Team 90 **התקבלה**.  
הנחיות: **ריענון מלא של מודול External Data** (לא דלתאות בלבד) + **התייחסות להיסטוריית שערים** — מחייבות.

**הערכת Team 10:** מכלול התשובות (ריענון מלא, חבילת SSOT, Option A להיסטוריה) **עונה באופן מלא על השאלות הפתוחות ומאפשר להריץ את תהליך הפיתוח.** במנדט לצוותים 20/30/60 נוספו **משימות ברורות ליישום מיידי** (§6 + §7) לכל צוות.

---

## 2. פעולות שבוצעו / מתוכננות

| # | דרישה | סטטוס |
|---|--------|--------|
| 1 | **אישור ריענון מודול** על ידי צוותים 20/30/60 | 📋 מנדט נשלח — TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE.md — קריאת **חבילת SSOT המלאה** (מקורות אדריכל + SSOT) חובה לפני ביצוע. |
| 2 | **עדכון מנדטים** — כל מנדט מפנה ל-**חבילת SSOT המלאה** | 📋 המנדט החדש מפנה במפורש לרשימת המקורות המלאה (אדריכל + SSOT). מנדטים קיימים (M2/M3, M5, M6) — ניתן להפנות אל המנדט החדש כעדכון. |
| 3 | **המתנה להחלטת אדריכל** על היסטוריית שערים; **הכנת DDL + תוכנית בעלות** מראש | 📋 Spy המליץ Option A (שמירת היסטוריה ב-DB). Team 10 מכין תוכנית: טבלה `market_data.exchange_rates_history`, EOD job (history + UPSERT נוכחי), retention 250d → ארכיון. ממתין לאישור אדריכל. |

---

## 3. היסטוריית שערים (Exchange Rates History)

- **המלצת Spy (מיושרת ל-SSOT):** **Option A — שמירת היסטוריה ב-DB**.  
- **נימוק:** SSOT כבר נועל **שמירת FX 250 ימי מסחר + ארכיון** — דורש טבלת היסטוריה.  
- **תוצאה צפויה (באישור אדריכל):** טבלה `market_data.exchange_rates_history`; job EOD מכניס היסטוריה + UPSERT לערך נוכחי; retention 250d → קבצי ארכיון.

---

## 4. מסמכים

- **הודעת Spy:** _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MODULE_REVIEW_AND_EXCHANGE_RATES_HISTORY.md  
- **מנדט ריענון (20/30/60):** _COMMUNICATION/team_10/TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE.md  

---

**log_entry | TEAM_10 | TO_TEAM_90 | EXTERNAL_DATA_MODULE_REVIEW_ACK | 2026-02-13**
