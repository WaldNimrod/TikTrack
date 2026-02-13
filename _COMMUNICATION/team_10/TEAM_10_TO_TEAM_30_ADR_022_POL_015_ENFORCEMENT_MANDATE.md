# Team 10 → Team 30: מנדט מימוש — ADR-022 + POL-015 v1.1 (Enforcement)

**id:** `TEAM_10_TO_TEAM_30_ADR_022_POL_015_ENFORCEMENT`  
**from:** Team 10 (The Gateway)  
**to:** Team 30 (Frontend)  
**date:** 2026-02-13  
**מקור:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_ADR_022_AND_POL_015_1_ENFORCEMENT.md` — **MANDATORY — ARCHITECT LOCKED**

---

## 1. רקע

צוות 90 העביר ל-Team 10 הכרעת אכיפה (ADR-022 + POL-015 v1.1). החלקים הרלוונטיים **לצוות 30** — מימוש בפועל ב-UI ובתבניות — מפורטים להלן.

---

## 2. POL-015 v1.1 — תבנית עמוד (Unified Shell)

**מסמך SSOT:** `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT_v1.1.md`

| דרישה | מימוש נדרש |
|--------|-------------|
| **אין חריגות לעמודי Auth** | עמודי Login / Register / Reset **לא** מוחרגים — חלים עליהם אותם כללי תבנית כמו על שאר העמודים. |
| **תבנית HTML אחת גמישה** | תבנית **אחת** שתומכת בכל סוגי ה-Layouts (**Type A / B / C / D**) דרך **קונפיגורציה ב-UAI** (UnifiedAppInit). אין תבניות נפרדות ל-Auth. |

**תוצר:** תבנית אחידה לכל העמודים (כולל Auth); בחירת Type A/B/C/D ורכיבים — דרך UAI config בלבד.

---

## 3. ADR-022 §2.4 — אזהרה ויזואלית EOD

**מקור:** ADR-022 (Market Data Stage-1) — `ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md`

| דרישה | מימוש נדרש |
|--------|-------------|
| **אזהרה ויזואלית** | כאשר **מחיר EOD** (End-of-Day) מוצג למשתמש — חובה להציג **אזהרה ויזואלית** ברורה (למשל טקסט/באנר/אייקון) שמציינת שהנתונים הם EOD. |

**תיאום:** Backend מחזיר `staleness` (ok / warning / na) — ה-UI חייב להציג אזהרה כשהערך מתאים (למשל `warning` או `na` או כשמוצג מחיר EOD לפי החוזה עם ה-API).

**תוצר:** אזהרת EOD מוצגת בפועל ב-UI בכל מקום שמציגים מחיר EOD.

---

## 4. קריטריוני קבלה (Gate B — רלוונטי ל-30)

- **תבנית אחידה** לכל העמודים **כולל Auth** — אין החרגות.
- **אזהרת EOD** מוצגת בפועל ב-UI כאשר מחיר EOD מוצג למשתמש.

---

## 5. מקורות והפניות

| מסמך | נתיב |
|------|------|
| Enforcement (Team 90 → 10) | `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_ADR_022_AND_POL_015_1_ENFORCEMENT.md` |
| POL-015 v1.1 (חוזה תבנית) | `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT_v1.1.md` |
| ADR-022 (פסיקת Market Data) | `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md` |
| UAI Config | `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md` (לפי הצורך) |

---

## 6. דיווח והמשך

- דוחות ביצוע / Evidence — בתיקיית `_COMMUNICATION/team_30/`.
- Team 10 יעדכן את רשימת המשימות המרכזית עם משימות Level-2 (Unified Shell, EOD Visual Warning) לפי הצורך; מימוש זה הוא חלק מאכיפת ADR-022 ו-POL-015 v1.1.

---

**log_entry | TEAM_10 | TO_TEAM_30 | ADR_022_POL_015_ENFORCEMENT_MANDATE | 2026-02-13**
