---
id: TEAM_101_TO_TEAM_61_DM005_ITEM0_DASHBOARD_HARDENING_MANDATE_v1.0.0
historical_record: true
from: Team 101 (AOS Domain Architect — acting as DM-005 Lead)
to: Team 61 (AOS Main Development Team)
authority: DM-005 cascade authorization (Team 00 → Team 101 → Team 61, ratified 2026-03-24)
parent_mandate: DM-005 v1.2.0 — ITEM-0 (PRE-CONDITION for pipeline verification run)
classification: IMPLEMENTATION_MANDATE
domain: agents_os
engine: Cursor Composer
qa_team: Team 51
status: ACTIVE
date: 2026-03-24---

# TEAM 61 — Dashboard Hardening: אפס 404 + אפס SEVERE Logs

## מידע לפני הכל — קרא לפני כל פעולה

**אתה Team 61 — AOS Main Development Team.**
- Engine: Cursor Composer
- Domain: agents_os בלבד
- Repository: `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/`
- כתיבה מורשית: `agents_os/ui/` בלבד (HTML, JS, CSS של ה-Dashboard)

**הפעלה זו:** מגיעה מ-Team 101 תחת DM-005 v1.2.0 (cascade authorization מאושרת).
**מטרה:** לפני שה-pipeline verification run מתחיל — Dashboard חייב להיות 100% נקי:
> **אפס 404 errors בconsole/network. אפס SEVERE logs. Dashboard עדיין מציג הכל נכון.**

**מה שאתה עושה קובע אם הריצה בכלל מתחילה.**

---

## §1 — קונטקסט: למה יש 404 ו-SEVERE כרגע

### §1.1 — מבנה ה-Dashboard

ה-Dashboard מורכב מ-5 HTML pages ו-JS stack:
```
agents_os/ui/
├── PIPELINE_DASHBOARD.html      ← דף ראשי
├── PIPELINE_ROADMAP.html        ← מפת דרכים + DM Registry panel
├── PIPELINE_CONSTITUTION.html
├── PIPELINE_TEAMS.html
├── PIPELINE_MONITOR.html
└── js/
    ├── pipeline-config.js       ← CANONICAL_FILES, GATE_SEQUENCE, gate definitions
    ├── pipeline-state.js        ← fetchText(), fileExists(), loadDomainState()
    ├── pipeline-dashboard.js    ← לוגיקת Dashboard הראשית
    ├── pipeline-roadmap.js      ← לוגיקת Roadmap + canonical files sidebar
    ├── pipeline-dom.js          ← DOM utilities
    └── ... (עוד קבצים)
```

### §1.2 — שני ה-files שמכילים את הבאגים

| קובץ | בעיה |
|---|---|
| `agents_os/ui/js/pipeline-config.js` | CANONICAL_FILES מכיל 3 Team 10 files שאינם קיימים |
| `agents_os/ui/js/pipeline-dashboard.js` | `loadPrompt()` נקראת עם `gate='COMPLETE'` → מנסה לטעון `*_COMPLETE_prompt.md` שאינו קיים |

### §1.3 — השרשרת הטכנית שמייצרת 404

**בעיה A — Team 10 canonical files:**
```
pipeline-config.js line 565-577 → CANONICAL_FILES array מכיל:
  { label: "Master Task List (Team 10)", path: "../../_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md" }
  { label: "Level-2 Carryover List",     path: "../../_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md" }
  { label: "Level-2 Registry",            path: "../../_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md" }

pipeline-roadmap.js line 660-675 → loadCanonicalFiles():
  CANONICAL_FILES.map(async f => ({ ...f, exists: await fileExists(f.path) }))

pipeline-state.js line 162-165 → fileExists():
  fetch(path, { method: "HEAD" })  ← sends HEAD request → server returns 404 → browser logs it
```

**בעיה B — loadPrompt עם COMPLETE:**
```
pipeline-dashboard.js line 4349:
  if (state) await loadPrompt(state.current_gate);  ← נקרא עם 'COMPLETE'

pipeline-dashboard.js line 367-413 → loadPrompt(gate):
  if (!gate) return;              ← 'COMPLETE' הוא truthy → לא מחזיר
  const path = `../../_COMMUNICATION/agents_os/prompts/${domainSlug}_${gate}_prompt.md`;
  → path = ".../agentsos_COMPLETE_prompt.md"  ← לא קיים
  const text = await fetchText(path);  ← 404 → null (אבל browser לוג)
```

