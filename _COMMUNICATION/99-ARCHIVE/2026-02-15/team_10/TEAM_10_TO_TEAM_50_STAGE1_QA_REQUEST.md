# Team 10 → Team 50: בקשה לביצוע בדיקות — Stage-1 (משימות 1-001 … 1-004)

**id:** `TEAM_10_TO_TEAM_50_STAGE1_QA_REQUEST`  
**from:** Team 10 (The Gateway)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-02-13  
**נושא:** בקשת ביצוע בדיקות QA לפי נוהל המעודכן — פירוט הבדיקות הדרושות בהתאם למשימות שבוצעו

---

## 1. רפרנס לנוהל הבדיקות (חובה)

**נוהל בדיקות מעודכן — SSOT:**

| מסמך | נתיב | סעיפים רלוונטיים |
|------|------|-------------------|
| **פרוטוקול שערי איכות** | `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md` | **§1א, §1ב** — תנאי חריגה ומסירת קונטקסט; **§2** — שער א' (סבב ראשון, תיקונים ישירים לצוותים), שער ב' (ולידציה צוות 90); **§3** — סגירת שלב/משימה רק לאחר שער א'+ב'. |
| **נוהל עבודה QA — Team 50** | `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md` | תנאי הפעלה, Gate A/B/C, דיווח תקלות — `TT2_TEAM_50_DEFECT_REPORTING_PROCEDURE`. |

**תזכורת תהליך (מתוך הנוהל):**

