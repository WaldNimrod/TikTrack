# Team 61 — דוח ארכיטקטורת סנכרון WSM ↔ pipeline_state JSON

**date:** 2026-03-16  
**id:** TEAM_61_WSM_PIPELINE_JSON_SYNC_ARCHITECTURE_REPORT  
**version:** 1.0.0  
**owner:** Team 61  
**addressee:** Team 100, Team 90, Team 10  
**project_domain:** AGENTS_OS  
**status:** ACTIVE — אבחון + המלצות אדריכליות

---

## 0. תמצית מנהלים

**הבנה נכונה:** WSM הוא מקור האמת. pipeline_state JSON חייב לעקוב אחריו.  
**מצב בפועל:** ה-JSON אינו מסונכרן מ־WSM — אין מנגנון אוטומטי. סנכרון דורש עדכון ידני.  
**דוח זה:** מאשר את האבחון מול הקוד, ומציע מגוון פטרנות אדריכליות לנעילת הסנכרון system-wide.

---

## 1. אימות האבחון מול הקוד

### 1.1 מי מעדכן מה

| מקור | מי כותב | מתי |
|------|----------|-----|
| **WSM** | Gate Owners (Teams 90/100/190) | ידני — בעת סגירת gate או פתיחת WP |
| **pipeline_state_*.json** | `pipeline_run.sh` / `agents_os_v2/orchestrator/state.py` | אוטומטי — `pass`, `fail`, `init_pipeline` |
| **Program/WP Registry** | `sync_registry_mirrors_from_wsm.py` | אוטומטי — WSM → Registries |

### 1.2 מה קיים היום

**sync_registry_mirrors_from_wsm.py:**
- קורא WSM `CURRENT_OPERATIONAL_STATE`
- מעדכן `PHOENIX_PROGRAM_REGISTRY`, `PHOENIX_WORK_PACKAGE_REGISTRY`
- **אינו נוגע ב־pipeline_state_*.json** — לא מוזכר בקוד

**state.py (PipelineState):**
- `load()` — קורא רק מ־JSON
- `save()` — כותב רק ל־JSON
- **אין קריאה או כתיבה ל־WSM**

**wsm_state_reader.py:**
- `read_wsm_state()` — קריאה בלבד מ־WSM
- משמש validators ו־tier4_wsm_alignment — לא את pipeline

**agents_os_v2/observers/state_reader.py:**
- `read_pipeline_state()` — קורא JSON
- `read_governance_state()` — קורא WSM (active_stage, active_program)
- מפיק STATE_SNAPSHOT שמאחד את שניהם — **אינו מסנכרן**, רק מציג

### 1.3 מסקנה — האבחון מדויק

| שאלה | תשובה |
|------|-------|
| האם JSON חייב לעקוב אחרי WSM? | כן — per PORTFOLIO_WSM_SYNC_RULES והגדרת WSM כ־SSOT |
| האם קיים מנגנון סנכרון WSM → JSON? | **לא** |
| האם דרוש עדכון ידני? | **כן** — אין אלטרנטיבה |
| האם יש בדיקת drift ב-CI? | **לא** — CI בודק WSM↔Registries בלבד |

---

## 2. שורש הבעיה

- **PORTFOLIO_WSM_SYNC_RULES** מגדיר sync ל־Program Registry ו־WP Registry בלבד.
- **pipeline_state JSON** לא נכלל בחוזה הסנכרון.
- ה־pipeline (CLI) נבנה ככלי runtime עצמאי — כותב JSON ישירות.
- WSM הוגדר כ־SSOT מאוחר יותר — ללא שילוב ה־pipeline בחוזה.

---

## 3. פטרנות אדריכליות מוצעות

### 3.1 פטרן A — הרחבת sync_registry (מומלץ כ־baseline)

**רעיון:** הוספת pipeline_state JSON לרשימת ה-outputs של הסקריפט הקיים.

**יישום:**
1. הרחבת `sync_registry_mirrors_from_wsm.py`:
   - פונקציה `_sync_pipeline_state_from_wsm(wsm_state, event_date)`  
   - קריאת WSM, יצירת תוכן JSON עבור כל דומיין, כתיבה ל־`pipeline_state_agentsos.json` / `pipeline_state_tiktrack.json`