**בעיה C — checkExpectedFiles ב-COMPLETE state:**
```
pipeline-dashboard.js line 4350:
  await Promise.all([loadMandates(), checkExpectedFiles(), loadHealthWarnings()])

pipeline-dashboard.js line 1884-1912 → checkExpectedFiles():
  getExpectedFiles() → כולל delivery + mandate files של ה-WP הנוכחי
  fileExists() על כל קובץ → 3 קבצים לא קיימים → 3x HEAD 404

  הקבצים החסרים (WP = S003-P013-WP001, state = COMPLETE):
  - _COMMUNICATION/agents_os/prompts/tiktrack_COMPLETE_prompt.md
  - _COMMUNICATION/team_61/TEAM_61_S003_P013_WP001_DELIVERY_v1.0.0.md
  - _COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_S003_P013_WP001_MANDATE_v1.0.0.md
```

**בעיה D — DM badge error handler (SEVERE log source):**
```
pipeline-dashboard.js line ~119:
  console.error("[dm-badge]", e);  ← אם fetch של DM registry נכשל → SEVERE log בSelenium
```

---

## §2 — מה לתקן: 4 fixes מדויקים

---

### FIX-1: pipeline-config.js — סמן Team 10 files כ-`optional`

**קובץ:** `agents_os/ui/js/pipeline-config.js`
**שורות:** 568–570

**לפני:**
```javascript
  { label: "Master Task List (Team 10)",     path: "../../_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md" },
  { label: "Level-2 Carryover List",          path: "../../_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md" },
  { label: "Level-2 Registry",                path: "../../_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md" },
```

**אחרי:**
```javascript
  { label: "Master Task List (Team 10)",     path: "../../_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md",          optional: true },
  { label: "Level-2 Carryover List",          path: "../../_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md", optional: true },
  { label: "Level-2 Registry",                path: "../../_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md",           optional: true },
```

**למה:** מסמן אותם כ-optional כדי שה-JS יוכל לדלג על HEAD request עבורם.

---

### FIX-2: pipeline-roadmap.js — דלג על HEAD request ל-optional files

**קובץ:** `agents_os/ui/js/pipeline-roadmap.js`
**פונקציה:** `loadCanonicalFiles()` — שורה ~665

**לפני:**
```javascript
  const results = await Promise.all(CANONICAL_FILES.map(async f => ({ ...f, exists: await fileExists(f.path) })));
```

**אחרי:**
```javascript
  const results = await Promise.all(CANONICAL_FILES.map(async f => {
    if (f.optional) return { ...f, exists: null };  // skip HEAD request — show as "optional"
    return { ...f, exists: await fileExists(f.path) };
  }));
```

ועדכן את ה-render HTML כך שoptional מציג ⚪ במקום 🔴:
```javascript
  el.innerHTML = results.map(f => {
    const icon = f.exists === null ? '⚪' : (f.exists ? '🟢' : '🔴');
    const label = f.exists === null ? `${escHtml(f.label)} <span style="font-size:10px;color:var(--text-muted)">(TikTrack domain — see Team 10)</span>` : escHtml(f.label);
    return `<div class="cf-row">
      <span>${icon}</span>
      <a href="#"
         onclick="${f.optional ? 'return false' : `openFileViewer(${escAttr(JSON.stringify(f.path))},${escAttr(JSON.stringify(f.label))});return false`}"
         title="${escAttr(f.path)}">${label}</a>
    </div>`;
  }).join('');
```

**למה:** קבצי Team 10 שייכים ל-TikTrack domain ואינם חלק מ-AOS flow. הם אופציונליים לחלוטין מבחינת Dashboard.

---

### FIX-3: pipeline-dashboard.js — guard על loadPrompt ב-COMPLETE/NONE

**קובץ:** `agents_os/ui/js/pipeline-dashboard.js`
**פונקציה:** `loadPrompt(gate)` — שורה ~367–368

