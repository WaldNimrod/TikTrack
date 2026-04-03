---
id: TEAM_101_PIPELINE_SIMULATION_RESEARCH_GAP_ANALYSIS_v1.0.0
historical_record: true
from: Team 101 (research lane)
date: 2026-03-23
status: ACTIVE — updated post–Team 61 constitution alignment (2026-03-23)
mandate_ref: TEAM_100_TO_TEAM_101_CANARY_SIMULATION_MANDATE_v1.0.0---

# מחקר והרחבה — פערים, ערוצים, וחבילת עבודה לסגירה

מסמך זה מרכז **גוף ידע** לצורך דיון אדריכלי ולקביעת **חבילת עבודה** (לא Seal). הנתונים הממוספרים מסונכרנים ל־JSON: [`research/COVERAGE_AND_GAPS_EXPORT_v1.0.0.json`](research/COVERAGE_AND_GAPS_EXPORT_v1.0.0.json) (הרץ `python3 scripts/canary_simulation/export_research_artifacts.py` לעדכון).

---

## חלק א׳ — ליקויים מרכזיים לפי עדיפות (סדר יורד)

### P0 — חוסמים אמינות / השוואת מצב “מסך מול דיסק”

| ID | סטטוס | ליקוי / סגירה |
|----|--------|----------------|
| **GAP-001** | **סגור 2026-03-23** | `getExpectedFiles` הורחב ל-GATE_0 / GATE_1 (פאזים); אישור UX Team 30. ראו `TEAM_61_CONSTITUTION_ALIGNMENT_COMPLETION_REPORT_v1.0.0.md`, `TEAM_30_TO_TEAM_61_GETEXPECTEDFILES_UX_REVIEW_v1.0.0.md`. |
| **GAP-002** | **פתוח** | **אין parity אוטומטי** בין טקסט ב־**הצעד הבא / מנדטים** לבין קובץ `*_prompt.md` בדיסק — **WP:** SIM-CLOSE-02 (Team 50 + 101). |

### P1 — פערי מוצר / בלבול תפעולי / כיסוי חלקי

| ID | ליקוי | המלצה |
|----|--------|--------|
| **GAP-003** | **CURSOR_IMPLEMENTATION:** ב־`pipeline-dashboard.js` sub-steps מציגים `TEAM_20_*_API_VERIFY`; ב־`getExpectedFiles` ל־GATE_3/3.2 מופיע `*_IMPLEMENTATION` | לאחד כוונה (או לתעד “שלב א׳ / ב׳” במפורש) — משימה **SIM-CLOSE-03** |
| **GAP-004** | **Feedback detection / rescan / drift** — ללא רגרסיה | בדיקות ממוקדות עם קבצי verdict מדומים — **SIM-CLOSE-04** |
| **GAP-005** | **Phase B (B1–B3)** — לא רצים ב־CI בגלל תלות ב־state + SSOT | sandbox WP / job עם state זמני / הרצה מקומית מתועדת — **SIM-CLOSE-05** |

### P2 — שיפור איכות / היקף עתידי

| ID | ליקוי | המלצה |
|----|--------|--------|
| **GAP-006** | לוג **SEVERE** בדפדפן בזמן Selenium | לבודד מקור (הרחבות / fetch) |
| **GAP-007** | **HRC 4.3** — חסרים `data-testid` לכפתורי bulk / פריטים | להוסיף ב־UI — **SIM-CLOSE-06** |
| **GAP-008** | **Git / רעש repo** — מחוץ לסוויטה; אחריות Team 191 | תיאום מנדט נפרד, לא מחליף בדיקות pipeline |

---

## חלק ב׳ — מפת ערוצים (איפה בודקים מה)

| ערוץ | מה נבדק היום | רמת כיסוי | הערה |
|------|----------------|------------|------|
| **CLI** | `ssot_check`, KB-84, (חלקית) סקריפטים | חלקי | אין לולאת `pass` מלאה אוטומטית עם UI |
| **SSOT / pipeline_state** | `verify_layer1` | טוב | תלוי עקביות WSM מול parallel row |
| **Dashboard** | Selenium smoke + Phase A, MCP snapshot | חלקי | בלי מטריצת gate×phase מלאה |
| **Prompt files** | אין השוואה אוטומטית לדשבורד | פער | ראו GAP-002 |
| **Monitor / Constitution UI** | עודכן בקוד (Team 61); Canary suite לא מכסה Monitor במלואו | חלקי | ראו QA Team 51 |
| **Git** | לא | מחוץ לסקופ אוטומציה | Team 191 |

