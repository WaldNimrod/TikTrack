# Workflow והפרויקט – מפת הדרכים והתצוגה ההיררכית

**מטרה:** איך ה-workflow והפרויקט מציגים את מפת הדרכים, השלבים, התוכניות וחבילות העבודה בצורה היררכית אמיתית ומסודרת.

---

## 0. מודל היררכי ודומיינים

- **היררכיה אמיתית:** שלב (ראשי) → תוכנית (sub של שלב) → חבילת עבודה (sub של תוכנית).
- **שלבים ראשיים:** שמות קנוניים שלב 1 (S001), שלב 2 (S002), … שלב 0 (S-001) = Prerequisites. חבילות העבודה הקיימות תחת שלב 1.
- **דומיינים:** **TikTrack** ו-**Agents_OS**. השלב משותף לשניהם; כל תוכנית וכל חבילת עבודה משויכות לדומיין אחד בלבד.
- ב-snapshot וב-Issues: כל Stage מסומן [SHARED]; כל Program ו-WP נושאים את הדומיין (TikTrack או Agents_OS).

---

## 1. Workflow – מתי רץ

- **קובץ:** `.github/workflows/portfolio-auto-sync.yml`
- **מופעל:**
  - **ידני:** Actions → Portfolio Auto Sync → Run workflow (אפשר לבחור scope: full / stages, ו-close_stale).
  - **אוטומטי:** Push ל-**default branch (main)** כשמשתנים קבצים בנתיבים:
    - `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md`
    - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
    - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`
    - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
    - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`
    - `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`
    - `scripts/portfolio/**`
    - `.github/workflows/portfolio-auto-sync.yml`

**הערה:** הסנכרון ל-GitHub Issues (לצורך תצוגת הפרויקט) רץ רק ב-workflow_dispatch או ב-push ל-**main** (default branch), לא ב-push לענפים אחרים.

### כיוון הפוך: עדכון טבלאות מ-Issues

כשמעדכנים **Issues** ב-GitHub (כותרות, תוויות, היררכיה) — ניתן לעדכן את טבלאות הקנון בהתאם.

- **קובץ:** `.github/workflows/portfolio-sync-from-issues.yml`
- **מופעל:** **ידני** — Actions → **Portfolio Sync From Issues** → Run workflow
- **פעולה:** קורא את כל ה-Issues עם תווית `portfolio-pipeline`, מחלץ מהם שלבים/תוכניות/חבילות עבודה (מהכותרת, מה-body ומהתוויות), ממזג עם הטבלאות הקיימות, ומעדכן את הקבצים:
  - `PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` (Stages)
  - `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` (Programs)
  - `PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` (Work Packages)
- אם היו שינויים — ה-workflow עושה commit ו-push אוטומטי.

**סקריפט:** `scripts/portfolio/update_tables_from_github_issues.py` (ניתן להריץ גם מקומית עם `GITHUB_TOKEN` ו-`GITHUB_REPOSITORY`).

---

## 2. איפה רואים את מפת הדרכים בהיררכיה

### א. תצוגה היררכית ב-Markdown (ב־Workflow)

בכל הרצה של ה-workflow:

1. **Job:** `validate_and_snapshot`  
   - בונה snapshot מ־SSOT (WSM, Roadmap, Program Registry, Work Package Registry).
   - מייצר **Portfolio Snapshot** עם:
     - **Runtime** (מה פעיל כרגע).
     - **Portfolio Counts** (כמות שלבים, תוכניות, חבילות עבודה).
     - **Roadmap (hierarchical)** – מפת הדרכים בהיררכיה אמיתית:
       - **שלב [SHARED]** → **תוכנית (sub)** עם domain → **חבילת עבודה (sub)** עם domain
       - 5 שלבים ראשיים (שלב 2 חסר). כל שלב מוצג עם התוכניות שתחתיו (ודומיין לכל תוכנית), וכל תוכנית עם חבילות העבודה שלה (ודומיין לכל WP).

