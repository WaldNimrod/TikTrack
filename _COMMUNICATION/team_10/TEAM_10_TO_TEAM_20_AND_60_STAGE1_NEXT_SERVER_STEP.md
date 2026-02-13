# Team 10 → Team 20 & Team 60: צעד הבא בצד השרת (אחרי 1-002 CLOSED)

**id:** `TEAM_10_TO_TEAM_20_AND_60_STAGE1_NEXT_SERVER_STEP`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend), Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**re:** משימה 1-002 CLOSED (Gate A + Gate B); ניתן להתקדם

---

## 1. סטטוס

- **1-002 MARKET_DATA_PIPE** — **CLOSED.** טבלת `market_data.exchange_rates` הורצה, Spec↔SSOT מתואמים, שער א' ו-ב' עברו.
- **טבלאות:** `market_data.exchange_rates` (מיגרציה רצה); `market_data.ticker_prices` קיימת ב-SSOT DDL.

---

## 2. צעד הבא — לפי MARKET_DATA_PIPE_SPEC (SSOT)

**מסמך:** `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` — סעיף 5 (תיאום Team 60), סעיפים 2–4 (היררכיית מקורות, ממשקים).

| בעלים | צעד מומלץ | הערות |
|--------|------------|--------|
| **Team 60** | **תשתית Cache** — Redis / in-memory / DB (לפי החלטה). **סנכרון EOD** — cron או job לרענון נתונים. | §5: תשתית Cache, סנכרון EOD — באחריות 60. |
| **Team 20** | **Backend:** שימוש ב־exchange_rates (ו־ticker_prices כשיש צורך) — endpoints/שירותים; **Never block UI** (timeout, fallback); **Staleness** — Warning / N/A לפי Spec. | §2–4: היררכיית מקורות, מדיניות אי־חסימת UI, Staleness. |

אין צורך באישור נוסף מ-Team 10 כדי להתחיל עבודה על צעדים אלה — ה-Spec ב-SSOT והמשימה 1-002 סגורה.

---

## 3. תיעוד והמשך

- תיאום ביניכם (20↔60) על Cache ו-EOD — לפי צורך.
- דוחות השלמה / Evidence — בתיקיות _COMMUNICATION שלכם; עדכון רשימת משימות על ידי Team 10 upon delivery.
- שאר Stage-1 (1-001, 1-003, 1-004) — במקביל ב-QA/ולידציה או בביצוע; לא חוסם את הצעד הזה.

---

**log_entry | TEAM_10 | TO_20_60 | STAGE1_NEXT_SERVER_STEP | 2026-02-13**
