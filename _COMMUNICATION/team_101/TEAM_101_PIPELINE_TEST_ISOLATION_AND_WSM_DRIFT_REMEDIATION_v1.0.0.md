---
id: TEAM_101_PIPELINE_TEST_ISOLATION_AND_WSM_DRIFT_REMEDIATION_v1.0.0
historical_record: true
from: Team 101 (AOS Domain Architect / simulation lane)
to: Nimrod (vision), Team 100 (Gateway), Team 61, Team 51
cc: Team 170, Team 191
date: 2026-03-24
status: FINAL_POLICY_AND_TECHNICAL_PLAN
responds_to: operational feedback — בדיקות Canary יוצרות drift / “זנב” WP099 ב-WSM וקבצי סטטוס
related: TEAM_100_TO_TEAM_101_WSM_DRIFT_ROOT_CAUSE_QUERY_v1.0.0.md---

# בידוד בדיקות Pipeline, דריפט WSM, ו-WP099 — הסבר שורש ותוכנית טיפול מלאה

## 1. הוקרה והקשר

הבדיקות שהוגדרו בסבב Canary (Layer 1–2, pytest, מחקר פערים) **מספקות ערך אמיתי** לרגרסיה וליישור SSOT.  
במקביל, **חוויית “מטבח מלוכלך”** אחרי ריצות — במיוחד הופעה חוזרת של **`S003-P011-WP099`** ב־WSM ובשדות COS — היא **בעיה תפעולית לגיטימית** שחייבת להיפתר במבנה, לא רק בניקוי ידני אחרי כל סשן.

מסמך זה מסביר **למה** זה קורה מבחינה מכנית, **מה** בבדיקות Team 101 כן/לא עושה, ו**איך** מטפלים בזה **בצורה יסודית** כחלק מתהליך מובנה.

---

## 2. שורש הבעיה (מכני — לא “באג מסתורי”)

### 2.1 איפה נכתבים WSM ו-COS

מיפוי Team 100 (מאומת בקוד) הראה:

| פעולה | כותב ל־`PHOENIX_MASTER_WSM`? | כותב שורת parallel track? |
|--------|------------------------------|-----------------------------|
| `./pipeline_run.sh` **`pass` / `fail` / `approve`** | כן — דרך `write_wsm_state()` ומסלולים קשורים | כן — `write_stage_parallel_tracks_row()` / סנכרון |
| `./pipeline_run.sh` **`phase<N>`** | תלוי מסלול | כן — `_auto_wsm_sync` |
| **pytest** עם mocks / `tmp_path` | לא (מבודד) | לא |
| **`generate_mocks.py` / `verify_layer1.py`** | לא (מפורש: לא נוגעים ב־`pipeline_state`) | לא |
| **Selenium דשבורד (8090)** | לא — קורא HTML/JSON ב־HTTP | לא |

**מסקנה מרכזית:** הדרך העיקרית שבה **מזהה WP כמו WP099 “נצבע” ב־WSM** הוא **`pipeline_run.sh` עם קובץ `pipeline_state_*.json` שמכיל את אותו WP**, ואז הרצת **pass/fail/approve** שמסנכרנת למסמך ה-WSM.

### 2.2 מהו WP099 במערכת שלכם

**WP099** הוגדר כ־**ארטיפקט סימולציה** (מזהה “דמה”) שאינו חבילת עבודה אמיתית בלוח הייצור — אבל **ברגע שהוא נמצא ב־`pipeline_state_agentsos.json`**, המנוע מתייחס אליו כאל WP פעיל.  
כל הרצת **`./pipeline_run.sh … pass|fail`** בעוד המצב הזה בזיכרון הקנוני **דוחפת את אותו מזהה** ללוגיקת עדכון WSM — ולכן נוצר “זנב” שחוזר עד שמנקים ידנית או מריצים **`wsm-reset`** / ניקוי COS.

זה **לא** נגרם מ־`generate_mocks` או מ־`ssot_check` או מריצת Selenium על הדשבורד בלבד.

### 2.3 למה זה נראה “אחרי כל ריצת בדיקות”

בפועל היו **כמה מקורות** שונים, לא תמיד אותו סקריפט:

