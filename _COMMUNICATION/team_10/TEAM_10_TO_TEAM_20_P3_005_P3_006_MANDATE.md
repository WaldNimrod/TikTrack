# Team 10 → Team 20: מנדט משימות P3-005 + P3-006 (תיקון חסימת שער ב')

**id:** `TEAM_10_TO_TEAM_20_P3_005_P3_006_MANDATE`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**מקור:** `TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_REVIEW.md` — שער ב' BLOCKED; חובה תיקון לפני הגשה חוזרת.

---

## 1. מטרה

חלוקת משימות ברורה לביצוע — כדי לפתוח מחדש את 1-001, 1-003, 1-004 לשער ב'. **אתם אחראים על התוצרים המפורטים להלן.**

---

## 2. P3-005 — FOREX_MARKET_SPEC (תיקון 1-001)

| # | משימה | תוצר נדרש | דיווח |
|---|--------|-------------|--------|
| 2.1 | **תרומה לעדכון SSOT** — תוכן טכני ל־`documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md`: Providers = **Yahoo + Alpha בלבד** (אין Frankfurter); **FX EOD בלבד**; Primary/Fallback (Alpha → Yahoo); **Cache-First** (no external call before local cache); Scope מטבעות **USD/EUR/ILS**. | טיוטת סעיפים או עדכון קובץ FOREX_MARKET_SPEC (תיאום עם Team 10 לאישור סופי). | קובץ ב־documentation או העברת טיוטה ל־Team 10. |
| 2.2 | **יישור קוד/שרת** — וידוא שהשרת והשירותים עומדים במה שכתוב ב־FOREX_MARKET_SPEC המעודכן: Cache-First, EOD only, Yahoo+Alpha, Primary/Fallback. | קוד ותצורה מיושרים. | דוח השלמה קצר ב־`_COMMUNICATION/team_20/` (למשל TEAM_20_P3_005_FOREX_ALIGNMENT_COMPLETE.md). |

**קריטריון קבלה:** Team 90 יבדוק ש־FOREX_MARKET_SPEC.md מעודכן לפי ADR-022 וש־ה-SSOT מתאים לקוד.

---

## 3. P3-006 — Precision Policy (תיקון 1-004)

**תנאי מקדים:** Team 10 יפרסם מסמך **Precision Policy SSOT** (מפת החלטות 20,8 vs 20,6 לכל ישות). לאחר פרסום — חובה עליכם:

| # | משימה | תוצר נדרש | דיווח |
|---|--------|-------------|--------|
| 3.1 | **יישור Field Maps** — כל ה־Field Maps שבאחריותכם (כולל cash_flows.amount וכל שדה כסף אחר) — בהתאם למסמך Precision Policy. | Field Maps מעודכנים ומיושרים. | רשימת שינויים או קישור ל־commits/specs. |
| 3.2 | **יישור Models** — מודלי נתונים (אם יש) — Precision בהתאם ל־Policy. | מודלים מעודכנים. | above. |
| 3.3 | **Evidence חדש** — דוח Evidence ל־Precision Audit **לאחר** היישור (בפורמט דומה ל־TEAM_20_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE). | קובץ Evidence ב־`_COMMUNICATION/team_20/`. | TEAM_20_P3_006_PRECISION_EVIDENCE.md (או שם דומה). |

**קריטריון קבלה:** אין סתירה בין Field Maps/Models ל־Precision Policy; Evidence מעודכן וזמין ל־Team 90.

---

## 4. סדר ביצוע מומלץ

1. **P3-005:** להשלים תרומה ל־FOREX_MARKET_SPEC + יישור קוד — ולדווח.
2. **P3-006:** להמתין למסמך Precision Policy מ־Team 10; עם קבלתו — לבצע 3.1–3.3 ולדווח.

---

## 5. דיווח ל־Team 10

- כל **תוצר מוגמר** — דוח/קובץ בתיקיית `_COMMUNICATION/team_20/` + עדכון Team 10 (הוספת log או הפניה ברשימת המשימות).
- ללא דוחות השלמה — Team 10 **לא** יגיש Gate-B מחדש ל־90.

---

**log_entry | TEAM_10 | TO_TEAM_20 | P3_005_P3_006_MANDATE | 2026-02-13**
