# 🚀 Team 10 → Team 30: הנעת עבודה עד שער א' — מנדט ביצוע

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Logic / Containers / API)  
**תאריך:** 2026-01-30  
**סטטוס:** 📋 **מנדט להנעת תהליך — סדר ביצוע מחייב**  
**הקשר:** אישור התקדמות התקבל; סדר עבודה עד שער א' — שלבים 0, 1, 2.

---

## 1. מטרת ההודעה

להנחות את Team 30 בביצוע **שלבים 0, 1 ו־2** לפי סדר העבודה המחייב עד **שער א'** (Team 50 — הרצת סוויטת בדיקות, 0 SEVERE). אין לדלג על שלב; Stage 0 חוסם את 1 ו־2.

**מסמכי SSOT מחייבים:**
- `_COMMUNICATION/team_10/ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md` — נעילה Stage 0 + Auth 4-Type (§3, §3.1).
- `_COMMUNICATION/team_10/TEAM_10_VISUAL_GAPS_WORK_PLAN.md` — סעיפים 4, 4.3, 4.3.1, משימה 7.
- `_COMMUNICATION/team_10/TEAM_10_ORDER_OF_WORK_UNTIL_GATE_A.md` — סדר העבודה המלא.

---

## 2. סדר הביצוע (חובה)

| שלב | תיאור | סטטוס |
|-----|--------|--------|
| **0** | גשר React/HTML (Bridge) — BLOCKING | ⬜ |
| **1** | שער אוטנטיקציה (4 טיפוסים A/B/C/D) | ⬜ |
| **2** | Header תמיד אחרי Login → Home | ⬜ |

**דיווח השלמה:** עם סיום כל שלב (או שלבים) — דיווח ל־Team 10 ב־`_COMMUNICATION/team_30/` עם רשימת משימות שבוצעו וקבצים ששונו.

---

## 3. שלב 0 — גשר React/HTML (Bridge) (BLOCKING)

**מקור:** `TEAM_90_REACT_HTML_BRIDGE_FINDINGS_DRAFT.md`; **SSOT:** `ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md`.

### 3.1 פעולות מחייבות

| # | פעולה | פרט |
|---|--------|------|
| 0.1 | **Lock Hybrid Model** | D16/D18/D21 = HTML; Auth/Home/Admin = React. וידוא שהקוד והתיעוד תואמים. |
| 0.2 | **Auth Redirect Rules (ADR‑013)** | C → Home (לא /login); A = No Header; B = Home Shared (שני containers); D = JWT role. |
| 0.3 | **routes.json** | `/login`, `/register`, `/reset-password` — ללא `.html`. וידוא ש־`ui/public/routes.json` תואם. |
| 0.4 | **Header Path** | נעילה על **`ui/src/views/shared/unified-header.html`** בלבד; הסרת/תיקון הפניות לנתיבים חלופיים (למשל `ui/src/components/core/unified-header.html`). |
| 0.5 | **React Tables** | רק דרך **TablesReactStage** ב־UAI; **אין mount per page**. |
| 0.6 | **איסור Header בתוך Containers** | מניעת SSR כפול — Header לא בתוך React Containers. |
| 0.7 | **Header Loader** | Header נטען **לפני** React mount (רלוונטי גם לשלב 2). |

### 3.2 קבצים רלוונטיים (לבדיקה/תיקון)

- `ui/src/components/core/authGuard.js` — מפנה אורח ל־**Home** (לא /login) בעמודי C.
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` — מפנה אורח ל־**Home** (לא /login).
- `ui/public/routes.json` — routes ללא .html.
- `ui/src/components/core/headerLoader.js` — טוען `unified-header.html` מנתיב **unified** בלבד.

---

## 4. שלב 1 — שער אוטנטיקציה (4 טיפוסים A/B/C/D)

**Shared (Type B) = טיפוס רשמי:** עמוד יחיד עם שני Containers; **אין Redirect** לאורח ב־B. ראה ADR SSOT §3.1.

### 4.1 פעולות מחייבות

| # | פעולה | פרט |
|---|--------|------|
| 1.1 | **Auth Guard מבחין A/B/C/D** | Type C: אורח → Home. Type B: **אין redirect** — אורח נשאר ב־Home ורואה Guest Container. |
| 1.2 | **Type B (Shared): Home** | עמוד **יחיד** — **Guest Container** (אורח) + **Logged-in Container** (מחובר); שני containers **באותו עמוד**. |
| 1.3 | **בדיקות חובה Type B** | אורח רואה Guest בלבד; מחובר רואה Logged-in בלבד; Login → Home מחליף תצוגה; אין Redirect ב־B. |
| 1.4 | **User Icon** | Success (logged-in) / Warning (logged-out); **אסור שחור**. |
| 1.5 | **Admin-only (D)** | בדיקת JWT role; לא־מנהל → redirect/403 ל־/admin/design-system. תיאום עם Team 20 (מקור role ב־JWT). |
| 1.6 | **עמודי A) Open** | login, register, reset-password — **ללא Header**. |
| 1.7 | **דיווח השלמה** | ל־Team 10. |

### 4.2 Code Evidence (לטפל)

- `ui/src/router/AppRouter.jsx` — Home **לא** ב־ProtectedRoute (נגיש לאורח + מחובר).
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` — redirect ל־**Home** (לא /login).
- `ui/src/components/HomePage.jsx` — **שני containers** באותו עמוד: Guest (אורח) + Logged-in (מחובר); רינדור לפי auth state.

---

## 5. שלב 2 — Header תמיד אחרי Login → Home

**תקלה קריטית:** Header נעלם אחרי Login — **תיקון ראשון בתעדוף**.

### 5.1 פעולות מחייבות

| # | פעולה | פרט |
|---|--------|------|
| 2.0 | **תיקון Header אחרי Login** | Header חייב להישאר אחרי מעבר Login → Home. |
| 2.1 | **Header Loader לפני React mount** | ADR‑013 — וידוא סדר טעינה. |
| 2.2 | **וידוא Header** | מוצג בכל עמוד שאינו A) Open. |
| 2.3 | **דיווח השלמה** | ל־Team 10. |

**רפרנס:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` משימה 7; ADR SSOT §6.7.

---

## 6. SLA ותיאום

- **TT2_SLA_TEAMS_30_40:** Team 30 = Containers, Logic, API. איסור API בתיקיות UI.
- **Admin JWT (Type D):** תיאום עם Team 20 — שדה `role` ב־JWT.
- **User Icon צבעים:** תיאום עם Team 40 — Success/Warning; הסרת ברירת מחדל שחורה ב־unified-header / CSS.

---

## 7. מסירת דיווח ל־Team 10

בסיום שלב (או צבר שלבים):

1. קובץ דיווח ב־`_COMMUNICATION/team_30/` בשם ברור (למשל `TEAM_30_STAGE_0_1_2_COMPLETION_REPORT.md`).
2. בתוך הדיווח: רשימת משימות שבוצעו, קבצים ששונו, וכל חסימה/שאלה שנותרה.

---

**Team 10 (The Gateway)**  
**log_entry | GATE_A_KICKOFF | TO_TEAM_30 | 2026-01-30**
