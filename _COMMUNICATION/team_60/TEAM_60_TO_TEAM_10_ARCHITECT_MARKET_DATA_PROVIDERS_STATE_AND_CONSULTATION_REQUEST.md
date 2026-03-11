# Team 60 → Team 10 / אדריכלית | סיכום מצב ספקי נתונים — בקשת התייעצות

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_10_ARCHITECT_MARKET_DATA_PROVIDERS_STATE_AND_CONSULTATION_REQUEST  
**from:** Team 60 (Infrastructure)  
**to:** Team 10 (Gateway), אדריכלית (Team 00/190)  
**date:** 2025-01-31  
**status:** REQUEST_CONSULTATION  
**מטרה:** יישור מדיניות ספקים עם המגבלות המפורשות והרפרנס Legacy — כדי שהמערכת תפעל ברמה שכבר הושגה (ולפחות לא פחות).  

---

## 1) מה הספקים מחזירים — לא מתעלמים

### Alpha Vantage
- **מסר ברור:** "We have detected your API key... our standard API rate limit is **25 requests per day**. Please subscribe to any of the premium plans..."
- **משמעות:** 25 קריאות ביום — זו המגבלה. מעבר לזה דורש תשלום. **המערכת חייבת לנצל את המשאב בהתאם** — לא לשרוף את המכסה על טיקרים/פעולות שאפשר לכסות ב־Yahoo.
- **פעולה נדרשת:** תקצוב מפורש של 25 הקריאות (מתי משתמשים ב־Alpha: רק כשנחוץ — למשל Fallback ל־EOD רק כשׁ־Yahoo ב־cooldown, או טיקרים ספציפיים שלא ב־Yahoo). לא להפעיל Alpha כספק ראשי לכל טיקר.

### Yahoo
- **מצב:** גמיש הרבה יותר; אין מגבלה רשמית מפורסמת (Terms: "rate limits at discretion"). בקהילה — סדרי גודל של ~100/hr ו־ריווח בין בקשות מפחית 429.
- **רפרנס במערכת:** ב־Legacy (גאסי) **רק מול Yahoo כספק יחיד** הוחזקו:
  - **מעל 20 טיקרים**
  - **עדכון רציף וחי לאורך כל יום המסחר**
  - **מידע היסטורי** שנצבר לאורך **מספר קריאות חכמות** שיצרו **אגריגציה של הנתונים**
- **מקור תיעוד:**  
  `documentation/reports/05-REPORTS/artifacts/MISSION_90_02_LEGACY_YAHOO_INVESTIGATION_REPORT.md`  
  ו־`documentation/docs-system/01-ARCHITECTURE/YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC.md`
- **מסקנה:** חובה לייצר מנגנון **לפחות ברמה של מה שהיה ב־Legacy** — אם לא טוב יותר: **איזון עומסים נכון** ו**טעינה מינימליסטית וחכמה** של מה שמתעדכן. אחרת זה לא יעבוד. **וזה כבר עבד.**

---

## 2) Legacy — מה הושג (רפרנס)

מתוך MISSION_90_02 ו־yahoo_finance_adapter.py:

| רכיב | Legacy |
|------|--------|
| **ספק יחיד** | Yahoo (v8/chart) |
| **Rate limit** | 900 בקשות/שעה (שמרני), מונה per-hour |
| **Batch** | 25–50 סימבולים, 100ms בין batches |
| **Primary** | v8/finance/chart בלבד (לא quoteSummary) |
| **Cache-First** | DB cache לפני API |
| **Retry / 429** | 3 ניסיונות + exponential backoff (5s, 10s, 20s) |
| **תוצאה** | "החיבור ליהו היה פיקס, יציב ומעולה לאחר אופטימיזציה נכונה" — 20+ טיקרים, עדכון חי, היסטוריה ואגרגציה |

---

## 3) הפער הנוכחי (Phoenix)

- **Yahoo:** מגיעים ל־429 מהר; לא מיישמים עד הסוף את האסטרטגיה של Legacy (v8/chart primary, batch+delay, תקצוב קריאות, טעינה מינימליסטית).
- **Alpha:** משתמשים בו כ־fallback רחב → מכלים 25 הקריאות ביום; אין תקצוב מפורש של "מתי Alpha".
- **תוצאה:** EOD sync נכשל ל־QQQ/SPY; נדרשו placeholders ו־workarounds. זה לא בר־קיימא.

---

## 4) בקשת התייעצות (אדריכלית)

נדרש **החלטה/יישור** כדי שהמערכת תפעל ברמה של Legacy (ולפחות לא פחות):

1. **Yahoo כעוגן ראשי**
   - אסטרטגיה: Yahoo ראשי ל־EOD + intraday + היסטוריה; **טעינה מינימליסטית וחכמה** (רק מה שמתעדכן; batch; ריווח; cache-first).
   - יישור ל־Legacy: v8/chart בלבד, rate budget (למשל 900/hr או שמרני יותר), batch size ו־delay בין batches — **כמו ב־yahoo_finance_adapter.py** או מחמיר יותר.

2. **תקצוב Alpha — 25 קריאות ביום**
   - מתי משתמשים ב־Alpha: הגדרה מפורשת (למשל: רק Fallback ל־EOD כשׁ־Yahoo ב־cooldown; או טיקרים/שימושים ספציפיים שמוקצים למכסה).
   - לא להפעיל Alpha לכל טיקר בכל sync — כך המכסה נגמרת מיד.

3. **איזון עומסים וטעינה חכמה**
   - עדכון רציף/חי במהלך יום המסחר — במינימום קריאות (אגרגציה, ריווח, עדכון דיפרנציאלי אם אפשר).
   - היסטוריה — קריאות חכמות ואגרגציה כמו ב־Legacy (gap-fill, 250d, ללא ריבוי מיותר).

---

## 5) מסמכים רלוונטיים

| מסמך | תוכן |
|------|------|
| MISSION_90_02_LEGACY_YAHOO_INVESTIGATION_REPORT.md | Legacy Yahoo — אופטימיזציות, 900/hr, batch, עדות G-Lead |
| YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC.md | v8/chart primary, מגבלות 429, ניהול אצלנו |
| MARKET_DATA_PIPE_SPEC | Cache-First, Cooldown, Single-Flight |
| provider_cooldown.py | Alpha: persistence ב־DB (25/day quota) |

---

## 6) הצעד הבא

- **Team 10:** העברת המסמך לאדריכלית (Team 00/190) להתייעצות.
- **תוצאה צפויה:** החלטת אדריכלית/מנדט — Yahoo-first ו־תקצוב Alpha (25/day) + דרישות למינימום טעינה ואיזון עומסים — ואז יישום בהתאם (Team 20/60).

---

**log_entry | TEAM_60 | MARKET_DATA_PROVIDERS_STATE | TO_TEAM_10_ARCHITECT | CONSULTATION_REQUESTED | 2025-01-31**
