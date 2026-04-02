---
id: TEAM_101_DM005_AND_CANARY_GAPS_SEVERITY_FULL_REPORT_v1.0.0
historical_record: true
from: Team 101
to: Team 100, Team 00 (Principal)
date: 2026-03-25
status: SUPPLEMENTARY_HANDOFF
purpose: פירוט מלא של חורים/ממצאים לפי חומרה — השלמה למידע שסוכם verbally ולא הועבר במלואו ל־Team 100
references:
  - TEAM_101_DM005_PROCESS_AND_IMPROVEMENT_RECOMMENDATIONS_v1.0.0.md
  - TEAM_101_TO_TEAM_100_FINDINGS_AND_RECOMMENDATIONS_SUMMARY_v1.0.0.md---

# דוח השלמה — חורים וממצאים לפי חומרה (פירוט מלא)

מסמך זה משלים את **`TEAM_101_DM005_PROCESS_AND_IMPROVEMENT_RECOMMENDATIONS_v1.0.0.md`**: שם מופיעה טבלת G-01…G-13 **ללא עמודת חומרה**, ובסעיף 5 יש תעדוף קבוצתי בלבד. כאן מופיעה **מטריצת חומרה מפורשת** + העתק מלא של כל שורה רלוונטית, וכן **מסלול Canary / Layer 2** מ־`TEAM_101_TO_TEAM_100_FINDINGS_AND_RECOMMENDATIONS_SUMMARY_v1.0.0.md`.

---

## חלק א׳ — DM-005: שלושה גבוהים, שלושה בינוניים, אחד נמוך (מיפוי לסעיף 5 + השלמה)

התאמה לתעדוף שכתב Team 101 בדוח המקורי: *«תעדוף את G-08, G-09, G-10 … מול G-04, G-01, G-02»* + פריט סביבתי אחד ברמת השלמת תיעוד.

### חומרה גבוהה (3)

| ID | קטגוריה | תיאור החור / הבעיה | השפעה | המלצת פתרון אפשרית | בעלים מוצע | רפרנסים |
|----|---------|---------------------|--------|---------------------|------------|---------|
| **G-08** | WSM / COS | דריפט בין WSM ל־JSON אחרי היסטוריית WP099; תאים פגומים ב־`last_gate_event` עלולים לחסום עדכון אוטומטי. | SSOT נכשל עד תיקון ידני או `wsm-reset`. | הרחבת runbook; תיקון שורות פגומות ב־WSM; הקשחת validation ב־`write_wsm_state` (אופציונלי). | Team 61 + Team 170 | `TEAM_101_DM_005_SC_COMPLETION_REPORT_v1.0.0.md` חלק 2 (סעיפים A–E), `wsm_writer.py` |
| **G-09** | מנוע / תיעוד מפעיל | **GATE_2:** מסמכי session opener מזכירים פאזות 2.1/2.1v; הכניסה למנוע ב־`_GATE_ENTRY_PHASE` היא **2.2** — חוסר יישור שפה. | בלבול מפעילים וביקורת חיצונית. | עדכון session openers / מדריך מפעיל להתאמה למנוע, או שינוי מנוע (עלות גבוהה יותר). | Team 100 + Team 101 | `pipeline.py` / `_GATE_ENTRY_PHASE`; `TEAM_101_SESSION_OPENER_DM005_v1.0.0.md` |
| **G-10** | מנוע / אודיט | **GATE_5:** באימות WP זה מספיק **5.1 pass** למעבר ל־COMPLETE בלי להפריד 5.2 במפורש. | סיכון אי־הבנה בביקורת “האם 5.2 בוצע”. | תיעוד מפורש לכל WP או כפיית שלבים לפי סוג WP. | Team 101 + Team 190 | דוח השלמה DM-005 חלק 2 (סעיף B.4) |

### חומרה בינונית (3)

| ID | קטגוריה | תיאור החור / הבעיה | השפעה | המלצת פתרון אפשרית | בעלים מוצע | רפרנסים |
|----|---------|---------------------|--------|---------------------|------------|---------|
| **G-01** | QA / מפרט UI | בדיקות E2E הניחו ש־`s-owner` ו־`team-assignment-expected` תמיד לא־ריקים; ב־**COMPLETE** ה־UI מציג בכוונה `—` ב־sidebar (`isComplete` ב־`pipeline-dashboard.js`). | כשלי בדיקה “שגויים”; בזבוז זמן אבחון. | מסמך **מצב→תצוגה** ל־QA (טבלה קצרה) או הערה ב־`AGENTS.md` / runbook dashboard; בדיקות חדשות יבנו על אותו SSOT. | Team 51 + Team 101 | `agents_os/ui/js/pipeline-dashboard.js` (סביב שורות 157–176); `tests/pipeline-dashboard-agents-os-dm005.e2e.test.js` |
| **G-02** | כיסוי בדיקות | `smoke` / `phase-a` רצות על **ברירת מחדל** (לרוב TikTrack + WP אחר), בעוד DM-005 דורש **Agents OS + S003-P015-WP001**. | אפשר לחשוב ש־“הכל ירוק” בזמן שדומיין היעד לא נבדק. | סקריפט מאגד `test:pipeline-dashboard-all-critical` או job CI שמריץ גם `test:pipeline-dashboard-dm005-agents-os` אחרי אירועי WP AOS; תיעוד ב־Makefile / `package.json`. | Team 61 + Team 51 | `tests/package.json` (סקריפטים `test:pipeline-dashboard-*`) |
| **G-04** | UX / תפעול | `localStorage` ברירת מחדל `tiktrack` ב־`PIPELINE_DASHBOARD.html` — מפעילים עלולים לבדוק את הדומיין הלא נכון. | טעויות הפעלה, דיווחי “שגיאה” שווא. | שמירת דומיין אחרון; אינדיקטור בולט; אופציונלית query param (?domain=) לקישור עמוק. | Team 30 / Team 61 | `agents_os/ui/PIPELINE_DASHBOARD.html` (בלוק `pipeline_domain`) |

