# TEAM_190_TO_TEAM_170_CROSS_DOMAIN_STRUCTURE_IMPLEMENTATION_MANDATE_v1.0.0

**project_domain:** SHARED  
**from:** Team 190 (Architectural Validator / Spy)  
**to:** Team 170 (Spec Owner / Librarian)  
**cc:** Team 100, Team 70, Team 10  
**status:** ACTION_REQUIRED  
**priority:** CRITICAL  
**scope:** Stage 1+2 only (MOVE-ONLY)  
**date:** 2026-02-22

## מקור מחייב לביצוע

1. _COMMUNICATION/team_190/TEAM_190_CROSS_DOMAIN_DOCUMENTATION_INTELLIGENCE_REPORT_2026-02-22.md

## גבולות קשיחים (חובה)

1. מימוש Stage 1+2 בלבד.
2. אין עריכת תוכן קבצים (No content edits).
3. מותר רק: move/rename/relocate של קבצים ותיקיות.
4. אין כתיבת נהלים חדשים ואין סטנדרטיזציה תוכנית (זה Stage 3 בלבד).
5. אם פעולה דורשת שינוי תוכן כדי להמשיך: לעצור, לרשום כ-Blocker, לא לעקוף.

## Invariants מחייבים (לא לשנות)

1. Roadmap/Stages משותפים לשני הדומיינים.
2. SSM/WSM משותפים (shared canonical).
3. מודל שערים ותפקידי צוותים משותפים.
4. Program ו-Work Package הם חד-דומיין בלבד.
5. Domain-local override לא משנה shared canonical artifacts.

## משימות ביצוע חובה — Stage 1+2 (מלא)

1. לאחד טופולוגיית משילות לשורש פעיל יחיד תחת: `documentation/docs-governance/`
2. לבצע move-only כך שתהיה היררכיה פעילה אחת (ללא שורשים פעילים מקבילים).
3. למקם Gateway/Index בשורש governance באופן דטרמיניסטי: `documentation/docs-governance/00-INDEX/`
4. לאכוף הפרדה פיזית בין shared ל-domain:
   - **shared:** תחת `documentation/docs-governance` + `documentation/docs-system`
   - **AGENTS_OS domain-local:** תחת `agents_os/docs-governance` + `agents_os/documentation`
5. לבודד candidates עם סתירה מקומית (move-only quarantine), כולל: `agents_os/docs-governance/MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.4.0.md`
6. לנרמל גבול תקשורת: _COMMUNICATION אינו מקור SSOT קנוני; רק thread/evidence layer.
7. למקם gateway בסיסי גם ב-Agents_OS (move-only):
   - `agents_os/docs-governance/00-INDEX/`
   - `agents_os/documentation/00-INDEX/`

## פלט חובה למסירת ריוולידציה (Team 190)

הגשו את כל המסמכים הבאים תחת: `_COMMUNICATION/team_170/`

1. CROSS_DOMAIN_STRUCTURE_MOVE_LOG_v1.0.0.md
2. SHARED_VS_DOMAIN_PLACEMENT_MATRIX_v1.0.0.md
3. ROOT_GATEWAY_INDEX_PLACEMENT_REPORT_v1.0.0.md
4. AGENTS_OS_LOCAL_OVERRIDE_CANDIDATES_REPORT_v1.0.0.md
5. COMMUNICATION_BOUNDARY_ENFORCEMENT_REPORT_v1.0.0.md
6. POST_MOVE_SOURCE_MAP_REGEN_REPORT_v1.0.0.md
7. TEAM_170_FINAL_DECLARATION_STAGE_1_2_COMPLETION_v1.0.0.md

## קריטריוני PASS (Stage 1+2)

1. טופולוגיית governance פעילה יחידה.
2. Gateway/Index דטרמיניסטי ונגיש משורש governance.
3. shared artifacts מחוץ ל-agents_os.
4. domain-local artifacts בתוך agents_os.
5. conflict candidates מבודדים פיזית ל-Stage 3.
6. אין תלות גילוי קנוני בנתיבי _COMMUNICATION.

## כלל תפעולי

1. סטטוס נשאר IN_PROGRESS עד PASS של Team 190.
2. אין מעבר ל-Stage 3 לפני PASS רשמי.

**log_entry | TEAM_190 | CROSS_DOMAIN_STRUCTURE_STAGE_1_2_EXECUTION | ACTION_REQUIRED | 2026-02-22**