---

## חלק ג׳ — מה מומש בקוד במחזור האחרון (הרחבה)

| מרכיב | מצב | מיקום |
|--------|-----|--------|
| מטריצת gate×phase (מסמך) | פעיל | `TEAM_101_SIMULATION_GATE_PHASE_MAP_v1.0.0.md` |
| גנרטור mocks | פעיל; **תוקן** התאמת שם קובץ Team 20 ל־`*_IMPLEMENTATION` כמו `getExpectedFiles` | `scripts/canary_simulation/generate_mocks.py` |
| ייצוא מחקר מכונה | פעיל | `export_research_artifacts.py` → `research/COVERAGE_AND_GAPS_EXPORT_v1.0.0.json` |
| דוח אימות ריצות | פעיל | `TEAM_101_CANARY_SIMULATION_IMPLEMENTATION_AND_VERIFICATION_REPORT_v1.0.0.md` |

---

## חלק ד׳ — חבילת עבודה מוצעת לסגירת פערים (למסירה ל-Team 10)

| מזהה | כותרת | בעלים מוצע |
|------|--------|-------------|
| SIM-CLOSE-01 | Expected files ל־GATE_0 / GATE_1 — **נמסר** (Team 61 + Team 30 UX) | — |
| SIM-CLOSE-02 | בדיקת parity prompt ↔ מסך | Team 50 + 101 |
| SIM-CLOSE-03 | יישור sub-steps מול getExpectedFiles | Team 101 + 30 |
| SIM-CLOSE-04 | רגרסיה ל-feedback layers | Team 50 |
| SIM-CLOSE-05 | CI / sandbox ל-negative path | Team 61 |
| SIM-CLOSE-06 | testids ל-HRC | Team 30 |

---

## חלק ה׳ — ממצאי עמוד Constitution (2026-03-23) — **סגור**

**CON-001 … CON-004** טופלו על ידי **Team 61**; **Team 51 QA_PASS** (2026-03-23).  
**פנקס החלטות SSOT:** [`../team_61/TEAM_61_SSOT_GATE0_ALIAS_DECISION_v1.0.0.md`](../team_61/TEAM_61_SSOT_GATE0_ALIAS_DECISION_v1.0.0.md)  
**החזרה ל-Team 101:** [`../team_61/TEAM_61_TO_TEAM_101_CONSTITUTION_ALIGNMENT_HANDOFF_v1.0.0.md`](../team_61/TEAM_61_TO_TEAM_101_CONSTITUTION_ALIGNMENT_HANDOFF_v1.0.0.md)  
**חבילה ל-Gateway:** [`TEAM_101_TO_TEAM_100_CONSTITUTION_AND_SIMULATION_CLOSURE_PACKAGE_v1.0.0.md`](TEAM_101_TO_TEAM_100_CONSTITUTION_AND_SIMULATION_CLOSURE_PACKAGE_v1.0.0.md)

---

## חלק ו׳ — המלצה אסטרטגית (מעודכן)

1. **GAP-001 סגור** — הדשבורד מציג כעת קבצים צפויים מפורשים ל-GATE_0/GATE_1; **GAP-002** (parity prompt↔DOM) נשאר חוסם “הוכחה אוטומטית מלאה” לסימולציה עד שימוש ב-SIM-CLOSE-02.  
2. לבצע **גל ניסויים חוזרים** (כמתואר בתוכנית המקורית): כל גל מעדכן את JSON + את סעיף “ליקויים” כאן.  
3. **Team 191** — רק לנושאי repo noise / archive; לא כתחליף לבדיקות פונקציונליות.

---

**log_entry | TEAM_101 | PIPELINE_SIMULATION_RESEARCH_GAP_ANALYSIS | 2026-03-23**