**לפני:**
```javascript
async function loadPrompt(gate) {
  if (!gate) return;
```

**אחרי:**
```javascript
async function loadPrompt(gate) {
  if (!gate || gate === 'COMPLETE' || gate === 'NONE') return;
```

**למה:** כשWP סגור (COMPLETE/NONE) אין prompt file. `buildCurrentStepBanner` כבר מטפל ב-COMPLETE state עם banner מיוחד — `loadPrompt` לא צריך לרוץ כלל.

---

### FIX-4: pipeline-dashboard.js — דלג על checkExpectedFiles ב-COMPLETE state

**קובץ:** `agents_os/ui/js/pipeline-dashboard.js`
**פונקציה:** `checkExpectedFiles()` — שורה ~1884

**לפני (תחילת הפונקציה):**
```javascript
async function checkExpectedFiles() {
  const list = document.getElementById("file-list");
  if (!list) return;
  list.innerHTML = '<span class="loading">Checking…</span>';

  const files = typeof getExpectedFiles === "function" ? getExpectedFiles() : EXPECTED_FILES;
```

**אחרי:**
```javascript
async function checkExpectedFiles() {
  const list = document.getElementById("file-list");
  if (!list) return;

  // When WP is COMPLETE or no active WP — skip file checks (historical WP, files may not exist)
  const gate = pipelineState?.current_gate || '';
  if (gate === 'COMPLETE' || gate === 'NONE' || !gate) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:4px 0">⚪ No active work package — file checks not applicable</div>';
    const badge = document.getElementById("files-badge");
    if (badge) badge.textContent = 'N/A';
    return;
  }

  list.innerHTML = '<span class="loading">Checking…</span>';

  const files = typeof getExpectedFiles === "function" ? getExpectedFiles() : EXPECTED_FILES;
```

**למה:** כשה-pipeline ב-COMPLETE state, אין WP פעיל — הבדיקה של "expected files" לא רלוונטית ומייצרת 404 noise. הודעת "No active work package" מספקת למשתמש.

---

## §3 — תהליך הבדיקה לפני QA

לאחר כל 4 fixes — בדוק בעצמך לפני שמעביר ל-Team 51:

```
1. פתח Terminal בתיקיית הrepository
2. הפעל HTTP server:
   python3 -m http.server 8090 --directory .
3. פתח Chrome/Chromium
4. פתח DevTools (F12)
5. לחץ על Console tab — בחר level: "All levels" (לראות הכל)
6. לחץ על Network tab

7. נווט אל: http://localhost:8090/agents_os/ui/PIPELINE_DASHBOARD.html
8. המתן 3-5 שניות לטעינה מלאה

9. בדוק Console:
   □ אפס שורות אדומות (console.error)
   □ אפס "404" בconsole
   □ ייתכנו console.warn — מותר (צהוב)

10. בדוק Network:
    □ לחץ על filter "4xx" — האם יש requests?
    □ אם יש: תעד אותם ותקן לפני שממשיך

11. נווט אל: http://localhost:8090/agents_os/ui/PIPELINE_ROADMAP.html
    □ בדוק Console: אפס errors
    □ בדוק Sidebar "Canonical Files": Team 10 items מציגים ⚪ (לא 🔴)
    □ בדוק Network: אפס HEAD requests שנכשלים

12. חזור ל-Dashboard:
    □ הverification: badge "⚪ No active work package" מוצג בpanel ה-files
    □ Banner מציג "Work Package Closed" (COMPLETE state)
    □ DM badge מוצג נכון (DM ●N)

13. Preflight check — רץ את הSelenium smoke test:
    HEADLESS=true python3 -m pytest tests/selenium/ -x -q
    → חייב להיות 206+ passed, exit 0
```

---

## §4 — QA Process מול Team 51

### §4.1 — מה לשלוח ל-Team 51

לאחר שעברת §3 בעצמך ו-smoke test עבר — כתוב delivery document:

```
_COMMUNICATION/team_61/TEAM_61_DM005_ITEM0_DASHBOARD_HARDENING_DELIVERY_v1.0.0.md
```