| מקור | הסבר |
|------|------|
| **הרצות `pipeline_run.sh` במהלך QA / סימולציה** | לדוגמה בדיקות שמנסות “לחיות” את הדשבורד עם WP099 ומריצות `pass` — כל אחת **כותבת** ל־WSM. |
| **סקריפט E2E היסטורי** | ` _COMMUNICATION/team_101/_E2E_SIM_20260323/run_e2e_simulation.sh` מריץ **שרשרת `pass`** על דומיין TikTrack ומשנה מצב — זה **מכוון לסימולציה**, אבל אם מריצים אותו על אותו repo “חי” בלי בידוד, הוא **מזהם** את אותם קבצים ש־Gateway משתמש בהם. |
| **מצב לפני ניקוי** | אם `pipeline_state` הכיל WP099 מריצה קודמת, **כל** `pass`/`fail` נוסף **מחדש** את הכתיבה ל־WSM עד שנוקה המצב. |

**לכן:** התחושה “כל ריצת בדיקות שוברת” היא לעיתים **צבירה של פעולות pipeline על מצב לא נקי**, לא בהכרח באג בבדיקת יחידה אחת.

---

## 3. מה בדיקות Team 101 **לא** אמורות להשאיר (והן לא משאירות)

הנתיב המתועד בקטלוג:

- `generate_mocks.py` — **לא** משנה `pipeline_state` / WSM (מצוין בקוד).
- `verify_layer1.py` — בדיקות קבצים + `ssot_check`.
- `pytest agents_os_v2/tests/` — רובו מבודד; מזהי WP099 שמופיעים שם הם **בתוך mocks** ולא כותבים לקבצי repo (אלא אם מישהו הרחיב בדיקה בלי בידוד — יש לשמור על דפוס `tmp_path`).

**Selenium (Layer 2)** רק טוען דפדפן מול שרת סטטי — **אינו** קורא ל־`pipeline_run.sh`.

אם אחרי “רק Layer 1+2” עדיין יש drift — כמעט תמיד הסיבה היא **פעולה אנושית/QA נלווית** (למשל `pipeline_run` עם WP099) או **סקריפט E2E** — לא הטסטים האוטומטיים העיקריים לעיל.

---

## 4. תוכנית טיפול **מלאה ומובנית** (לא “נקו אחרי כל ריצה” ידנית)

### רמה A — כללי ברזל (מדיניות)

1. **אסור** להריץ `./pipeline_run.sh pass|fail|approve` על **repo עבודה משותף** כש־`pipeline_state_agentsos.json` מכיל **מזהה סימולציה** (WP099 או כל “תא 99”) — אלא אם מיד אחרי כן מבוצע **`wsm-reset`** או שחזור מצב מוסכם.  
2. **בדיקות אוטומטיות רשמיות** (CI / pre-merge) יכללו **רק** את הנתיבים של §3 — בלי שרשור `pipeline_run` בלי בידוד.  
3. **סימולציות מלאות** (כולל `pipeline_run`) ירוצו רק ב:  
   - **worktree נפרד**, או  
   - **עותק מצב זמני** (`PIPELINE_STATE_ROOT` עתידי / העתק ל־`/tmp`), או  
   - **מכונה/ענף CI ייעודי** — לא על `main` המשותף בלי פרוטוקול.

### רמה B — שינויי מוצר / שרת pipeline (כבר חלקית קיימים)

- קיים **מגן** ב־`pipeline_run.sh` על `pass` כש־`GATE==COMPLETE` (מונע advance “ריק” שמזהם WSM).  
- קיים **`./pipeline_run.sh wsm-reset`** + `write_wsm_idle_reset()` ב־`wsm_writer.py` לניקוי “רוח רפאים” אחרי ניקוי `pipeline_state`.  
- **המשך נדרש (מומלץ):**  
  - אותו **סוג מגן** לפני `fail` כשאין WP פעיל לגיטימי (או דגל `--i-know-this-is-sim`).  
  - הדגשת **הודעת שגיאה** שמפנה ל־`wsm-reset` כשמזוהה מזהה exclusion / simulation token.

### רמה C — אריזת הבדיקות כ“חבילה בטוחה”

קיים סקריפט: **`scripts/canary_simulation/run_canary_safe.sh`**