2. מיפוי WSM → JSON:
   - `active_project_domain`=AGENTS_OS + `active_work_package_id`=S002-P005-WP003 → agents_os: work_package_id, current_gate, stage_id
   - `active_work_package_id`=N/A → דומיין פעיל: work_package_id=NONE, current_gate=COMPLETE
   - דומיין לא פעיל: work_package_id=NONE, current_gate=NONE
3. עדכון PORTFOLIO_WSM_SYNC_RULES — הוספת pipeline_state JSON לרשימת ה-mirrors
4. הוספת `--check` שמשווה JSON ל־WSM (כמו Registries)

**יתרונות:** מנגנון אחד, עקביות עם קיים, אכיפה ב-CI  
**חסרונות:** WSM מודל "single active" — מורכבות עבור dual-domain; יש להגדיר סמנטיקה לדומיין הלא-פעיל

---

### 3.2 פטרן B — סקריפט sync נפרד + אינטגרציה

**רעיון:** סקריפט ייעודי `scripts/portfolio/sync_pipeline_state_from_wsm.py` שרץ אחרי sync_registry.

**יישום:**
1. סקריפט חדש שקורא WSM, מייצר JSON
2. הרצה ב-CI: לאחר `sync_registry_mirrors_from_wsm.py --check`, הרצת `sync_pipeline_state_from_wsm.py --check`
3. אופציונלי: שילוב ב־`sync_registry_mirrors_from_wsm.py --write` דרך subprocess או import

**יתרונות:** הפרדת אחריות, קל להרחבה  
**חסרונות:** עוד סקריפט לתחזוקה

---

### 3.3 פטרן C — טימר (Cron / launchd)

**רעיון:** הרצה תקופתית של sync כדי להקטין חלון drift.

**יישום:**
1. `launchd` (macOS) או `cron` — כל 5 דקות:  
   `python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --write`  
   (לאחר הרחבתו ל־JSON)
2. או job ייעודי: `sync_pipeline_state_from_wsm.py --write`
3. הגבלה: להריץ רק כאשר WSM השתנה (למשל hash/ mtime) — למנוע כתיבה מיותרת

**יתרונות:** Dashboard מעודכן תוך דקות  
**חסרונות:** דורש תשתית; לא פותר את ה-drift שבין הרצות; לא מתאים ל-CI בלבד

---

### 3.4 פטרן D — Gate-triggered sync (כחלק מ־pipeline_run)

**רעיון:** pipeline מעדכן WSM רק דרך Gate Owners; אך `approve` / `pass` ב-GATE_8 יכולים להפעיל sync לאחר עדכון WSM.

**יישום:**
1. בדף ה-SOP של Gate Owner: "לאחר עדכון WSM הרץ:  
   `python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --write`"
2. אופציונלי: hook ב־`pipeline_run.sh status` — אם מזוהה drift בין WSM ל־JSON, הצעת  
   "Run: python3 scripts/portfolio/sync_pipeline_state_from_wsm.py --write"
3. אופציונלי: `pipeline_run.sh approve` (GATE_2/6/7) — לאחר success, קריאה ל־sync אם WSM עודכן

**יתרונות:** סינכרון בזמן הנכון, ללא טימר  
**חסרונות:** תלוי בפרוצדורה אנושית; דורש עדכון תיעוד Gate Owner

---

### 3.5 פטרן E — Dashboard קורא מ־STATE_SNAPSHOT (עקיף מ־WSM)

**רעיון:** הדשבורד לא יקרא JSON ישירות, אלא מ־STATE_SNAPSHOT שמופק מ־WSM.

**יישום:**
1. עדכון `state_reader`: `read_pipeline_state()` יגזור את `pipeline.domains` מ־WSM במקום מ־JSON (או: WSM עדיפות, JSON fallback)
2. הדשבורד טוען `STATE_SNAPSHOT.json` במקום `pipeline_state_{domain}.json`
3. `state_reader` ירוץ לפני הגשת הדשבורד — או on-demand (למשל לפני refresh בדשבורד)

**יתרונות:** מקור יחיד לריצה (WSM), פחות drift  
**חסרונות:** דורש שינוי state_reader ו-Dashboard; STATE_SNAPSHOT צריך להיות עדכני; WSM לא per-domain — נדרש הרחבת מודל

---

### 3.6 פטרן F — Pre-commit hook + CI enforcement

**רעיון:** נעילת סנכרון ברמת commit ו-CI.

**יישום:**
1. Pre-commit: בעת שינוי WSM — הרצת `sync_pipeline_state_from_wsm.py --write`
2. CI: `sync_pipeline_state_from_wsm.py --check` — כישלון אם drift
3. כלל: עדכון WSM **חייב** לכלול עדכון JSON (או ה-check יכשיל)

