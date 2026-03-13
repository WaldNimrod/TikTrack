# Team 10 → Team 191 | KB-015 Branch Protection — מנדט הגדרת שער איכות ל־PR

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_TO_TEAM_191_KB_015_BRANCH_PROTECTION_MANDATE_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 191 (Git Governance Operations)  
**cc:** Team 60, Team 170, Team 190  
**date:** 2026-03-13  
**status:** ACTIVE  
**scope:** KB-015 — CI/CD PR quality gate pipeline (Branch Protection Rules)  
**authority:** KNOWN_BUGS_REGISTER; ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE

---

## 1) Mandatory Identity Header

| Field | Value |
|-------|-------|
| bug_id | KB-2026-03-03-17 (KB-015) |
| scope_id | CLOUD_AGENT_SCAN |
| severity | CRITICAL |
| owner_team | Team 60 (original); משימת הגדרה → Team 191 (Git/repo) |
| orchestrator | Team 10 |
| target_cycle | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |

---

## 2) קונטקסט מלא

### 2.1 תיאור הבאג

**KB-015:** "No CI/CD PR quality gate pipeline" — אין שער איכות חוסם ל־PR לפני merge.

הבאג נרשם ב־2026-03-03 כחלק מסריקת Cloud Agent. הכוונה: אף ש־CI רץ על PR, **ניתן למזג PR גם כאשר CI נכשל** — אלא אם מוגדרות Branch Protection Rules ב־GitHub שמחייבות את ה־status checks לעבור לפני merge.

### 2.2 מה קיים בקוד (מאומת)

| רכיב | סטטוס | מיקום |
|------|--------|-------|
| CI Workflow | ✅ קיים | `.github/workflows/ci.yml` |
| Trigger | ✅ `push` + `pull_request` | main, develop |
| BLOCKING jobs | ✅ | `Backend Tests & Security`, `Frontend Build & Lint` |
| BLOCKING steps | ✅ | Unit Tests, Suite B, Bandit HIGH, Frontend Build — ללא continue-on-error |

ה־workflow עצמו תקין. הכישלון הוא ב־**GitHub repository settings** — אין אכיפה שמונעת merge כאשר CI אדום.

### 2.3 מה חסר (לא ניתן לוודא מתוך repo)

**Branch Protection Rules** על `main` (ו־`develop` אם רלוונטי):

- "Require status checks to pass before merging" — **לא מופעל** (או לא מוגדר)
- Required status checks: `Backend Tests & Security`, `Frontend Build & Lint` — **לא נבחרו**

### 2.4 מקורות סמכות

| מסמך | תפקיד |
|------|--------|
| `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` | רג'יסטר באגים — KB-015 OPEN |
| `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0.md` §5, §7 | CI/CD Pipeline + PR gate — ADOPT |
| `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` | Team 191 — Git Governance Operations |

---

## 3) משימת Team 191

### 3.1 משימה ראשית

**להגדיר Branch Protection Rules** ב־GitHub כך ש־CI ישמש כשער איכות חוסם ל־PR.

### 3.2 פעולות חובה

| # | פעולה | פרטים |
|---|--------|--------|
| 1 | גישה ל־Settings | GitHub → Repo → Settings → Branches → Branch protection rules |
| 2 | עריכת כלל עבור `main` | הוסף או עדכן rule ל־`main` |
| 3 | הפעלת "Require status checks" | ✅ Require status checks to pass before merging |
| 4 | בחירת status checks | נדרש: `Backend Tests & Security`, `Frontend Build & Lint` |
| 5 | אופציונלי — עדכניות | ✅ Require branches to be up to date before merging (מומלץ) |
| 6 | develop (אם קיים) | אותה הגדרה ל־`develop` אם המשגר משתמש בו |

### 3.3 שמות ה־Status Checks (גופנים מדויקים)

ה־job names ב־`ci.yml` מגדירים את השמות ב־GitHub:

- `Backend Tests & Security`
- `Frontend Build & Lint`

יש לבחור **בדיוק** את השמות הללו ב־"Require status checks".

### 3.4 אם אין גישת Settings

אם ל־Team 191 אין הרשאות Settings ב־GitHub:

1. להכין **מסמך בקשה מובנה** לבעל הרפו / מנהל (Nimrod) עם ההוראות למעלה.
2. לציין: קישור ל־KNOWN_BUGS_REGISTER, קישור למנדט זה, רשימת הפעולות המדויקות.
3. לאחר ביצוע — להחזיר ל־Team 10 דוח סגירה.

---

## 4) MoV (Method of Verification) לסגירה

לאחר הגדרת Branch Protection:

| בדיקה | אופן |
|-------|------|
| 1 | פתיחת PR עם שינוי שיגרום ל־pytest ליפול (למשל `assert False` ב־`tests/unit/`) |
| 2 | וידוא ש־CI רץ ומחזיר failure |
| 3 | ניסיון merge — **חייב** להיות חסום עם הודעת "Required status check ... is expected" |
| 4 | תיקון הקוד → CI ירוק → merge מתאפשר |

אם 1–4 מתקיימים → **CLOSE** את KB-015.

---

## 5) פלט נדרש מ־Team 191

לאחר ביצוע:

| שדה | תוכן |
|-----|------|
| overall_result | PASS / BLOCK |
| action_taken | "Branch protection configured" / "Request sent to repo admin" / "Blocked: no Settings access" |
| checks_verified | רשימת הבדיקות (אם בוצעו) |
| remaining_blockers | אם לא הושלם — מה חסר |
| owner_next_action | Team 10 (עדכון register) / Nimrod (אם נדרשת הפעלה ידנית) |

---

## 6) Evidence chain להעברת Team 10

לאחר סגירת הבאג, Team 10 יעדכן את KNOWN_BUGS_REGISTER ל־CLOSED. נדרש:

- דוח סגירה מ־Team 191 (או אישור מהמנהל שבוצע)
- ציון תאריך הביצוע

---

**log_entry | TEAM_10 | TO_TEAM_191 | KB_015_BRANCH_PROTECTION_MANDATE | ISSUED | 2026-03-13**
