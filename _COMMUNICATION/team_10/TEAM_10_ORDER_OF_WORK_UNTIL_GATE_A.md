# 📐 סדר עבודה עד לשער א' — Team 10 (תזמור)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**סטטוס:** 📋 **מסמך תזמור — סדר ביצוע מחייב**  
**מקור:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md`, `TEAM_90_TO_TEAM_10_ADR_013_SLA_ACTIVATION_MANDATE.md`, מנדט Pre‑coding

---

## 1. תצוגה כללית

הסדר להלן מגדיר **עד מתי** כל שלב ואת **המעבר לשער א'** (Team 50 — הרצת סוויטת בדיקות, 0 SEVERE). אין לדלג על שלב; מיפוי מאושר לפני קידוד.

```
[שלב -1] MAPPING_MODE — ✅ סגור
    ↓
[שלב 0] גשר React/HTML (Bridge) — השלמה ארכיטקטונית (דוח Team 90)
    ↓
[שלב 1] שער אוטנטיקציה (A/B/C/D) — יישום
    ↓
[שלב 2] Header Loader לפני React mount
    ↓
Team 10: אישור השלמה + מסירת קונטקסט ל־QA
    ↓
[שער א'] Team 50: הרצת בדיקות — 0 SEVERE
```

---

## 2. סדר עבודה מפורט עד לשער א'

### שלב ‑1: MAPPING_MODE (Pre‑coding) — **חוסם**

| # | פעולה | אחראי | מסירה / תוצר |
|---|--------|--------|----------------|
| 1.1 | פרסום הודעות לצוותים + ROUTES_MAP | **Team 10** | הודעות ל־20/30, 40; טבלת ROUTES_MAP (בתוכנית או `ROUTES_MAP_A_B_C_D.md`) |
| 1.2 | מיפוי שדות ברוקרים — DATA_MAP_FINAL.json | **Team 20 + 30** | `_COMMUNICATION/team_20/DATA_MAP_FINAL.json` |
| 1.3 | רשימת CSS ל־Sticky — CSS_RETROFIT_PLAN | **Team 40** | `_COMMUNICATION/team_40/CSS_RETROFIT_PLAN.md` |
| 1.4 | מסמך מחלקות כפתור — DNA_BUTTON_SYSTEM.md (24h) | **Team 40** | `_COMMUNICATION/team_40/DNA_BUTTON_SYSTEM.md` |
| 1.5 | איסוף מסירות, בדיקת שלמות | **Team 10** | רשימת מסירות מלאה |
| 1.6 | **אישור ויזואלי נמרוד** על המיפוי | **נמרוד** | אישור לפתיחת קידוד |

**יציאה משלב ‑1:** ✅ MAPPING_MODE נסגר (הודעה: `TEAM_10_MAPPING_MODE_CLOSURE_NOTICE.md`).

---

### שלב 0: גשר React/HTML (Bridge)

**מקור:** `_COMMUNICATION/team_90/TEAM_90_REACT_HTML_BRIDGE_FINDINGS_DRAFT.md` (Team 90).

| # | פעולה | אחראי | הערה |
|---|--------|--------|------|
| 0.1 | Lock ל־Hybrid Model (HTML pages + React SPA) | **לפי הדוח** | החלטה ארכיטקטונית |
| 0.2 | Auth Redirect Rules לפי ADR‑013 | **Team 30** | |
| 0.3 | יישור routes.json מול React routes | **Team 10 / 30** | SSOT אחיד |
| 0.4 | נתיב Header אחיד | **Team 30/40** | |
| 0.5 | החלטה מחייבת לגבי React Tables | **לפי הדוח** | |
| 0.6 | דיווח השלמה ל־Team 10 | **צוות מוביל** | |

**הערה:** שלב זה נוסף לפי דרישת צוות 90 (משוב MAPPING_MODE — Go with Hold).

---

### שלב 1: שער אוטנטיקציה (4 טיפוסים A/B/C/D)

| # | פעולה | אחראי | הערה |
|---|--------|--------|------|
| 1.1 | עדכון/יישום Guard + redirect לפי ROUTES_MAP (אורח → Home בעמודי C/D) | **Team 30** | לא ProtectedRoute על Home; redirect ל־Home (לא ל־/login) |
| 1.2 | Home: שני containers — logged-out (שיווקי) / logged-in (נתונים) | **Team 30** | B) Shared |
| 1.3 | User Icon: Success (logged-in) / Warning (logged-out); אסור שחור | **Team 30/40** | לפי SLA — 40 על מראה, 30 על לוגיקה |
| 1.4 | Admin-only: בדיקת JWT role, redirect/403 ל־/admin/design-system | **Team 20 + 30** | מקור: שדה `role` ב־JWT |
| 1.5 | וידוא עמודי A) Open ללא Header (login, register, reset-password) | **Team 30** | |
| 1.6 | דיווח השלמה ל־Team 10 | **Team 30** | |

**רפרנס:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` סעיף 4; ADR‑013.

---

### שלב 2: Header תמיד אחרי Login → Home

| # | פעולה | אחראי | הערה |
|---|--------|--------|------|
| 2.1 | Header Loader רץ **לפני** React mount (תיקון רגרסיה login → home) | **Team 30** | ADR‑013 |
| 2.2 | וידוא Header מוצג בכל עמוד שאינו A) Open | **Team 30** | |
| 2.3 | דיווח השלמה ל־Team 10 | **Team 30** | |