**יתרונות:** אכיפה חזקה, מונע commit עם drift  
**חסרונות:** תלוי ב-pre-commit; עלול להאט commits

---

### 3.7 פטרן G — היברידי (שילוב פטרנים)

**רעיון:** שילוב מספר מנגנונים לשכבות הגנה.

| שכבה | מנגנון |
|------|--------|
| 1. Sync script | הרחבת sync_registry או סקריפט נפרד — WSM → JSON |
| 2. CI | `--check` על pipeline_state ב-lint/portfolio workflows |
| 3. Gate Owner SOP | הרצת `--write` לאחר עדכון WSM |
| 4. (אופציונלי) טימר | Cron/launchd כל 10 דקות כ-backup |
| 5. (אופציונלי) Dashboard warning | הצגת אזהרה כש־STATE_SNAPSHOT מזהה drift |

---

## 4. מיפוי WSM → pipeline_state JSON (טכני)

### 4.1 שדות WSM רלוונטיים

| WSM Field | משמעות |
|-----------|--------|
| active_stage_id | S002 |
| active_project_domain | AGENTS_OS / TIKTRACK |
| active_work_package_id | S002-P005-WP003 או N/A |
| last_closed_work_package_id | S002-P005-WP002 |
| current_gate | GATE_8 (אחרון שעבר) |

### 4.2 מיפוי מוצע לדומיין agents_os

| מצב WSM | work_package_id | current_gate | gates_completed |
|---------|-----------------|--------------|-----------------|
| active_work_package_id=S002-P005-WP003 | S002-P005-WP003 | GATE_0 (אם בולוק) או מהערך ב-WSM | לפי WSM |
| active_work_package_id=N/A | NONE | COMPLETE | [..., GATE_8, COMPLETE] |
| active_project_domain≠AGENTS_OS | NONE | NONE | [] |

### 4.3 הערה על dual-domain

WSM מגדיר דומיין פעיל אחד. עבור דומיין לא פעיל — יש להגדיר:  
`work_package_id=NONE`, `current_gate=NONE`, `gates_completed=[]`.  
הערך `REQUIRED` ב־state.py (default) — שגוי; יש להחליף ל־`NONE` כשאין WP.

---

## 5. המלצות מסכמות

### 5.1 חובה (קצר טווח)

| # | פעולה | אחראי |
|---|--------|-------|
| 1 | הרחבת `sync_registry_mirrors_from_wsm.py` (או סקריפט נפרד) — WSM → pipeline_state JSON | Team 61 |
| 2 | עדכון PORTFOLIO_WSM_SYNC_RULES — הוספת pipeline_state JSON לרשימת mirrors | Team 170 / 190 |
| 3 | הוספת `--check` ל־pipeline_state ב-CI (lint-enforcement / portfolio-auto-sync) | Team 61 |
| 4 | תיקון default ב־state.py: `work_package_id="NONE"` במקום `"REQUIRED"` | Team 61 |

### 5.2 מומלץ (בינוני טווח)

| # | פעולה | אחראי |
|---|--------|-------|
| 5 | עדכון SOP ל-Gate Owners — הרצת sync אחרי עדכון WSM | Team 90 |
| 6 | Dashboard: הצגת Health warning כש-drift בין JSON ל־WSM (דרך STATE_SNAPSHOT) | Team 61 |
| 7 | הוספת `pipeline_run.sh status` — בדיקת drift והצעת sync | Team 61 |

### 5.3 אופציונלי (ארוך טווח)

| # | פעולה | אחראי |
|---|--------|-------|
| 8 | Timer (launchd/cron) להרצת sync כל 10 דקות | Team 60 |
| 9 | Pre-commit hook כאשר WSM משתנה | Team 61 |
| 10 | מעבר הדשבורד לקריאה מ־STATE_SNAPSHOT (פטרן E) | Team 61 |

---

## 6. סדר ביצוע מוצע

1. **Phase 1:** פטרן A (הרחבת sync) + חובה #1–4  
2. **Phase 2:** חובה #5–7 (SOP, Health warning, status check)  
3. **Phase 3:** אופציונלי לפי צורך — Timer, pre-commit, Dashboard migration

---

**log_entry | TEAM_61 | WSM_PIPELINE_JSON_SYNC_REPORT | v1.0.0_CREATED | 2026-03-16**
