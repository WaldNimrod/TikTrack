---
id: TEAM_101_E2E_SIMULATION_AND_GIT_FAQ_v1.0.0
historical_record: true
team: team_101
title: E2E simulation report — UI certainty, feedback layers, Git discussion
date: 2026-03-23
status: FINAL---

# דוח הדמיה — ודאות ממשק, מנדטים, משוב, ודיון Git

## חלק א׳ — אימות דפדפן (Selenium + MCP Chrome) — **בוצע**

| כלי | מה נבדק | תוצאה |
|-----|-----------|--------|
| **Selenium** (`tests/pipeline-dashboard-smoke.e2e.test.js`) | טעינת `http://127.0.0.1:8090/static/PIPELINE_DASHBOARD.html`, מילוי `#s-wp`, באנר הצעד הבא, מנדטה, מעבר דומיין TikTrack ↔ Agents OS | **PASS** (HEADLESS) |
| **MCP cursor-ide-browser** | `browser_navigate` + snapshot לאותו URL | הדף נטען; נראים כפתורי דומיין, רענון, אקורדיונים, לוג אירועים |

**הרצה:**

```bash
# שרת UI (חובה): ./agents_os/scripts/start_ui_server.sh  → פורט 8090
cd tests && HEADLESS=true npm run test:pipeline-dashboard-smoke
```

**קטלוג בדיקות (מלא):** [`TEAM_101_SIMULATION_TEST_CATALOG_v1.0.0.md`](TEAM_101_SIMULATION_TEST_CATALOG_v1.0.0.md) — Layer 1 (`ssot_check` + `verify_layer1.py`), Layer 2 (smoke + Phase A), Phase B (B4 CLI, B1–B2 fixtures, B3 MCP/ידני).

**דוח אימות מימוש (תוצאות ריצה, MCP, פערים, גיט):** [`TEAM_101_CANARY_SIMULATION_IMPLEMENTATION_AND_VERIFICATION_REPORT_v1.0.0.md`](TEAM_101_CANARY_SIMULATION_IMPLEMENTATION_AND_VERIFICATION_REPORT_v1.0.0.md)

**מחקר ארכיטקטורה / פערים מדורגים / חבילת עבודה:** [`TEAM_101_PIPELINE_SIMULATION_RESEARCH_GAP_ANALYSIS_v1.0.0.md`](TEAM_101_PIPELINE_SIMULATION_RESEARCH_GAP_ANALYSIS_v1.0.0.md)

**הגשה ל-Gateway (Team 100) — Constitution + אימות סימולציה:** [`TEAM_101_TO_TEAM_100_CONSTITUTION_AND_SIMULATION_CLOSURE_PACKAGE_v1.0.0.md`](TEAM_101_TO_TEAM_100_CONSTITUTION_AND_SIMULATION_CLOSURE_PACKAGE_v1.0.0.md)

**מתי Selenium לעומת MCP:** השתמש ב־**Selenium** לרגרסיה מהירה ב־CI (HEADLESS) על טעינת דשבורד, רשימת קבצים צפויים, ומעבר דומיין. השתמש ב־**MCP browser** רק לתרחישים שדורשים אינטראקציה עשירה (HRC 4.3, כפתורי bulk) או אימות “ראיה” נקודתי — כמתואר בקטלוג.

**הערה:** בדיקת Selenium דיווחה על הודעות `SEVERE` בלוג דפדפן (ייתכן רעש מצטבר / משאבים חיצוניים). מומלץ סקירת לוג בעת הרצה ויזואלית. אין כשל בטסט עקב כך.

---

## חלק א — סיכום מה בוצע בהדמיה (עובדה מבצעית)

| פריט | ערך |
|------|-----|
| תוכנית / WP | `S003-P014` / `S003-P014-WP001` (רישום קנוני + סגירת סימולציה) |
| אופן הריצה | **CLI בלבד** — `./pipeline_run.sh` + `python3 -m agents_os_v2.orchestrator.pipeline` |
| מעקפים מתועדים | `PIPELINE_RELAXED_KB84=1`; commits מקומיים ל־`git diff` preflight |
| תוצאה | מחזור מלא **GATE_0→GATE_5** עד `LIFECYCLE COMPLETE`; `ssot_check --domain tiktrack` ירוק אחרי הריצה |
| שחזור מצב עבודה | `pipeline_state_tiktrack.json` הוחזר ל־`S003-P013-WP001` / `COMPLETE` |
| עדויות | `_COMMUNICATION/team_101/_E2E_SIM_20260323/` (גיבוי מצב, יומן, סקריפט, מסמן impl) |