### חומרה נמוכה (1)

| ID | קטגוריה | תיאור החור / הבעיה | השפעה | המלצת פתרון אפשרית | בעלים מוצע | רפרנסים |
|----|---------|---------------------|--------|---------------------|------------|---------|
| **G-06** | כלי MCP / סביבה | קונסול MCP כולל אזהרות ספציפיות ל־CursorBrowser — לא זהה לכרום נקי. | אי־התאמה אם משווים ל־DevTools מקומי. | להשאיר **Selenium `browser` logs** כ־SSOT ל־SEVERE; MCP כהשלמה לניווט/רשת. | Team 51 | ריצת DM-005 + `TEAM_101_DM005_PROCESS_AND_IMPROVEMENT_RECOMMENDATIONS_v1.0.0.md` |

---

## חלק ב׳ — שאר פריטי DM-005 (ללא סיווג ל־3+3+1; עדיין פעילים ב־backlog)

הפריטים הבאים מופיעים בטבלה המקורית ולא נכללו בשלושת הקבוצות למעלה (תיעדוף נוסף לפי Team 100).

| ID | קטגוריה | תיאור (תמצית) | הערת חומרה (הערכת Team 101) |
|----|---------|----------------|------------------------------|
| **G-03** | איכות ארטיפקטים QA | JSON ראיות עם `ok: false` לפני סימון הצלחה — **תוקן בקוד**; נותרה המלצה על לינטר/סדר כתיבה. | נמוך–בינוני (רגרסיה) |
| **G-05** | כיסוי SC | **SC-UI-01** deferred — אין תחליף אוטומטי לשיפוט חזותי. | בינוני (שער אנושי) |
| **G-07** | אודיט רשת | אחרי מעבר דומיין — בקשות לשני דומיינים; קורא HAR עלול לפרש שגוי. | נמוך–בינוני (תיעוד) |
| **G-11** | כלי שרת | `run_canary_safe.sh` + `SKIP_ARGS` — **תוקן**. | סגור טכנית; ניטור רגרסיה |
| **G-12** | אורקסטרציה | `wsm-reset` + WP099 / `active_work_package_id` — **תוקן**. | קשור ל־G-08; ניטור |
| **G-13** | אתחול WP | `start_pipeline` התעלם מ־`PIPELINE_DOMAIN` — **תוקן**. | סגור טכנית; ניטור |

---

## חלק ג׳ — מסלול Canary / Layer 2 (מסמך נפרד; חומרות מפורשות שם)

מקור: `TEAM_101_TO_TEAM_100_FINDINGS_AND_RECOMMENDATIONS_SUMMARY_v1.0.0.md`. זה **לא** אותו סט כמו חלק א׳, אך אותו Gateway צריך לראותו יחד.

| חומרה | נושא | ממצא עיקרי | מסמך מפורט |
|--------|------|------------|-------------|
| **גבוה** | דריפט WSM / WP099 | לא מ־mocks/selenium — מ־`pipeline_run pass/fail` כש־`pipeline_state` מחזיק מזהה סימולציה. | F2: `TEAM_101_PIPELINE_TEST_ISOLATION_AND_WSM_DRIFT_REMEDIATION_v1.0.0.md`, `TEAM_100_TO_TEAM_101_WSM_DRIFT_ROOT_CAUSE_QUERY_v1.0.0.md` |
| **בינוני** | Layer 2 Phase A | כשל בגלל התאמת טסט למצב `COMPLETE` (באגץ קבצים `N/A`). | F1: `TEAM_101_LAYER2_PHASE_A_FAILURE_ROOT_CAUSE_AND_REMEDIATION_OPTIONS_v1.0.0.md` |
| **נמוך** | כלים מובנים | לאמץ `run_canary_safe.sh` **ללא** `pipeline_run` כברירת מחדל. | R1 בדוח הסיכום; `scripts/canary_simulation/README.md` |

המלצות R2–R6, החלטות D1–D6 והאינדקס במסמך המקור — נשארים בתוקף.

---

## חלק ד׳ — מה להעביר ל־Team 100 (checklist)

1. **קנון תעדוף DM-005 (3+3+1):** חלק א׳ במסמך זה.  
2. **Backlog מלא DM-005:** `TEAM_101_DM005_PROCESS_AND_IMPROVEMENT_RECOMMENDATIONS_v1.0.0.md` (טבלה מלאה G-01…G-13).  
3. **Canary / WSM:** חלק ג׳ + `TEAM_101_TO_TEAM_100_FINDINGS_AND_RECOMMENDATIONS_SUMMARY_v1.0.0.md`.

---

**log_entry | TEAM_101 | DM005_CANARY_GAPS_SEVERITY_FULL_REPORT | SUPPLEMENT_TEAM_100 | 2026-03-25**