- **סבב ראשון (שער א'):** צוות 50 מבצע את הבדיקות; **מחזיר תיקונים ישירות לצוותים** (20, 30, 60 וכו'); הצוותים מתקנים ומדווחים; אין סגירת שער א' לפני השלמת תיקונים ומעבר הבדיקות.
- **אחר כך — ולידציה (שער ב'):** המרגל (צוות 90) מבצע ביקורת חיצונית.
- **סגירת משימה:** Team 10 מסמן CLOSED רק לאחר שער א' + שער ב'.

---

## 2. קונטקסט למשימות (מה פותח, מה לבדוק)

המשימות הבאות הושלמו על ידי הצוותים ומועברות כעת לשלב QA (סטטוס PENDING_VERIFICATION):

| # משימה | שם | צוותים אחראים (לתיקונים) | תוצר שהושלם |
|---------|-----|---------------------------|--------------|
| **1-001** | FOREX_MARKET_SPEC | Team 20, Team 10 | אפיון SSOT — שערים ומחירים; קובץ ב-documentation/01-ARCHITECTURE/ |
| **1-002** | MARKET_DATA_PIPE + exchange_rates | Team 20, Team 60 | ספק שוק + DDL טבלת exchange_rates; סקריפט מיגרציה; אפיון ב-SSOT |
| **1-003** | CASH_FLOW_PARSER | Team 20, Team 10 | אפיון SSOT — פיענוח תזרימי מזומן |
| **1-004** | Precision Audit Evidence | Team 20, Team 60 | Evidence דיוק (Decimal(20,8), שמות וכו') — הוגש ל-Team 90; נדרש אימות |

---

## 3. פירוט הבדיקות הדרושות (לפי משימה)

### 3.1 משימה 1-001 — FOREX_MARKET_SPEC

| בדיקה | מה לבדוק | מול איפה / איך |
|--------|-----------|-----------------|
| **Doc↔Code (Gate A)** | התאמת האפיון ל-SSOT; שמות שדות, טיפוסים, עקביות עם סכמות/API אם קיים | `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md` — וידוא עקביות עם OpenAPI/מודלים אם יש |
| **עקביות תיעוד** | אין סתירות בין המסמך ל-D15/00_MASTER_INDEX או למפרט שוק/מטבעות אחרים | 00_MASTER_INDEX, מפרטים קשורים ב-01-ARCHITECTURE |
| **Evidence** | וידוא שהמסמך מקודם ב-SSOT ומופיע ברשימת הארכיטקטורה | מיקום קובץ; הפניות ב-Master Index |

**תיקונים:** כל ממצא — דיווח ל-Team 10 + **החזרת תיקון ישירות ל-Team 20 / Team 10** (לפי `TT2_TEAM_50_DEFECT_REPORTING_PROCEDURE`).

---

### 3.2 משימה 1-002 — MARKET_DATA_PIPE + exchange_rates

| בדיקה | מה לבדוק | מול איפה / איך |
|--------|-----------|-----------------|
| **DDL ותשתית** | קיום ועקביות סקריפט המיגרציה וטבלת `exchange_rates` | `scripts/migrations/create_exchange_rates_table.sql` (או נתיב עדכני); הרצה מול DB — וידוא שהטבלה נוצרת ושהשדות תואמים לאפיון |
| **Spec↔DB** | התאמת שמות עמודות, טיפוסים (במיוחד Decimal למחירים/שערים) לאפיון | `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` |
| **דוח השלמה** | וידוא שדוח ההשלמה של Team 60 תואם למה שבוצע (טבלה, סקריפטים) | `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_STAGE1_1_002_COMPLETION_REPORT.md` |
| **Gate A** | endpoints/נתיבים רלוונטיים אם קיימים — התאמה ל-Spec | OpenAPI / routes — בהתאם ל-MARKET_DATA_PIPE_SPEC |

**תיקונים:** ממצאים — **ישירות ל-Team 20 או Team 60** (DDL/תשתית → 60; אפיון/לוגיקה → 20) + דיווח ל-Team 10.

---

### 3.3 משימה 1-003 — CASH_FLOW_PARSER_SPEC

| בדיקה | מה לבדוק | מול איפה / איך |
|--------|-----------|-----------------|
| **Doc↔Code (Gate A)** | התאמת האפיון ל-SSOT; שמות, טיפוסים, כללי פיענוח | `documentation/01-ARCHITECTURE/CASH_FLOW_PARSER_SPEC.md` |
| **עקביות** | אין סתירות למודלים/תזרימים במערכת (חשבונות, מזומן) | OpenAPI, TEAM_20_DATA_MODELS או מודלים רלוונטיים |
| **Evidence** | המסמך ב-SSOT ומופיע בתיעוד המרכזי | 00_MASTER_INDEX, documentation/01-ARCHITECTURE |

**תיקונים:** **ישירות ל-Team 20 / Team 10** + דיווח ל-Team 10.

---

### 3.4 משימה 1-004 — Precision Audit Evidence

| בדיקה | מה לבדוק | מול איפה / איך |
|--------|-----------|-----------------|
| **Evidence מ-Team 20** | קיום מסמך Evidence; עקביות עם דרישות Precision (Decimal(20,8), שמות שדות, וכו') | `_COMMUNICATION/team_20/` — קובץ Evidence ל-Stage-1 Precision Audit (שם קובץ כפי שפורסם ב-Master Task List או בדוח 20) |
| **Evidence מ-Team 60** | קיום מסמך Evidence; עקביות עם דרישות Precision ב-DB/סקריפטים | `_COMMUNICATION/team_60/TEAM_60_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE.md` (או מקביל ב-team_60) |
| **התאמה לסטנדרט** | וידוא שהעדויות עומדות בדרישות Precision Audit כפי שהוגדרו (GIN/נוהל) | נוהל Precision / GIN — בהתאם למה שצוות 90 קבע; דיווח ל-Team 10 אם יש חריגות |

**תיקונים:** **ישירות ל-Team 20 ול-Team 60** (לפי בעלות על הקוד/Evidence) + דיווח ל-Team 10. לאחר תיקונים — המשך ולידציה עם Team 90 (שער ב').

---

## 4. בקשת Team 10

1. **לבצע את הבדיקות** המפורטות למעלה **לפי הנוהל** ב-`TT2_QUALITY_ASSURANCE_GATE_PROTOCOL` ו-`TEAM_50_QA_WORKFLOW_PROTOCOL`.
2. **להחזיר תיקונים ישירות** לצוותים הרלוונטיים (20, 60, 10) — לא רק דיווח ל-Team 10.
3. **לדווח ל-Team 10** עם סיום סבב שער א': דוח סיכום (0 SEVERE או רשימת תיקונים פתוחה) — כדי לתאם המשך **ולידציה (שער ב')** עם Team 90.

---

## 5. רשימת קבצים מרכזיים (SSOT / Evidence)

| משימה | קובץ/נתיב עיקרי |
|--------|------------------|
| 1-001 | `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md` |
| 1-002 | `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`; `scripts/migrations/create_exchange_rates_table.sql`; `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_STAGE1_1_002_COMPLETION_REPORT.md` |
| 1-003 | `documentation/01-ARCHITECTURE/CASH_FLOW_PARSER_SPEC.md` |
| 1-004 | Evidence ב-`_COMMUNICATION/team_20/` ו-`_COMMUNICATION/team_60/` (Precision Audit) |

---

**log_entry | TEAM_10 | TO_TEAM_50 | STAGE1_QA_REQUEST | 2026-02-13**
