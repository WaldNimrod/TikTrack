# Team 10 → Team 30: External Data — Automated Testing Mandate

**from:** Team 10 (The Gateway)  
**to:** Team 30 (UI)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY — architect instruction (Team 90)**  
**מקור:** _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE.md

---

## 1. היקף אחריות

| פריט | תוכן |
|------|------|
| **סוויטה E — UI (Clock + Tooltip)** | אוטומציה (Selenium או מסגרת E2E מקבילה) לוידוא התנהגות שעון סטגנציה ו-tooltip לפי ערך staleness. |

---

## 2. דרישות מההנחיה (סוויטה E)

- `staleness=ok` → שעון ניטרלי (neutral clock).
- `staleness=warning` → צבע אזהרה + tooltip.
- `staleness=na` → צבע alert + tooltip.
- **No banner** — אין באנר (לפי האפיון).

---

## 3. משימות מפורטות

### 3.1 אוטומציית UI
- להגדיר/להרחיב בדיקות E2E (למשל Selenium) שמכסות:
  - טעינת עמוד/דשבורד שבו מוצג שעון סטגנציה.
  - וידוא שמצב `ok` מציג שעון ניטרלי.
  - וידוא שמצב `warning` מציג צבע אזהרה + tooltip.
  - וידוא שמצב `na` מציג צבע alert + tooltip.
  - וידוא שאין באנר (no banner).

### 3.2 אינטגרציה ב-CI
- סוויטה E רצה ב-**Nightly** (full suite). לא נדרשת ב-PR Smoke לפי ההנחיה — אך יש לתאם עם Team 10/50 לגבי הרצת Nightly ורישום Evidence.

---

## 4. אינטגרציה בתוכנית העבודה

- מנדט External Data המלא: TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE — **§10**.
- תיאום עם Team 50: סקריפטי Nightly/Smoke ודיווח (Team 50) יכולים להריץ את סוויטת ה-UI או לקבל Evidence מ-Team 30.

---

## 5. תוצרים / Evidence

- קוד: בדיקות E2E לסוויטה E (שם קובץ/נתיב במענה).
- דיווח ל-Team 10: עם סיום — הודעה/דוח קצר + ציון ש־Evidence זמין (תוצאות Nightly או קישור ל-artifact).

---

**log_entry | TEAM_10 | TO_TEAM_30 | EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE | 2026-02-13**