**תוכן delivery:**
```markdown
---
id: TEAM_61_DM005_ITEM0_DASHBOARD_HARDENING_DELIVERY_v1.0.0
from: Team 61
to: Team 51 (QA)
date: [תאריך]
status: DELIVERY
---

## קבצים ששונו
1. agents_os/ui/js/pipeline-config.js — FIX-1 (optional flag)
2. agents_os/ui/js/pipeline-roadmap.js — FIX-2 (skip HEAD for optional)
3. agents_os/ui/js/pipeline-dashboard.js — FIX-3 (loadPrompt guard) + FIX-4 (checkExpectedFiles guard)

## ראיות self-test
- Console screenshot: [צרף screenshot של Console ריק]
- Network screenshot: [צרף screenshot של Network בלי 404]
- Roadmap screenshot: [צרף screenshot של Canonical Files עם ⚪ לTeam 10]
- pytest output: [הדבק output של pytest 206+ passed]

## checksums / commits
[git diff --stat output]
```

### §4.2 — מה Team 51 בודק (הנחיות ל-Team 51 — כלול במסמך הdelivery)

```markdown
## הנחיות ל-Team 51

### בדיקות נדרשות:
1. pytest regression: `HEADLESS=true python3 -m pytest tests/selenium/ -x -q`
   → חייב: 206+ passed, exit 0

2. Browser console check (Dashboard):
   - טען http://localhost:8090/agents_os/ui/PIPELINE_DASHBOARD.html
   - DevTools Console: אפס errors אדומות
   - DevTools Network → filter 4xx: אפס failures
   → חייב: ZERO console.error, ZERO 404 in Network

3. Browser console check (Roadmap):
   - טען http://localhost:8090/agents_os/ui/PIPELINE_ROADMAP.html
   - DevTools Console: אפס errors
   - Canonical Files sidebar: Team 10 items → ⚪ icon (לא 🔴, לא HEAD request)
   → חייב: ⚪ לשלושת קבצי Team 10

4. Dashboard functional regression:
   - banner מציג "Work Package Closed" (COMPLETE state)
   - DM badge מציג נכון
   - שאר Canonical Files (לא Team 10) עדיין מציגים 🟢/🔴 נכון
   - "files-badge" מציג "N/A" כש-gate=COMPLETE

5. Roadmap functional regression:
   - DM Registry panel מציג active mandates
   - Program selector עובד
   - Gate history עובד

### Pass Condition:
כל 5 בדיקות = PASS → QA_PASS
כל failure → BN + Team 61 מתקן + re-QA
```

### §4.3 — Return Path מ-Team 51

```
Team 51 → _COMMUNICATION/team_51/TEAM_51_DM005_ITEM0_DASHBOARD_QA_REPORT_v1.0.0.md
→ Team 101 reviews
→ אם QA_PASS: ITEM-0 COMPLETE → Team 101 מתחיל ITEM-2 (pipeline verification run)
```

---

## §5 — מה מחוץ לסקופ שלך

| פריט | למה לא |
|---|---|
| יצירת קבצי Team 10 החסרים | Team 10 אחראי לקבצים שלו — לא scope שלך |
| שינויים בbackend (FastAPI) | לא scope של DM-005 |
| שינויים ב-TikTrack pipeline | TikTrack domain = Phase 2 |
| הוספת features חדשים | fix בלבד |
| שינויים ב-CSS/HTML structure | fix בלבד — אל תשנה layout |
| שינויים ב-pipeline-state.js | fileExists/fetchText נשארים כמו שהם |

**כלל:** אם לא כתוב מפורש ב-§2 — לא לגעת.

---

## §6 — Return Path שלך

```
1. בצע FIX-1..4
2. Self-test §3 — PASS
3. כתוב TEAM_61_DM005_ITEM0_DASHBOARD_HARDENING_DELIVERY_v1.0.0.md
4. שלח ל-Team 51 לQA (§4)
5. Team 51 QA_PASS → ITEM-0 COMPLETE → דווח ל-Team 101
```

**log_entry | TEAM_101 | TO_TEAM_61 | DM005_ITEM0_DASHBOARD_HARDENING_MANDATE | ACTIVATED | 2026-03-24**
