# Team 10 → Team 60: מנדט משימה P3-006 — Precision Policy (תיקון חסימת שער ב')

**id:** `TEAM_10_TO_TEAM_60_P3_006_MANDATE`  
**from:** Team 10 (The Gateway)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**מקור:** `TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_REVIEW.md` — 1-004 BLOCKED; חובה יישור DB + Evidence לפני הגשה חוזרת.

---

## 1. מטרה

**אתם אחראים** על יישור ה־DB/סכמה והמודלים שבאחריותכם ל־**Precision Policy SSOT** (ש־Team 10 יפרסם), ועל **Evidence חדש** לאחר היישור — כדי לפתוח מחדש 1-004 לשער ב'.

---

## 2. P3-006 — Precision Audit (תיקון 1-004)

**תנאי מקדים:** Team 10 יפרסם מסמך **Precision Policy SSOT** (מפת החלטות 20,8 vs 20,6 לכל ישות — כולל cash_flows.amount, brokers_fees.minimum וכו').  
**לאחר פרסום המסמך:**

| # | משימה | תוצר נדרש | דיווח |
|---|--------|-------------|--------|
| 2.1 | **יישור DB/Schema** — וידוא שכל עמודות הכסף והמספרים ב־DB תואמות ל־Precision Policy (כולל תיקון אי־ההתאמה: brokers_fees.minimum — 20,8 ב־DB מול 20,6 ב־SSOT; ו־cash_flows.amount לפי ההחלטה הסופית). | סכמה/מיגרציות/תצורה מעודכנים; אין סתירה ל־Policy. | דוח השלמה קצר ב־`_COMMUNICATION/team_60/`. |
| 2.2 | **Evidence חדש** — דוח Evidence ל־Precision Audit **אחרי** היישור (בפורמט דומה ל־TEAM_60_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE). | קובץ Evidence ב־`_COMMUNICATION/team_60/`. | TEAM_60_P3_006_PRECISION_EVIDENCE.md (או שם דומה). |

**קריטריון קבלה:** Team 90 יבדוק שאין סתירה בין DB/SSOT ל־Precision Policy ו־Evidence מעודכן.

---

## 3. סדר ביצוע

1. להמתין למסמך **Precision Policy SSOT** מ־Team 10.  
2. לבצע יישור DB/Schema (2.1) ו־Evidence (2.2).  
3. לדווח ל־Team 10 (קבצים ב־team_60 + הפניה ברשימת המשימות).

---

## 4. דיווח ל־Team 10

- ללא Evidence מעודכן ויישור DB — Team 10 **לא** יגיש Gate-B מחדש ל־90 על 1-004.

---

**log_entry | TEAM_10 | TO_TEAM_60 | P3_006_MANDATE | 2026-02-13**
