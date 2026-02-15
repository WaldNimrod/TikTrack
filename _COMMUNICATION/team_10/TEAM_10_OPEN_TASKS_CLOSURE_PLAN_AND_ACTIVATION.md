# Team 10 — תוכנית סגירת סעיפים פתוחים + הפעלת צוותים

**id:** TEAM_10_OPEN_TASKS_CLOSURE_PLAN_AND_ACTIVATION  
**מקור:** רשימת המשימות המרכזית (TEAM_10_MASTER_TASK_LIST)  
**תאריך:** 2026-02-15  
**סטטוס:** תוכנית מאושרת — הודעות הפעלה יוצאות

---

## 1. סיכום סעיפים פתוחים (Master Task List)

| מזהה | שם | צוותים | מקור |
|------|-----|--------|------|
| **P3-003** | Blueprint Scope + Drift | Team 31 + Team 10 | TEAM_10_TO_TEAM_90_ROADMAP_V2_1_RESPONSE_AND_STAGE1_PLAN.md |
| **P3-004** | ADR-022 + POL-015 Enforcement | Team 30 + Team 10 + Team 20 + Team 60 | TEAM_90_TO_TEAM_10_ADR_022_AND_POL_015_1_ENFORCEMENT.md |
| **P3-010** | External Data M4 — Cadence + Ticker Status | Team 10 + Team 20 | TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md |

**מסלול נוסף (OPEN_TASKS_MASTER):** Smart History Fill QA — רה־ריצת QA + Evidence (Team 20 + Team 50) — מנדט קיים: TEAM_10_SMART_HISTORY_FILL_QA_URGENT_FIXES_MANDATE.

---

## 2. סדר סגירה מומלץ (תלויות ולוגיקה)

1. **P3-003** — אין תלות בצוותים אחרים. החלטה/תיעוד (Blueprint ↔ Roadmap, OUT OF SCOPE). **סגירה ראשונה.**
2. **P3-010** — SSOT (Team 10) ואז מימוש (Team 20). תלות רק ב־10→20. **סגירה שנייה.**
3. **P3-004** — חלק Team 30 כבר בוצע (Unified Shell, EOD Warning); נותר: Team 10 (SSOT + Evidence), Team 20 (אימות Provider Lock / Cache-first), Team 60 (אימות תשתית אם נדרש). **סגירה שלישית.**
4. **SHF QA** — במקביל: Team 20 (Seed 250+) + Team 50 (רה־ריצת QA) — לא לסגור עד Evidence מעודכן.

---

## 3. שלבים וחלוקת תפקידים

### שלב א — P3-003 (Blueprint Scope + Drift)

| צוות | תפקיד | תוצר | סגירה |
|------|--------|------|--------|
| **Team 10** | מוביל. הפקת מטריצת Blueprint ↔ Roadmap; סימון עמודים IN SCOPE / OUT OF SCOPE (או ממתין להחלטה). | מסמך/טבלה: רשימת עמודים + סטטוס; עדכון Page Tracker/תיעוד. | ✅ **הושלם** — TEAM_10_P3_003_BLUEPRINT_SCOPE_AND_DRIFT_MATRIX.md (2026-02-15). P3-003 → CLOSED. |
| **Team 31** | תשומה (אם נדרש): רשימת עמודים קיימים אצלם שלא ב-Roadmap v2.1. | רשימה או אישור מטריצה. | לפי בקשת Team 10. |

**קריטריון קבלה:** Evidence: routes/menu מעודכנים (כבר ב-P3-001, P3-002); מטריצת Blueprint + טיפול Drift מתועד.

---

### שלב ב — P3-010 (Cadence + Ticker Status)

| צוות | תפקיד | תוצר | סגירה |
|------|--------|------|--------|
| **Team 10** | עדכון SSOT: Cadence Policy לפי ticker status (מקור: is_active_flags); הוספת System Settings cadence config ב־MARKET_DATA_PIPE_SPEC (לפי החלטת TEAM_90_MARKET_DATA_GAPS §6). | MARKET_DATA_PIPE_SPEC.md מעודכן; קישור ל־TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT אם רלוונטי. | תיעוד ב־Evidence. |
| **Team 20** | מימוש: cadence לפי סטטוס (Active = intraday, inactive = EOD); יישור ל־SSOT. | קוד + Evidence קצר. | Seal (SOP-013) לסגירת P3-010. |

**תלות:** Team 20 מתחיל אחרי עדכון SSOT (Team 10).

---

### שלב ג — P3-004 (ADR-022 + POL-015 — השלמת חלקים)

