# Team 61 → Team 100 — דוח אי־הלימת סטטוס: דשבורד ומפה מול מצב קנוני

**date:** 2026-03-15  
**historical_record:** true  
**id:** TEAM_61_STATUS_ALIGNMENT_REPORT  
**version:** 1.0.0  
**owner:** Team 61 (DevOps & Platform — AOS UI)  
**addressee:** Team 100 (AOS Domain Architects)  
**project_domain:** AGENTS_OS  
**status:** ACTIVE — מחקר מעמיק + המלצות

---

## 0. תקציר מנהלים

ממצאי המחקר מצביעים על **אי־הלימות חוזרות** בין המצב המוצג בממשק (Pipeline Dashboard + Roadmap) לבין המצב הקנוני במסמכי Governance (WSM, Program Registry). הבעיה נובעת מ־**ריבוי מקורות אמת** ללא מנגנון סנכרון אחיד, ובנוסף לשגיאות פנימיות בקבצי pipeline_state. הדוח מפרט ממצאים, שורשי בעיה והמלצות.

---

## 1. תמצית הממצאים

| # | ממצא | חומרה |
|---|------|--------|
| 1 | `pipeline_state_agentsos.json` מכיל סתירה פנימית: `gates_completed` כולל GATE_8, בעוד `gates_failed` כולל GATE_8 | גבוהה |
| 2 | Dashboard ו־Roadmap קוראים רק `pipeline_state_{domain}.json` — **אינם קוראים WSM** | גבוהה |
| 3 | WSM הוא מקור האמת לסטטוס ריצה, אך pipeline_state נכתב ע"י `pipeline_run.sh` — אין סנכרון אוטומטי | גבוהה |
| 4 | Roadmap חסר בורר דומיין — משתמש ב־`currentDomain` מ־localStorage (ברירת מחדל: tiktrack) | בינונית |
| 5 | EXPECTED_FILES סטטי ל־S001-P002-WP001 — לא מותאם ל־WP הפעיל (S002-P005-WP002) | בינונית |
| 6 | loadPrompt מנסה לטעון `COMPLETE_prompt.md` — קובץ לא קיים | נמוכה |

---

## 2. מיפוי מקורות נתוני המצב

### 2.1 מקורות קיימים

