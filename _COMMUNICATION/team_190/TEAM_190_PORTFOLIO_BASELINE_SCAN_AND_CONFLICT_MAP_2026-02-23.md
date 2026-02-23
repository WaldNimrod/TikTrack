# TEAM_190_PORTFOLIO_BASELINE_SCAN_AND_CONFLICT_MAP_2026-02-23

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**from:** Team 190 (Architectural Validator / Spy)  
**to:** Team 170 (Spec Owner / Librarian Flow), Team 100, Team 10, Team 90  
**cc:** Team 00  
**date:** 2026-02-23  
**status:** BASELINE_LOCKED_FOR_MIGRATION  

---

## 1) מטרת הסריקה

לייצר Baseline קנוני לפני מיגרציית Portfolio, כדי לבטל כפילויות סטטוס ולנעול מודל אחיד:
1. מצב פעיל (runtime) — מקור אמת יחיד ב־WSM.
2. פורטפוליו/פייפליין — סטטוס Stage/Program/Work Package ברשומות ייעודיות, ללא רמת Task.

---

## 2) החלטות נעולות (Input מחייב)

1. מפת דרכים אחת בלבד.
2. שלבים (Stages) יכולים להיות רב־דומיינים.
3. כל Program הוא חד־דומיין בלבד.
4. שלבים ותוכניות מנוהלים ע"י המחלקה האדריכלית.
5. בתוך Program, חבילות עבודה (Work Packages) מנוהלות ע"י מחלקת הביצוע (במיוחד Team 10).
6. לכל Work Package תהליך שערים אחד בלבד.
7. ניתן לנהל כמה Work Packages תחת אותו Program.
8. לכל Work Package חייב להיות gate נוכחי.
9. יש סימון ברור ל־Work Package פעילה.
10. חייבים לאפשר מצב `NO_ACTIVE_WORK_PACKAGE`.
11. רמת Task אינה חלק מהפורטפוליו; זה מידע פנימי של Team 10 ושל הצוותים המקצועיים.

---

## 3) מצב קיים — מיפוי SSOT בפועל

### 3.1 Runtime SSOT (קיים)

1. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`  
   - כולל `CURRENT_OPERATIONAL_STATE` כבלוק קנוני יחיד.
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`  
   - קובע שחוקית סטטוס תפעולי נשמר רק ב־WSM.

### 3.2 Roadmap / Portfolio Sources (מבוזר חלקית)

1. `_COMMUNICATION/_Architects_Decisions/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md` (Roadmap פעיל).
2. `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` (מכיל גם מידע Program/WP וגם משימות).
3. `_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md` (רג'יסטרי רשימות רמה 2).
4. `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md` (Carryover היסטורי/תפעולי).

### 3.3 Snapshot/Legacy Sources (גורמי בלבול)

1. `_COMMUNICATION/team_10/ACTIVE_STAGE.md` (קובץ תפעולי היסטורי).
2. `_COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/10_ACTIVE_STAGE_REFERENCE.md` (snapshot).
3. `_COMMUNICATION/team_100/ARCHITECT_SUBMISSION_BUNDLE_DEV_OS_TARGET_v1.2/ACTIVE_STAGE.md` (NOT CANONICAL snapshot).
4. `_COMMUNICATION/team_100/ARCHITECT_SUBMISSION_BUNDLE_DEV_DEPT_TARGET_v1.1/ACTIVE_STAGE.md` (NOT CANONICAL snapshot).

---

## 4) פערים מרכזיים שאותרו

### P1 (חוסם מודל נקי)

1. אין כיום Portfolio SSOT אחד ומרוכז ל־Stage/Program/WP.
2. מידע Portfolio מפוזר בין Roadmap, Master Task List, ו־ACTIVE_STAGE snapshots.
3. רמת Task ורמת Portfolio מעורבבות ב־`TEAM_10_MASTER_TASK_LIST.md`.
4. אין חוזה סנכרון דטרמיניסטי בין עדכון Gate ב־WSM לבין עדכון Program/WP portfolio status.

### P2 (דיוק וניקוי)

1. קיימים קבצי snapshot עם סטטוס היסטורי/לא קנוני שעלולים להיתפס כמקור פעיל.
2. חסר מנגנון פורמלי למצב `NO_ACTIVE_WORK_PACKAGE` ברשומת פורטפוליו.
3. חסר אינדקס פורטפוליו ייעודי בשורש governance.

---

## 5) כיוון מיגרציה (Target Model)

### 5.1 עקרון על

1. Runtime: נשאר אך ורק ב־WSM (`CURRENT_OPERATIONAL_STATE`).
2. Portfolio: עובר למערכת קנונית נפרדת ומינימלית ברמת Stage/Program/WP בלבד.
3. Task-level: נשאר פנימי ל־Team 10 ולצוותים המקצועיים; מחוץ לפורטפוליו הקנוני.

### 5.2 תוצרי יעד קנוניים (ליצירה)

1. `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md`
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`
3. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
4. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`
5. `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`

---

## 6) הגדרת בעלויות (כדי למנוע drift)

1. Roadmap/Stage/Program schema ownership: Team 100 + Team 00 (אדריכלי).
2. Work Package registry operational ownership: Team 10 (ביצוע), תחת חוקי הממשל.
3. Gate updates: לפי matrix הקיים ב־WSM/Protocol.
4. Validation ownership:
   - Team 190: מודל משילות ותאימות אדריכלית.
   - Team 90: תהליך ולידציה לפיתוח לפי שערים.

---

## 7) סטטוס סריקה

Baseline הושלם ומוכן להמרה להוראת עבודה מלאה לצוות 170.

**log_entry | TEAM_190 | PORTFOLIO_BASELINE_SCAN_AND_CONFLICT_MAP | LOCKED | 2026-02-23**