**מסקנה מבצעית:** יש **ודאות גבוהה** ל־CLI; נוסף **smoke דפדפן** (Selenium + MCP) לדשבורד — ראו חלק א׳. עדיין **לא** כיסוי מלא של כל פעולת UI בכל פאזה.

---

## חלק ב — תשובות לשאלות המעקב (1–5)

### 1) האם יש ודאות שכל קידום שלב וכל פאזה ניתנים למשתמש **בממשק**, ובוצעו E2E בדפדפן?

| רמת ודאות | נימוק |
|-----------|--------|
| **CLI — כן** | ריצה מלאה דרך `pipeline_run.sh` (הדמיה S003-P014) כפי שתועד. |
| **דשבורד — smoke Selenium + MCP — כן** | `tests/pipeline-dashboard-smoke.e2e.test.js`: טעינת `PIPELINE_DASHBOARD`, מילוי WP/Gate, באנר הצעד הבא, מנדטה לאחר טעינה, מעבר דומיין TikTrack ↔ Agents OS; הורץ **HEADLESS** + אומת **MCP** (`browser_navigate` + snapshot). |
| **מלא לכל gate×phase ב־UI** | **לא**: ה-smoke לא מפעיל מחזור פקודות `pass`/`fail` מהדשבורד על כל פאזה — הרחבה עתידית. |

**המלצה:** להרחיב את ה-smoke או סוויטה נפרדת עם `pipeline_state` בדיקה לכל צירוף gate+phase.

### 2) האם בדקנו שחלון “הצעד הבא” והמנדטים לצוותים **מדויקים** בכל שער ופאזה?

**חלקית:** ב-smoke הדפדפן נבדק ש־`#current-step-banner` ו־`#mandate-content` אינם ריקים לאחר טעינה (מצב נוכחי ב-repo: WP סגור).  
**לא** נעשתה השוואה שיטתית “טקסט במסך = קובץ פרומפט בדיסק” לכל צירוף gate×phase.

בקוד הדשבורד (`pipeline-dashboard.js`) קיימים מקורות אמת לתצוגה (`getEffectiveVerdictTeam`, מיפוי פאזים, `getVerdictCandidates`).

**המלצה:** checklist ידני או בדיקת צילומי מסך / snapshot tests לפחות ל־GATE_0, GATE_2 (2.2/2.2v/2.3), GATE_3 (3.1–3.3), GATE_4 (4.1–4.3), GATE_5 (5.1/5.2).

### 3) האם בדקנו אחידות מנגנון זיהוי משוב צוותים ושכבות חיפוש המשוב?

**חלקית ברמת קוד (קריאה סטטית), לא E2E במסגרת ההדמיה.**

ב־`pipeline-dashboard.js` מוגדרים לדוגמה:

- `getVerdictCandidates(gate, wp)` — רשימת נתיבי קבצים לפי שער.
- שכבות Feedback Detection (למשל rescan / מועמדים מרובים) — ראו `fdRescan`, `_processFdVerdict`, `extractFindings`, `logVerdictDrift`.
- `getEffectiveVerdictTeam` — SSOT ל“איזה צוות פעיל” לפי gate+phase.

**לא** הורצה בדיקה אוטומטית שמאמתת שכל השכבות פעילות ועקביות מול `_COMMUNICATION` בכל WP.

**המלצה:** תרחיש QA ייעודי (Team 51/50): קבצי verdict דמה במסלולים, בדיקת rescan, בדיקת drift log, והשוואה לרשימת התבניות ב־`getVerdictCandidates`.

### 4) בעיות, תקלות, המלצות לשיפור (סטטוס הדוח)