2. **איפה לראות:**
   - **GitHub Actions:** Run של "Portfolio Auto Sync" → Job **validate_and_snapshot** → Step **Publish summary** – ה-Summary של ה-job מכיל את ה-MD המלא (כולל ההיררכיה).
   - **Artifact:** באותו Run ניתן להוריד את ה-artifact **portfolio-snapshot** (מכיל `portfolio_snapshot.json` ו־`portfolio_snapshot.md`). קובץ ה-.md מכיל את התצוגה ההיררכית.

### ב. GitHub Issues והפרויקט

- **Job:** `sync_github_issues` (רץ אחרי validate_and_snapshot, רק ב-dispatch או ב-push ל-main).
  - יוצר/מעדכן **GitHub Issues** לפי ה-snapshot עם היררכיה אמיתית ודומיינים:
    - תווית כללית: `portfolio-pipeline`
    - סוג: `portfolio-runtime`, `portfolio-stage`, `portfolio-program`, `portfolio-work-package`
    - **דומיין:** `portfolio-domain-SHARED` (לשלבים), `portfolio-domain-TIKTRACK` או `portfolio-domain-AGENTS_OS` (לתוכניות ו-WP)
    - **Parent (sub-issue semantics):** `portfolio-parent-stage-{stage_id}` (לתוכניות ו-WP), `portfolio-parent-program-{program_id}` (ל-WP בלבד)
    - סטטוס: `portfolio-status-active`, `portfolio-status-planned`, וכו'
  - ב-body: `hierarchy_order`, `hierarchy_path`, `parent_stage_key`, `parent_program_key`, ו-`domain` (לתוכניות ו-WP).

- **איך לראות בצורה היררכית:**
  - **GitHub Project:** להוסיף Issues עם `portfolio-pipeline`. לקבץ (Group by) לפי:
    - **`portfolio-parent-stage-*`** — כל ה-Issues שתחת אותו שלב (תוכניות + חבילות עבודה של אותו שלב).
    - **`portfolio-parent-program-*`** — חבילות העבודה שתחת כל תוכנית.
    - **`portfolio-domain-*`** — סינון לפי TikTrack או Agents_OS.
  - **סינון לפי דומיין:** `portfolio-domain-TIKTRACK` או `portfolio-domain-AGENTS_OS` לראות רק פריטים של דומיין אחד.

---

## 3. היררכיה ודומיינים (קבוע)

- **היררכיה:** Stage (משותף) → Program (sub של שלב) → Work Package (sub של תוכנית). Task לא חלק מה-Portfolio.
- **דומיינים:** TikTrack, Agents_OS. שלב משותף; כל תוכנית וכל WP משויכים לדומיין אחד.
- **שלבים:** 5 שלבים ראשיים (שלב 2 חסר). מקורות: `PORTFOLIO_INDEX`, `PHOENIX_PORTFOLIO_ROADMAP`, `PHOENIX_PROGRAM_REGISTRY`, `PHOENIX_WORK_PACKAGE_REGISTRY`.

---

## 4. סיכום

| מקום | מה רואים |
|------|-----------|
| **Actions → validate_and_snapshot → Publish summary** | תצוגה היררכית: שלב [SHARED] → תוכנית (domain) → WP (domain). 5 שלבים, שלב 2 חסר. |
| **Artifact portfolio-snapshot** | `portfolio_snapshot.md` + JSON עם `hierarchy` (שלבים → programs → work_packages) ודומיין לכל פריט |
| **GitHub Issues (portfolio-pipeline)** | כרטיסים עם תוויות דומיין (SHARED/TIKTRACK/AGENTS_OS) ו-parent (parent-stage-*, parent-program-*) |
| **GitHub Project** | Group by `portfolio-parent-stage-*` או `portfolio-parent-program-*` או `portfolio-domain-*` לתצוגה היררכית/לפי דומיין |

עבודה מעכשיו על **main** – Push ל-main שמשנה את קבצי ה-Portfolio או את ה-workflow יגרום להרצה אוטומטית ולעדכון התצוגה והסנכרון ל-Issues.