| צוות | תפקיד | תוצר | סטטוס נוכחי |
|------|--------|------|--------------|
| **Team 30** | Unified Shell + EOD Warning | תבנית אחידה; אזהרת EOD ב-UI. | ✅ **Seal התקבל** — TEAM_30_TO_TEAM_10_P3_004_SEAL_SOP_013.md (2026-02-15). ACK: TEAM_10_TO_TEAM_30_P3_004_SEAL_ACK.md. |
| **Team 10** | SSOT + Evidence: FOREX_MARKET_SPEC, MARKET_DATA_PIPE_SPEC, WP_20_09; Evidence log; וידוא אין Frankfurter בתיעוד. | מסמכים מעודכנים; Evidence log ייעודי ל־P3-004. | ✅ **הושלם** — documentation/05-REPORTS/artifacts/TEAM_10_P3_004_ADR_022_POL_015_EVIDENCE_LOG.md (2026-02-15). P3-004 → CLOSED. |
| **Team 20** | אימות: אין Frankfurter בקוד; Cache-first מאומת; Provider Interface לפי config. | דוח אימות קצר או הצהרה ב-Seal. | OPEN (מימוש Provider/Cache כבר ב-P3-008, P3-009 — נדרש אימות ל-Gate B). |
| **Team 60** | אימות תשתית (אם יש שינוי תשתית ל-ADR-022). | דוח או "אין שינוי נדרש". | ✅ **אושר** — TEAM_60_P3_004_VERIFICATION_REPORT.md (2026-02-15). ACK: TEAM_10_TO_TEAM_60_P3_004_VERIFICATION_ACK.md. |

**קריטריוני קבלה (Gate B):** אין אזכור Frankfurter; Cache-first מאומת; אזהרת EOD מוצגת; תבנית אחידה כולל Auth.

---

### שלב ד — Smart History Fill QA (מסלול מקביל)

| צוות | תפקיד | תוצר |
|------|--------|------|
| **Team 20** | Seed 250+ ימי מסחר; תיקונים (403, 404 UI) — הושלמו. | וידוא נתונים + Evidence. |
| **Team 50** | רה־ריצת QA מלאה. | דוח QA + Evidence מעודכן. |

**מנדט קיים:** TEAM_10_SMART_HISTORY_FILL_QA_URGENT_FIXES_MANDATE. לא לסגור עד Evidence מעודכן.

---

## 4. הודעות הפעלה (מסמכים נפרדים)

| צוות | מסמך הפעלה | משימות |
|------|------------|--------|
| **Team 10** | (פנימי) ביצוע שלב א + חלק Team 10 בשלב ג. | P3-003 (מטריצה); P3-010 (SSOT); P3-004 (SSOT + Evidence). |
| **Team 31** | TEAM_10_TO_TEAM_31_P3_003_BLUEPRINT_SCOPE_REQUEST | תשומה ל־P3-003 (רשימת עמודים / אישור מטריצה). |
| **Team 20** | TEAM_10_TO_TEAM_20_P3_010_AND_P3_004_ACTIVATION | P3-010 (cadence + ticker_status); P3-004 (אימות ADR-022). |
| **Team 30** | TEAM_10_TO_TEAM_30_P3_004_SEAL_REMINDER | תזכורת: השלמת P3-004 — Seal (SOP-013) אם טרם נחתם. |
| **Team 60** | TEAM_10_TO_TEAM_60_P3_004_VERIFICATION_REQUEST | אימות תשתית ל־P3-004 (אין Frankfurter; תאימות). |
| **Team 50** | (מנדט SHF קיים) | רה־ריצת QA — Smart History Fill. |

---

## 5. סדר ביצוע (ציר זמן מומלץ)

1. **מיידי:** Team 10 — התחלת P3-003 (מטריצה); שליחת בקשת תשומה ל־Team 31.
2. **אחרי מטריצה P3-003:** Team 10 — עדכון SSOT ל־P3-010 (Cadence + ticker_status).
3. **אחרי SSOT P3-010:** Team 20 — מימוש cadence; Seal ל־P3-010.
4. **במקביל:** Team 10 — SSOT + Evidence ל־P3-004; Team 20 — אימות ADR-022; Team 60 — אימות P3-004; Team 30 — הגשת Seal ל־P3-004 אם נדרש.
5. **מסלול SHF:** Team 20 + Team 50 — רה־ריצת QA + Evidence.

---

**log_entry | TEAM_10 | OPEN_TASKS_CLOSURE_PLAN_AND_ACTIVATION | 2026-02-15**