| מקור | נתיב | מי מעדכן | מי קורא |
|------|------|----------|---------|
| pipeline_state_agentsos.json | `_COMMUNICATION/agents_os/` | pipeline_run.sh | Dashboard, Roadmap, state_reader |
| pipeline_state_tiktrack.json | `_COMMUNICATION/agents_os/` | pipeline_run.sh | Dashboard, Roadmap, state_reader |
| WSM CURRENT_OPERATIONAL_STATE | `documentation/.../PHOENIX_MASTER_WSM_v1.0.0.md` | Gate owners (Teams 90/100/190) | state_reader (משווה) |
| PHOENIX_PROGRAM_REGISTRY | `documentation/.../PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | Team 170 / governance | Roadmap (תוכניות) |
| STATE_SNAPSHOT.json | `_COMMUNICATION/agents_os/` | state_reader.py | Dashboard (health warnings) |

### 2.2 זרימת נתונים בממשקים

**Dashboard (PIPELINE_DASHBOARD.html):**
- קורא `loadDomainState(currentDomain)` → `pipeline_state_{domain}.json`
- יש בורר דומיין (TikTrack / Agents OS) — localStorage `pipeline_domain`
- אופציונלי: טוען STATE_SNAPSHOT להשוואה והצגת Health warnings

**Roadmap (PIPELINE_ROADMAP.html):**
- `loadDomainState(currentDomain)` ל־`pipelineState` (להצגת Header WP | Gate | Stage)
- `refreshAllDomainStates()` → טוען **שני** הדומיינים ל־`allDomainStatesCache`
- עץ תוכניות ושלבים: PHOENIX_PORTFOLIO_ROADMAP + PHOENIX_PROGRAM_REGISTRY
- **אין בורר דומיין בעמוד** — `currentDomain` מ־localStorage; ברירת מחדל `tiktrack`
- סטטוס חי: `getLiveProgramStatusOverride(pid)` — משתמש ב־allDomainStatesCache (מעדיף JSON על Registry)

---

## 3. אי־הלימות מפורטות

### 3.1 סתירה פנימית ב־pipeline_state_agentsos.json

```json
"current_gate": "COMPLETE",
"gates_completed": [..., "GATE_8", "COMPLETE"],
"gates_failed": ["GATE_8"]
```

**בעיה:** GATE_8 מופיע גם כ־completed וגם כ־failed. מצב לא עקבי.

**WSM (קנוני):** GATE_8 PASS, DOCUMENTATION_CLOSED, `active_work_package_id: N/A`, `last_closed_work_package_id: S002-P005-WP002`.

**המלצה:** תיקון pipeline.py / pipeline_run.sh — אין להוסיף GATE ל־gates_failed אם הוא כבר ב־gates_completed (או vice versa).

### 3.2 Dashboard vs WSM — current_gate

| מקור | current_gate | הסבר |
|------|--------------|------|
| pipeline_state_agentsos.json | COMPLETE | נכתב ע"י pipeline |
| WSM CURRENT_OPERATIONAL_STATE | GATE_8 | Gate סמנטי אחרון שעבר |
| STATE_SNAPSHOT | COMPLETE | משקף pipeline JSON |

**הערה:** WSM מתאר את ה־gate האחרון שעבר (GATE_8) ושה־lifecycle סגור. pipeline_state משתמש ב־COMPLETE כדי לציין "אין gate פעיל". שני מודלים שונים — אין שגיאה לוגית, אך בלבול אפשרי.

### 3.3 active_work_package_id

| מקור | ערך |
|------|-----|
| WSM | N/A |
| pipeline_state_agentsos | S002-P005-WP002 (work_package_id) |
| STATE_SNAPSHOT | — (אינו מכיל שדה זה) |

**בעיה:** pipeline_state עדיין מציג WP "פעיל" (S002-P005-WP002) בעוד WSM מצהיר `active_work_package_id: N/A` כי ה־lifecycle סגור. הדשבורד יראה WP פעיל על בסיס pipeline_state, בעוד WSM אומר שאין WP פעיל.

### 3.4 Roadmap — domain selector חסר

- **Dashboard:** בורר ברור — TikTrack / Agents OS — עם localStorage.
- **Roadmap:** אין בורר — `currentDomain` נלקח מ־localStorage; אם המשתמש נכנס ישירות ל־Roadmap, ברירת המחדל היא `tiktrack`.
- Sidebar מציג stat cards לשני הדומיינים — אך ה־Header (WP | Gate | Stage) והבחירה של "תוכנית פעילה" תלויות ב־currentDomain בלבד.

### 3.5 EXPECTED_FILES סטטי

- `pipeline-config.js` מגדיר EXPECTED_FILES ל־S001-P002-WP001 (קובצי Team 20/30/50, G3_PLAN וכו').
- WP הפעיל בפועל: S002-P005-WP002.
- הקבצים המצופים שונים לחלוטין — הדשבורד מציג "Expected Output Files" לא רלוונטי.

### 3.6 loadPrompt — קובץ חסר

- כאשר `gate === 'COMPLETE'`, הקוד מנסה לטעון `COMPLETE_prompt.md`.
- קובץ זה אינו קיים — עלול לגרום ל־404 או שגיאה שקטה.

---

## 4. בדיקת MCP (דפדפן)

### 4.1 Dashboard (localhost:8090/agents_os/ui/PIPELINE_DASHBOARD.html)

- **תצוגה:** Gate Timeline — GATE_0 עד GATE_8 כולם מסומנים ✓ (מצב COMPLETE).
- **דומיין:** בורר TikTrack / Agents OS; נראה שנבחר Agents OS (🟢).
- **מודל עזרה:** פתוח כברירת מחדל — Pipeline Guide, FAQ, Troubleshooting.

### 4.2 Roadmap (localhost:8090/agents_os/ui/PIPELINE_ROADMAP.html)

- **תצוגה:** כותרת, Refresh, Auto (5s); Sidebar עם stat cards (TikTrack, Agents_OS, Portfolio Total, Ideas).
- **חסר:** בורר דומיין גלוי; Header "WP | Gate | Stage" תלוי ב־currentDomain.

---

## 5. שורשי הבעיה

1. **ריבוי מקורות אמת ללא סנכרון:**  
   - WSM = סטטוס runtime קנוני (CURRENT_OPERATIONAL_STATE).  
   - pipeline_state_*.json = output של pipeline_run.sh.  
   - אין מנגנון שמסנכרן אוטומטית את pipeline_state עם WSM.

2. **אין SSOT אחד ל־"מה מוצג בדשבורד":**  
   - הממשק מבוסס על pipeline_state בלבד.  
   - WSM מעודכן ידנית ע"י Gate Owners; pipeline_state מעודכן ע"י pipeline_run.sh.  
   - שניהם יכולים להתפצל.

3. **שגיאות לוגיות ב־pipeline:**
   - gates_failed כולל GATE_8 למרות ש־gates_completed כולל אותו — באג ב־pipeline logic.

4. **תחזוקה סטטית:**  
   - EXPECTED_FILES, CANONICAL_FILES — לא מותאמים ל־WP הפעיל.  
   - דורש עדכון ידני עם כל WP חדש.

---

## 6. המלצות

### 6.1 קצר טווח (תיקוני באגים)

| # | פעולה | אחראי |
|---|--------|-------|
| 1 | תיקון pipeline_state_agentsos.json: הסרת GATE_8 מ־gates_failed (או תיקון לוגיקת pipeline.py) | Team 61 |
| 2 | הוספת בורר דומיין ב־Roadmap — זהה ל־Dashboard | Team 61 |
| 3 | הוספת `COMPLETE_prompt.md` או טיפול ב־gate=COMPLETE ב־loadPrompt | Team 61 |

### 6.2 בינוני טווח (ארכיטקטורה)

| # | פעולה | אחראי |
|---|--------|-------|
| 4 | **מקור אמת יחיד ל־UI:** Dashboard + Roadmap יקראו מ־STATE_SNAPSHOT (או מ־WSM דרך state_reader) — במקום pipeline_state ישירות. state_reader יכתוב STATE_SNAPSHOT מתוך WSM + pipeline_state (עם עדיפות ל־WSM בסכסוכים) | Team 61 + Team 10 |
| 5 | **פרוטוקול סנכרון:** pipeline_run.sh בעת pass/fail יעדכן גם את WSM (או ידווח ל־Gate Owner לעדכון), או — state_reader יפיק STATE_SNAPSHOT שמאחד את שניהם ו־UI יקרא רק ממנו | Team 90 / 10 |

### 6.3 ארוך טווח (מניעת drift)

| # | פעולה | אחראי |
|---|--------|-------|
| 6 | **EXPECTED_FILES דינמי:** נגזר מ־registry או מ־WP metadata — לא hardcoded | Team 61 |
| 7 | **Health check משולב:** הדשבורד יציג אזהרה ברורה כאשר pipeline_state סותר את WSM (STATE_SNAPSHOT כבר מכיל לוגיקה דומה — להרחיב ולהדגיש) | Team 61 |

---

## 7. מסקנה

אי־הלימת הסטטוס בין הדשבורד/מפה למצב הקנוני נובעת מריבוי מקורות אמת ללא סנכרון, משגיאות לוגיות ב־pipeline_state, ומחוסר התאמה של קונפיגורציות סטטיות ל־WP הפעיל. תיקוני באגים מיידיים (סעיפים 1–3) יקטינו בלבול; המלצות ארכיטקטוניות (4–7) ימנעו drift חוזר.

---

**log_entry | TEAM_61 | STATUS_ALIGNMENT_REPORT_CREATED | ACTIVE | 2026-03-15**
