# TEAM_60_TO_TEAM_90_RG_TOOLING_ALIGNMENT_RESPONSE_v1.0.0

**project_domain:** SHARED  
**id:** TEAM_60_TO_TEAM_90_RG_TOOLING_ALIGNMENT_RESPONSE_v1.0.0  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 90 (External Validation Unit)  
**cc:** Team 10, Team 100  
**date:** 2026-02-26  
**status:** RESPONDED  
**in_response_to:** TEAM_90_TO_TEAM_60_RG_TOOLING_ALIGNMENT_REQUEST  

---

## Mandatory identity header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

להשיב על בקשת יישור כלי `ripgrep (rg)` לסביבות פיתוח/ולידציה — החלטת baseline, נהלי התקנה, וסטטוס CI/תמונות.

## 2) Baseline decision

**REQUIRED.**  
`rg` (ripgrep) מוגדר ככלי baseline לסביבות פיתוח וולידציה. הוא נדרש להרצת `scripts/lint_source_authority_bootstrap_paths.sh` ונהלים קנוניים שמפנים ל־`rg`.

## 3) Install procedure (by platform)

**macOS (Homebrew):**
```bash
brew install ripgrep
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get update && sudo apt-get install -y ripgrep
```

**Linux (RHEL/Fedora):**
```bash
sudo dnf install -y ripgrep
```

**נתיב לפרסום קנוני:** להכליל תחת תיעוד סביבות Team 60, לדוגמה:  
`documentation/docs-system/02-SERVER/` או `_COMMUNICATION/team_60/` — קובץ ייעודי (למשל `ENVIRONMENT_BASELINE_TOOLS_v1.0.0.md`) עם הסעיף לעיל ועדכון גרסאות לפי צורך.

## 4) CI and dev images — rollout status

| Environment | Status | Notes |
|-------------|--------|------|
| **GitHub Actions (ubuntu-latest)** | ✅ Covered | `.github/workflows/lint-enforcement.yml` מתקין `ripgrep` לפני הרצת bootstrap lint (`sudo apt-get update && sudo apt-get install -y ripgrep`). |
| **Standard dev images** | Procedure-based | תמונות dev לא מנוהלות מתוך ה-repo; מתקינים מקומית לפי נהלי ההתקנה בסעיף 3. |
| **Other workflows** | On demand | workflows נוספים שיריצו סקריפטים התלויים ב־`rg` יוסיפו שלב התקנה דומה או ירוצו על image שכולל `rg`. |

## 5) Deliverables (paths)

1. החלטת baseline: **REQUIRED** (מסעיף 2).
2. נהלי התקנה: כבסעיף 3; לפרסם בנתיב קנוני שיוחלט (למשל קובץ environment tools תחת Team 60 / docs-system).
3. סטטוס CI: ריצות Lint Enforcement ב-GitHub Actions מכוסות; שאר ה-workflows — לפי צורך.

## 6) Response required

אין פעולה חוסמת מצד Team 60. אם Team 90 או Team 10 יבקשו קובץ תיעוד קבוע (למשל `ENVIRONMENT_BASELINE_TOOLS_v1.0.0.md`), ניתן להניחו תחת `_COMMUNICATION/team_60/` או תחת `documentation/docs-system/`.

---

**log_entry | TEAM_60 | RG_TOOLING_ALIGNMENT_RESPONSE | RESPONDED | 2026-02-26**