1. מריץ `generate_mocks` + `verify_layer1 --phase-b` (כולל `ssot_check` ל־tiktrack פנימית, אלא אם הוגדר `CANARY_SKIP_SSOT=1`).  
2. מריץ `ssot_check --domain agents_os` כשלא מדלגים על ssot.  
3. מדפיס: **לא הורצה `pipeline_run` — הסקריפט לא כותב ל־WSM**.  
4. אם המאגר כבר בדריפט COS לפני הריצה, `ssot_check` ייכשל — זה **מצב קיים**, לא “לכלוך” שנוצר מהסקריפט; אפשר `CANARY_SKIP_SSOT=1` לבדיקת מראה/קבצים בלבד, ואז ליישר עם `wsm-reset` לפי Gateway ולהריץ שוב בלי skip.

Layer 2 (Selenium) נשאר נפרד — דורש שרת 8090; ראו README תחת `scripts/canary_simulation/`.

### רמה D — בידוד מפורש לסימולציות E2E

- `run_e2e_simulation.sh` ודומיו יסומנו כ־**operator-only** ויועברו לפרק README: **להריץ רק ב-worktree** או עם גיבוי/שחזור:  
  - גיבוי: `pipeline_state_tiktrack.json`, `pipeline_state_agentsos.json`, קטע רלוונטי ב־WSM (או `git stash` ממוקד לקבצים אלה אם מוסכם).  
  - **סיום חובה:** `./pipeline_run.sh --domain agents_os wsm-reset` (וכפול tiktrack אם נדרש) + שחזור קבצים מגיבוי או `git checkout --` לנתיבים המוסכמים.

### רמה E — מזהי סימולציה

- להחליף בהדרגה כל שימוש ב־**WP099** בקבצים קנוניים ב־**sandbox מפורש** (תיקייה תחת `_COMMUNICATION/team_101/_SANDBOX/` בלבד) או ב־**מזהה שאינו מתואם ל-Registry**, כדי שלא יופיע כ“פעיל” בשום תרשים רשמי.  
- Team 170 / Registry: לסמן WP099 כ־**EXCLUDED / SIMULATION_ONLY** אם עדיין נדרש להיסטוריה.

---

## 5. תשובה ישירה לשאלת Team 100 (תיאוריה §4)

**כן — התיאוריה נכונה בכיוון:** כל עוד `pipeline_state` החי הכיל WP099, **כל** הרצת `pipeline_run.sh pass/fail` יכלה **לכתוב מחדש** את WP099 ל־WSM.  
**לא** מדובר ב־`generate_mocks` או ב־Selenium כמקור כתיבה.

הבדיקות האוטומטיות המרכזיות של Team 101 **לא אמורות** לעשות זאת; הזיהום מגיע ממסלולי **אופרטור / QA / E2E** שמשתמשים ב־`pipeline_run` על אותו repo.

---

## 6. מה קורה עכשיו (התחייבות תהליכית)

| פעולה | אחריות | סטטוס |
|--------|--------|--------|
| מסמך מדיניות זה | Team 101 | **מסופק** (מסמך זה) |
| עדכון README Canary עם סעיף “WSM safety” | Team 101 | **לביצוע מיידי** (קישור למסמך + כללי ברזל) |
| סקריפט `run_canary_safe.sh` | Team 101 | **במאגר** (`scripts/canary_simulation/run_canary_safe.sh`) |
| סימון E2E סימולציה כ-operator-only + checklist שחזור | Team 101 + Gateway | **מומלץ** |
| הרחבת מגני `pipeline_run` (fail / simulation token) | Team 20/61 לפי מנדט | **המלצה לארכיטקטורה** |

---

## 7. סיכום למנהלים

- **הבעיה נוצרה** כי **כתיבה ל-WSM קשורה ל־`pipeline_run`**, לא לבדיקות ה-yיחידה/Canary “הצרות”.  
- **WP099** הוא **תווית סימולציה** שנשארה במצב קנוני והוזנה שוב ושוב ל-WSM בכל סנכרון gate.  
- **הפתרון המלא** הוא **בידוד מצב**, **חבילת הרצה בטוחה**, **מגנים במנוע**, ו**פרוטוקול שחזור מובנה** לסימולציות כבדות — לא ניקוי ידני כשגרת עבודה.

---

**log_entry | TEAM_101 | PIPELINE_TEST_ISOLATION | WSM_DRIFT_REMEDIATION | 2026-03-24**
