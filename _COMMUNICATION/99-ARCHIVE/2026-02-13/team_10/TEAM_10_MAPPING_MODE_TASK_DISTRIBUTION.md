# 📋 Team 10: חלוקת משימות — MAPPING_MODE (Pre‑coding)

**מאת:** Team 10 (The Gateway)  
**אל:** צוותים 20, 30, 40 — ובמשימה עצמית צוות 10  
**תאריך:** 2026-02-10  
**סטטוס:** 🔒 **BLOCKING — אין קידוד לפני השלמת כל המסירות + אישור נמרוד**  
**מקור:** `ARCHITECT_PRE_CODING_MAPPING_MANDATE.md`, `TEAM_90_TO_TEAM_10_ADR_013_SLA_ACTIVATION_MANDATE.md`

---

## 1. מטרה

תזמור שלב המיפוי המקדים: כל צוות מקבל **משימה אחת ברורה**, **מסירה מוגדרת**, **מקום הגשה** ו**רפרנסים**. לאחר איסוף כל המסירות ואישור ויזואלי (נמרוד) — ניתן להתחיל קידוד לפי תוכנית העבודה.

---

## 2. משימות לפי צוות

### 2.1 צוות 20 + צוות 30 (משימה משותפת)

| פריט | תוכן |
|------|------|
| **משימה** | להפיק **מיפוי שדות ברוקרים (Singular)** — כהכנה ל־API GET /api/v1/reference/brokers ו־Select דינמי בטפסים (D16, D18). |
| **מסירה** | קובץ **`DATA_MAP_FINAL.json`** |
| **מקום הגשה** | `_COMMUNICATION/team_20/DATA_MAP_FINAL.json` (או תיקייה מוסכמת אחת — צוות 10 יאחד ל־SSOT) |
| **תוכן מצופה** | מיפוי שדות: רשימת ברוקרים/ערכים תקפים לשדה broker (שמות ב־Singular אם רלוונטי); תאימות ל־API העתידי; שדות בטפסים D16/D18 שמוזנים ממנו. פורמט JSON. |
| **רפרנסים** | `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` (משימה 1); ADR‑013 — Broker List = GET /api/v1/reference/brokers; `ARCHITECT_PRE_CODING_MAPPING_MANDATE.md` |
| **הערה** | צוות 20 אחראי על חוזה ה־API; צוות 30 על מיפוי השדות UI. ניתן להגיש קובץ אחד משותף או שני קבצים ש־Team 10 יאחד. |

---

### 2.2 צוות 40

| פריט | תוכן |
|------|------|
| **משימה** | להפיק **רשימת קבצי CSS** שיעברו התאמה ל־Sticky (לפי מנדט המיפוי המקדים). |
| **מסירה** | קובץ **`CSS_RETROFIT_PLAN`** (שם קובץ: `CSS_RETROFIT_PLAN.md` או `.json` — רשימה מובנית) |
| **מקום הגשה** | `_COMMUNICATION/team_40/CSS_RETROFIT_PLAN.md` |
| **תוכן מצופה** | רשימת נתיבי קבצי CSS (יחסית ל־repo) שיעברו התאמה ל־Sticky; ניתן לפיוריטיזציה (למשל Header/Modals קודם). |
| **רפרנסים** | `ARCHITECT_PRE_CODING_MAPPING_MANDATE.md`; `TT2_SLA_TEAMS_30_40.md` (בעלות 40 על CSS); `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` |
| **משימה נוספת (ADR‑013)** | **DNA_BUTTON_SYSTEM.md** — מסמך מחלקות כפתור (שמות + שימוש) **תוך 24 שעות**. הגשה: `_COMMUNICATION/team_40/DNA_BUTTON_SYSTEM.md` |

---

### 2.3 צוות 10 (המשימה העצמית)

| פריט | תוכן |
|------|------|
| **משימה** | להפיק **טבלת מיפוי כל ה־Routes הקיימים** לאחד מ־4 הטיפוסים (A/B/C/D). |
| **מסירה** | **ROUTES_MAP A/B/C/D** — מסמך או קובץ רשמי אחד. |
| **מקום** | הטבלה הרשמית נמצאת ב־`TEAM_10_VISUAL_GAPS_WORK_PLAN.md` (סעיף 4.6). ניתן להעתיק ל־מסמך ייעודי **`ROUTES_MAP_A_B_C_D.md`** תחת `_COMMUNICATION/team_10/` כ־SSOT למיפוי. |
| **תוכן** | כל route/path במערכת + טיפוס (A / B / C / D) + קובץ/רכיב; בהתאם ל־ADR‑013 (כולל /admin/design-system = D, reset-password = A). |
| **רפרנסים** | `ui/public/routes.json`; `TT2_OFFICIAL_PAGE_TRACKER.md`; `ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (ADR‑013) |

---

## 3. סדר ביצוע ואישור

1. **צוות 10:** מפרסם מסמך זה ומשלים ROUTES_MAP (או מאשר שהטבלה בתוכנית העבודה = ROUTES_MAP הרשמי).
2. **צוות 20/30:** מגישים DATA_MAP_FINAL.json.
3. **צוות 40:** מגישים CSS_RETROFIT_PLAN + DNA_BUTTON_SYSTEM.md (24h).
4. **צוות 10:** אוסף את כל המסירות, בודק שלמות, ומעביר **לאישור ויזואלי נמרוד**.
5. **לאחר אישור נמרוד:** MAPPING_MODE נסגר; מתחילים קידוד לפי `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` (שלב 0 ואז 1–6).

---

## 4. SLA 30/40 — תזכורת להנחיות

בעת ביצוע (אחרי המיפוי):  
- **צוות 40:** רק Presentational + CSS; אסור קריאות API בתיקיות UI.  
- **צוות 30:** רק Containers, Logic, API; שינוי עיצוב/CSS — רק דרך צוות 40.  
מסמך מלא: `documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md`.

---

**Team 10 (The Gateway)**  
**log_entry | MAPPING_MODE_TASK_DISTRIBUTION | ISSUED | 2026-02-10**
