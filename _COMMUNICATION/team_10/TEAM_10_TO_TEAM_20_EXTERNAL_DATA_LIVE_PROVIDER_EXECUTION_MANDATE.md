# Team 10 → Team 20: External Data — Live Provider Execution Mandate

**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_LIVE_PROVIDER_EXECUTION_REQUEST  
**סטטוס:** 🔴 **EXECUTION REQUIRED — live data verification**

---

## 1. הקשר (Team 90)

- **Alpha Vantage LIVE** ✅ — Global Quote ל־AAPL החזיר נתונים אמיתיים.
- **Yahoo LIVE** ⚠️ — מחזיר **429 Too Many Requests** (rate‑limit) מ־IP נוכחי.

נדרש **ביצוע ברמת ספק** מסביבת הצוותים כדי לסגור ולידציה חיה.

---

## 2. משימות נדרשות (Team 20)

1. **להריץ live fetch** (Yahoo + Alpha) מסביבת הצוות.
2. **לאשר** ש־**UA Rotation** (Yahoo guardrail) פעיל ב־LIVE mode.
3. **לאשר** ש־**RateLimitQueue** (Alpha 12.5s) פעיל.
4. **לתעד** פלט live עבור **3 טיקרים** (למשל AAPL, MSFT, TSLA).

---

## 3. קריטריוני הצלחה (חובה)

- ✅ נתונים חיים מ־**Alpha** עבור לפחות **3 טיקרים**.
- ✅ Yahoo — או **עובד**, או מתועד עם **429** + Evidence ל־UA rotation.

---

## 4. תוצר Evidence (חובה)

**קובץ:** `_COMMUNICATION/team_20/TEAM_20_EXTERNAL_DATA_LIVE_PROVIDER_EVIDENCE.md`

**לכלול:** פלטי פקודות (command outputs) + timestamps; וידוא UA Rotation ו־RateLimitQueue; תוצאות ל־3 טיקרים.

---

**log_entry | TEAM_10 | TO_TEAM_20 | EXTERNAL_DATA_LIVE_PROVIDER_EXECUTION_MANDATE | 2026-02-13**
