# Evidence Log — ADR-015 Broker Reference Activation

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**נושא:** סבב פיתוח — מנדט רפרנס ברוקרים (ADR-015) | **עמלות לפי חשבון מסחר**  
**סטטוס:** **שער א' מאושר ✅** — Team 50 GATE_A_PASSED + Team 90 Independent Verification PASS. **מוכן לשער ב' (Team 90).**

---

## 1. מקור

- **מנדט:** ARCHITECT_BROKER_REFERENCE_MANDATE.md (ADR-015)  
- **תיקייה:** `_COMMUNICATION/90_Architects_comunication/` (מסונכרן מ-Google Drive)  
- **PROMPTS FOR THE FIELD:** Team 10, 20, 30 — הועברו כמנדטים מסודרים.

---

## 2. בוצע על ידי Team 10

| פעולה | קובץ / מיקום |
|--------|----------------|
| תוכנית עבודה (סדר ביצוע, תלויות) | `_COMMUNICATION/team_10/TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md` |
| שאלות השלמה לאדריכלית (פילטר — ללא ניחושים) | `_COMMUNICATION/team_10/TEAM_10_TO_ARCHITECT_ADR_015_COMPLETION_QUESTIONS.md` |
| מנדט ל-Team 20 (Endpoint + JSON ברוקרים) | `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md` |
| מנדט ל-Team 30 (Conditional Rendering + Auto-fill) | `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md` |
| מסמך סופי לאישור אדריכלית | `_COMMUNICATION/team_10/ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md` |

---

## 3. החלטה אדריכלית (עמלות לפי חשבון)

- **עמלות שייכות לחשבון מסחר (Trading Account), לא לברוקר.** Broker = מטא-דאטה של חשבון.
- **D16** = חשבונות מסחר + בחירת ברוקר; "אחר" והודעת משילות — **ב-D16 בלבד**.
- **D18** = **עמלות לכל חשבון מסחר** — בחירת חשבון + עמלות של החשבון (trading_account_id).
- **DB/API:** חובה trading_account_id בעמלות; אין broker כ-FK בעמלות. תיקון עומק נדרש (טבלה נוכחית brokers_fees ללא account FK).
- **חסימות SSOT נסגרו (2026-02-12):** (1) DDL — trading_account_id ב-brokers_fees, הסרת broker. (2) "אחר" — מגיע מה-API, value "other", is_supported false. (3) הודעת משילות — SSOT ב-ADR_015_GOVERNANCE_MESSAGE_SSOT.md. (4) **סבב 2:** commission_value NUMERIC(20,6) ב-DDL + הפניה ל-TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md. (5) מיגרציה Account↔Fees — סעיף מפורש בתוכנית §6א ובמנדט Team 20 §2.3. **READY FOR DISTRIBUTION.**

---

## 4. סדר ביצוע (מעודכן — Fees per Account)

1. Team 10 — עדכון מסמכים; החזרת תוכנית לאישור; **אין הוצאת משימות עד לאישור**.  
2. **Team 20 — הושלם ✅** — הרחבת GET /reference/brokers (display_name, is_supported, default_fees, "other"); DB/API עמלות לפי חשבון; מיגרציה נמסרה ל-60. דוח: `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_ADR_015_COMPLETION_REPORT.md`.  
2א. **Team 60 — מיגרציה הושלמה ✅** — גיבוי DB, הרצת סקריפט מיגרציה, אימות. דוח: `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_ADR_015_MIGRATION_COMPLETE.md`. תוצאה: 3 שורות עודכנו, 14 נמחקו (ללא התאמה); טבלה תואמת SSOT.  
3. **Team 30 — הושלם ✅** — D16: "אחר" + הודעת משילות; D18: בחירת חשבון + עמלות לפי trading_account_id. Build עבר (110 מודולים). דוח: `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_ADR_015_VERIFICATION_REPORT.md`; Evidence: `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_ADR_015_INITIAL_VERIFICATION_REPORT.md`.  
4. **Team 50 — שער א' הושלם ✅** — E2E D16 (אחר + הודעה), D18 (trading_account_id), 0 SEVERE. דוח: `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_ADR_015_GATE_A_QA_REPORT.md`.  
5. **Team 90 — אימות עצמאי שער א' ✅** — הרצה עצמאית לפי נוהל: Passed 3, Failed 0, 0 SEVERE. Artifacts: ADR015_GATE_A_RESULTS.json. Validation: D16 "אחר"→הודעה ✔️, D18 trading_account_id ✔️, Console hygiene ✔️. **Gate A ל-ADR-015 מאושר; אפשר להתקדם לשער ב'.**

---

## 5. דיווחי צוותים (ADR-015)

| צוות | מסמך | סטטוס |
|------|------|--------|
| Team 20 | documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_ADR_015_COMPLETION_REPORT.md | 🟢 COMPLETE (2026-02-12) |
| Team 60 | _COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_ADR_015_MIGRATION_COMPLETE.md | 🟢 MIGRATION_COMPLETE (2026-02-12) |
| Team 30 | _COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_ADR_015_VERIFICATION_REPORT.md | 🟢 COMPLETE + בדיקה ראשונית (Build, Code Review) |
| **Team 50** | _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_ADR_015_GATE_A_QA_REPORT.md | 🟢 **GATE_A_PASSED** (2026-02-12) — D16, D18, 0 SEVERE |
| **Team 90** | אימות עצמאי (Independent Verification) | 🟢 **PASS** — Passed 3, Failed 0, 0 SEVERE; Artifacts: ADR015_GATE_A_RESULTS.json |

## 6. QA (שער א') — הושלם ✅

**נוהל:** TT2_QUALITY_ASSURANCE_GATE_PROTOCOL — צוות 10 מסר קונטקסט מפורט ל-Team 50; Team 50 ביצע שער א' (אוטומציה, E2E).  
**מסירת קונטקסט:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_ADR_015_QA_KICKOFF.md`  
**תוצר:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_ADR_015_GATE_A_QA_REPORT.md` — GATE_A_PASSED, 0 SEVERE  
**Evidence:** `documentation/05-REPORTS/artifacts_SESSION_01/adr015-gate-a-artifacts/ADR015_GATE_A_RESULTS.json`  
**Team 90 Independent Verification:** PASS (Passed 3, Failed 0, 0 SEVERE) — Gate A מאושר; אפשר להתקדם לשער ב'.

---

**log_entry | TEAM_10 | ADR_015_EVIDENCE | 2026-02-12**  
**log_entry | TEAM_10 | ADR_015_TEAM_60_MIGRATION_ACK | 2026-02-12**