| סוג | פריט |
|-----|------|
| **פער הוכחה** | אין כיסוי browser-E2E מלא לדשבורד pipeline במחזור ההדמיה. |
| **פער תוכן** | לא נאספה הוכחת התאמה מלאה “מנדט במסך ↔ פרומפט בקובץ” לכל פאזה. |
| **פער משוב** | מנגנון שכבות המשוב לא נבדק אוטומטית end-to-end. |
| **תפעול** | שימוש ב־`PIPELINE_RELAXED_KB84=1` — לגיטימי לסימולציה; בפרודקשן יש להקפיד על פקודות מדויקות לפי KB-84. |
| **Git** | סימולציה דורשת commit דמה או `--force-gate4` — ראו חלק ג. |
| **שיפור מוצע** | דגל סביבה `PIPELINE_SKIP_GIT_PREFLIGHT=1` (אופציונלי) לסביבות dry-run בלבד, כדי להפחית רעש בלי לערער production QA. |

---

## חלק ג — דיון והנחיות: שימוש ב־Git בתהליך (לתעד בדוח ההדמיה)

### למה Git מופיע בכלל?

המערכת משתמשת ב־**מאגר Git המקומי** כ־**עדות לשינוי מהותי** לפני פרומפטים שמניחים שיש “יישום שנכנס לעץ”:

- `git diff --stat HEAD~1 HEAD` לפני פרומפטים מסוימים (**GATE_4**, ובמסלול מסוים **GATE_3 / phase 3.3**).
- `git diff` / `git diff --cached` ב־`pipeline_run.sh` כשהשער הוא **`CURSOR_IMPLEMENTATION`** (מסלול legacy) — מניעת מעבר ל־QA עם שינויי tracked שלא ב־commit.

**לא** נדרש `git push` ולא נבדק remote — הכול מקומי.

### יתרונות

- קישור בין מה שנבדק ב־QA לבין מה שבאמת נרשם ב־VCS.
- מניעת קידום שער “ריק” מבחינת קוד.
- התאמה ל־CI ולהיסטוריית שינויים.

### חסרונות / סיכונים

- תלות ב־`HEAD~1` (ענף, היסטוריה, shallow clone).
- סימולציות דורשות commit דמה או `--force-gate4` — עלול ליצור רעש אם לא מתועד.
- לא מבדיל אוטומטית בין commit “משמעותי” לבין שינוי קוסמטי.

### המלצות

1. **להשאיר** את בדיקת ה־commit כ־heuristic לפרודקשן, עם תיעוד ברור למפעילים.
2. **לסימולציה בלבד:** commits תחת נתיב מסומן (`_COMMUNICATION/team_101/_E2E_SIM_20260323/`) או מעקף `--force-gate4` — כפי שבוצע.
3. **אופציונלי (עתיד):** דגל `PIPELINE_SKIP_GIT_PREFLIGHT=1` לסביבות dry-run — **לא** להפעיל בברירת מחדל בפרודקשן.

### קשר ל־Team 191

צוות 191 אחראי לדיסצiplina של Git/push ולכלים — **לא** לשלב אורקסטרציה פנימי. בדיקות `git` בקוד הן אוטומטיות; אין “ניתוב משימה” ל־191 מתוך `pipeline_run.sh`.

---

## חלק ד — הפניה טכנית: איפה בדיוק רץ `diff` (סיכום)

| מיקום | מה רץ | מתי |
|--------|--------|-----|
| `agents_os_v2/orchestrator/pipeline.py` — `generate_prompt` | `git diff --stat HEAD~1 HEAD` | **GATE_4**; **GATE_3 / phase 3.3** (לפני פרומפט QA/impl לפי המימוש) |
| `pipeline_run.sh` — `pass` | `git diff --quiet` / `git diff --cached --quiet` | **רק** אם `current_gate == CURSOR_IMPLEMENTATION` |

---

## חלק ה — קבצי עדות להרצה

- גיבוי מצב לפני הדמיה: `_COMMUNICATION/team_101/_E2E_SIM_20260323/pipeline_state_tiktrack_PRE_E2E.json`
- יומן ריצה: `_COMMUNICATION/team_101/_E2E_SIM_20260323/E2E_RUN_LOG.txt`
- סקריפט: `_COMMUNICATION/team_101/_E2E_SIM_20260323/run_e2e_simulation.sh`
- מסמך LLD400 דמה: `_COMMUNICATION/team_101/_E2E_SIM_20260323/S003_P014_WP001_SIM_LLD400_MIN.md`

---

**log_entry | TEAM_101 | E2E_SIMULATION_REPORT | UPDATED_UI_GIT_SECTIONS | 2026-03-23**