**רפרנס:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` משימה 7.

---

### הכנה לשער א'

| # | פעולה | אחראי | הערה |
|---|--------|--------|------|
| G.1 | **Team 10:** וידוא ששלבים 0 ו־1 הושלמו לפי התוכנית | Team 10 | |
| G.2 | **Team 10:** מסירת **קונטקסט מפורט** ל־Team 50 (מה בוצע, קבצים רלוונטיים, תרחישים) | Team 10 | לפי נהלי QA |
| G.3 | **Team 50:** הרצת סוויטת הבדיקות (E2E וכו') | Team 50 | 0 SEVERE — תנאי למעבר |

---

## 3. שער א' — הגדרה

- **שער א' (Team 50):** לאחר השלמת שלבים 0 ו־1 — **רק אחרי** ש־Team 10 אישר השלמה ומסר קונטקסט מפורט; הרצת סוויטת הבדיקות; **0 SEVERE**.
- **מסמך נהלי QA:** `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md`  
- **תזכורת:** אין להריץ שער א' לפני סגירת MAPPING_MODE ואישור נמרוד.

---

## 4. מסמכי הודעות לצוותים (שפורסמו)

| צוות | מסמך הודעה |
|------|-------------|
| **20 + 30** | `TEAM_10_TO_TEAMS_20_30_MAPPING_MODE_MANDATE.md` |
| **40** | `TEAM_10_TO_TEAM_40_MAPPING_MODE_MANDATE.md` |
| **כולם** | `TEAM_10_MAPPING_MODE_TASK_DISTRIBUTION.md` (חלוקת משימות מלאה) |

---

## 5. סיכום טבלארי — סדר עד שער א'

| שלב | תיאור קצר | סטטוס |
|-----|------------|--------|
| **‑1** | MAPPING_MODE | ✅ סגור |
| **0** | גשר React/HTML (Bridge) — דוח Team 90 | ⬜ |
| **1** | אוטנטיקציה: Guards, Home containers, User Icon, Admin JWT, עמודי Open בלי Header | ⬜ |
| **2** | Header Loader לפני React mount; Header בכל עמוד לא־Open | ⬜ |
| **G** | Team 10: אישור + קונטקסט ל־QA → Team 50: הרצת בדיקות, 0 SEVERE (שער א') | ⬜ |

---

**Team 10 (The Gateway)**  
**log_entry | ORDER_OF_WORK_UNTIL_GATE_A | ISSUED | 2026-02-10**
