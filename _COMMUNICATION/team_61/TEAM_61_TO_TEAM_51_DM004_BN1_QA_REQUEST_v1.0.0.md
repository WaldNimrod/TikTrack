---
id: TEAM_61_TO_TEAM_51_DM004_BN1_QA_REQUEST_v1.0.0
historical_record: true
from: Team 61 (Cloud Agent / Agents_OS UI)
to: Team 51 (QA Remote — FAST_2.5 / E2E)
cc: Team 100 (Gateway — QA required prior to Registry closure), Team 90 (Bridge — informational)
date: 2026-03-23
status: QA_REQUEST_ACTIVE
type: CANONICAL_QA_ACTIVATION
direct_mandate: DM-004
supersedes_matrix: BN-1 re-validation (post-architect binding note)
authority_basis:
  - TEAM_61_DM_004_BN1_CONFIRMATION_v1.0.0.md (implementation)
  - Prior QA baseline: TEAM_51_DM004_DMP_UI_QA_REPORT_v1.0.0.md (QA_PASS)---

# בקשת QA קנונית — Team 51 | DM-004 **BN-1** (Badge / Active-tab parity)

## §1 — מטרה

**דרישת Team 100:** אימות QA עצמאי **לאחר** יישום **BN-1** — תיקון מחייב שבו ספירת באדג' ה-Dashboard **חייבת** להתאים לטאב **Active** ב-Roadmap (כל השורות עם `Status !== CLOSED`, לא רק `ACTIVE`).

| רכיב | תיאור |
|------|--------|
| שינוי לוגי | `loadDmDashboardBadge()` ב-`pipeline-dashboard.js` — ספירה לפי **non-`CLOSED`** (שורה עם הערת BN-1 בקוד). |
| מסמך יישום | `_COMMUNICATION/team_61/TEAM_61_DM_004_BN1_CONFIRMATION_v1.0.0.md` |
| בסיס QA קודם | `_COMMUNICATION/team_51/TEAM_51_DM004_DMP_UI_QA_REPORT_v1.0.0.md` (**QA_PASS** לפני BN-1) |

לאחר **QA_PASS** קנוני — Team 61 מעביר ל-**Team 100** לסגירת **DM-004** ב-Registry (DMP).

---

## §2 — Identity header (מחייב)

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| direct_mandate_id | **DM-004** |
| change_id | **BN-1** (binding architectural note) |
| mandate_ref | `TEAM_00_TO_TEAM_61_DMP_UI_INTEGRATION_MANDATE_v1.0.0.md` |
| registry_ssot | `_COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md` |
| team_61_bn1 | `_COMMUNICATION/team_61/TEAM_61_DM_004_BN1_CONFIRMATION_v1.0.0.md` |
| primary_files | `agents_os/ui/js/pipeline-dashboard.js` (`?v=18`), `PIPELINE_DASHBOARD.html`; `pipeline-roadmap.js` (`?v=5`) — הערת JSDoc בלבד ל-`#dm-panel` |

---

## §3 — In / Out of scope

| In scope | Out of scope |
|----------|----------------|
| אימות **parity**: מספר בבאדג' Dashboard = מספר שורות בטאב **Active** ב-Roadmap (אותו מקור registry) | שינוי `DIRECT_MANDATE_REGISTRY` ללא אישור Team 100 |
| רגרסיה pytest (AC-09) | יצירת קבצי Team 10 / artifacts חסרים (backlog נפרד) |
| E2E + MCP כמו בבקשה המקורית | שינוי `extractTable` |

---

## §4 — תנאי קדם

זהים לבקשה המקורית: `_COMMUNICATION/team_61/TEAM_61_TO_TEAM_51_DM004_DMP_UI_QA_REQUEST_v1.0.0.md` — **§4** (שרת 8090, `/static/`, mount `_COMMUNICATION`).

**גרסאות מינימום לבדיקה:** `pipeline-dashboard.js?v=18`, `pipeline-roadmap.js?v=5` (או קוד מעודכן עם אותו תוכן BN-1).

---

## §5 — מטריצת בדיקה (BN-1 + רגרסיה)

| # | מזהה | בדיקה | תוצאה צפויה |
|---|------|--------|-------------|
| **B1** | **BN-1 core** | Roadmap → טאב **Active**: קראו את המונה בכותרת `Active (N)` או ספרו שורות DM גלויות | רשמו `N_active` |
| **B2** | **BN-1 core** | Dashboard → באדג' **DM** | המספר אחרי **●** שווה ל-**`N_active`** (פרט לרגע טעינה קצר — אז נרמול לערך הסופי) |
| **B3** | Consistency | השוואה חוצה-דפים | `N_active` מטבלת ה-registry (שורות עם `Status` לא `CLOSED`, case-insensitive) = אותו `N` כמו ב-B1 וב-B2 |
| R1 | AC-01–02, AC-06–07, AC-09 | רגרסיה מהירה | כמו בדוח Team 51 הראשון: פאנל DM, טאבים, לחיצה על באדג' → `#dm-panel`, read-only, **pytest** `206 passed` (או שקיל; סינון OpenAI/Gemini כמתואר בפרויקט) |

**הערה:** ב-registry הנוכחי רוב השורות הפתוחות הן `ACTIVE` — **B1–B3** מאמתים במפורש שאין סתירה; אם בעתיד תתווסף שורה `PENDING_REVIEW` / `DRAFT`, הבאדג' והטאב חייבים עדיין להתאים (זה עיקר BN-1).

---

## §6 — E2E / MCP (מומלץ)

1. Roadmap → snapshot טאב Active — מונה/שורות.  
2. Dashboard → snapshot `#dm-active-badge` — אימות מספר = B1.  
3. לחיצה על הבאדג' → Roadmap `#dm-panel` — ללא רגרסיה.  
4. `browser_unlock` בסיום.

---

## §7 — ארטיפקט נדרש מ-Team 51

| Deliverable | נתיב |
|-------------|------|
| דוח QA קנוני (BN-1) | `_COMMUNICATION/team_51/TEAM_51_DM004_BN1_QA_REPORT_v1.0.0.md` (או גרסה עוקבת) |
| שורת תוצאה | `QA_PASS` או `QA_FAIL` |
| ראיה | צילומי מסך / MCP snapshot ל-**B1–B3**; פלט pytest + exit code |

---

## §8 — אחרי QA_PASS

1. Team 51 מפרסם דוח BN-1 עם **QA_PASS**.  
2. Team 61 מעדכן **Team 100** עם נתיב הדוח + `TEAM_61_DM_004_BN1_CONFIRMATION_v1.0.0.md` — **סגירת Registry** ל-DM-004.  
3. כשל: נתבו ממצאים ל-Team 61; אין סגירת Registry עד remediation.

---

## §9 — כשל (QA_FAIL)

- צעדי שחזור, גרסת commit/קובץ, snapshot.  
- Team 61 מתקן; חוזרים לבקשה זו או לגרסה מתוקנת.

---

## §10 — Resolution (2026-03-23)

| Field | Value |
|-------|--------|
| verdict | **QA_PASS** |
| report | `_COMMUNICATION/team_51/TEAM_51_DM004_BN1_QA_REPORT_v1.0.0.md` |
| team_61_final_handoff | `_COMMUNICATION/team_61/TEAM_61_DM_004_BN1_TEAM51_QA_ACK_AND_TEAM100_FINAL_v1.0.0.md` |

---

**log_entry | TEAM_61 | TO_TEAM_51 | DM004_BN1_QA_REQUEST | 2026-03-23**
