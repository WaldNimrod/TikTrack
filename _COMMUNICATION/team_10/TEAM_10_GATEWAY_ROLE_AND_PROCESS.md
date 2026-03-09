**date:** 2026-03-09

# תפקיד צוות 10 (The Gateway) — ניהול תהליך והפעלת צוותים
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)

**id:** `TEAM_10_GATEWAY_ROLE_AND_PROCESS`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **מחייב — רענון תפקיד ונוהל עבודה**  
**last_updated:** 2026-02-25  
**מקורות קנוניים:** Gate Protocol `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`; Runbook `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`; מיפוי צוותים `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`; נעילת פורמט הודעות `_COMMUNICATION/team_190/TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md`.

---

## 1. תפקידנו — בקצרה

**מנצח התזמורת והמתזמן והמתזמר.** צוות 10 = שומרי השערים והסטטוס בכל רגע; הקורדינטור; יוצר התוכנית ואחראי להביאה לסיום ולידציה בצורה האופטימלית והיעילה ביותר — מקבלת האפיון המאושר ועד לסיום QA וולידציה.

- **ניהול התהליך:** שמירת סדר המשימות והסטטוס; **הפעלת הצוותים** — בסדר הנכון, עם המידע הדרוש לביצוע אופטימלי ומדויק.
- **לאחר אישור חבילת עבודה (GATE_3 G3.5 — work-plan validation PASS):** **להוציא את התוכנית לפועל** = להעביר לכל צוות: (1) **קישור לתוכנית המלאה** כקונטקסט, (2) **סדר ביצוע** כולל תלויות ותאומים דרושים, (3) **משימות ספציפיות** לאותו צוות. מסמך מרכזי אחד + פרומט לכל צוות (בבלוק קוד, עם כותרת קנונית) לפי סדר הביצוע.
- **משימות צוותים:** מיד הודעה ברורה עם משימות, תוצרים נדרשים ודיווח. הצוותים ממתינים להוראות מאיתנו.
- **משימות צוות 10:** לממש ישירות — אנחנו צוות 10.
- **אופציה V2 (Agents_OS V2):** בנוסף לצ'אט ב-Cursor Composer, Team 10 יכול להפעיל את **V2 Orchestrator** (CLI) לניהול state, ייצור prompts ומנדטים דטרמיניסטיים. ראה `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` — Pipeline Usage Guide, Per-team instructions, ו־Context injection. כשמשתמשים ב-V2, הפקודה `python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_X` מייצרת את הפרומט המלא (4 שכבות); הצוותים מקבלים mandates מ-V2 ולא רק מצ'אט ידני.

---

## 2. מה נדרש מאיתנו (חובות קבועות)

| חובה | פירוט |
|------|--------|
| **סדר משימות וסטטוס** | רשימות רמה 2 מעודכנות: `TEAM_10_MASTER_TASK_LIST.md` + `TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md` + רג'יסטרי (`TEAM_10_LEVEL2_LISTS_REGISTRY.md`). |
| **הפעלת צוותים** | כשיש משימות לצוות — **מיד** מסמך הודעה ייעודי **אל הצוות** עם משימות ברורות, תוצרים נדרשים, ודיווח. חל גם על Team 70 ו-Team 100 לפי רלוונטיות. לא להשאיר צוות בלי הוראות. |
| **הודעות רשמיות** | כל החלטת SSOT, פרסום מדיניות, מנדט, או משנה מצב — **הודעה לכל צוות מושפע**. קבצים ב־`_COMMUNICATION/team_10/` (למשל `TEAM_10_TO_TEAM_20_...`, `TEAM_10_TO_TEAM_60_...`). |
| **משימות צוות 10** | משימות שמוטלות על Gateway (מסמכי SSOT, תיאום, צ'קליסט, Evidence log) — **מממשים ישירות**, לא מעבירים לאחר. |
| **תאום רמות** | תאום מלא בין רמה 1 (מפת הדרכים), רמה 2 (רשימת משימות), רמה 3 (ביצוע צוותים). עדכון מלמטה למעלה כשמתקבלים דוחות. |
| **עדכון WSM** | **חובה:** בכל עדכון שער/פאזה — לעדכן את WSM (בלוק CURRENT_OPERATIONAL_STATE). בעל השער (Gate Owner) מעדכן מיד עם סגירת שער; Team 10 מוודא עדכון WSM כשאנחנו Gate Owner (למשל GATE_3) או מתאם עם בעל השער. מקור: TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0. |
| **ללא מסמכי אישור מיותרים** | אין לייצר מסמכי "אישור קבלה" / "acknowledgment" נפרדים — מבזבז זמן; עדכון רשימות ו־WSM מספיק. |

---

## 3. חלוקת צוותי פיתוח — מקור קנוני

**מקור מחייב (Governance SSOT):** `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`. `.cursorrules` הוא מראה לתפעול כלים בלבד. תוכנית עבודה חייבת להקצות מימוש **לפי תחום** — לא להניח שצוות אחד מכסה את כל המוצר.

| צוות | תפקיד | תחום |
|------|--------|------|
| **20** | Backend Implementation | צד שרת — API, לוגיקה, DB, runtime |
| **30** | Frontend Execution | צד לקוח — קומפוננטות, דפים |
| **40** | UI Assets & Design | עיצוב, Design Tokens, נכסי UI |
| **60** | DevOps & Platform | תשתית, הרצה, CI/CD |

**כלל:** בבניית מסמך ביצוע (EXECUTION_AND_TEAM_PROMPTS) — לקבוע אילו צוותים (20/30/40/60) בסקופ לפי WORK_PACKAGE_DEFINITION ולהפעיל **כל** צוות בסקופ עם מנדט ופרומט; מוצר שלם = Backend + Frontend + UI + תשתית לפי הצורך.

---

## 4. מבנה ארגוני (לזכור)

- **רמה 1:** מפת הדרכים — Team 90 / אדריכל. שלבים, באצ'ים, תלויות.
- **רמה 2:** רשימות משימות מרכזיות — **Team 10 בלבד**. משימות־על, סטטוס, צוות מוביל (Master + Carryover, דרך Registry).
- **רמה 3:** ביצוע — צוותים 20, 30, 31, 40, 50, 60, 70, 90, 100. מנדטים, דוחות, Evidence בתיקיות _COMMUNICATION שלהם.

**צוות 10 = הפילטר הראשון.** לא צינור — תופסים בעיות מהותיות ותאום לפני ביקורת מעמיקה. מודדים את "דופק" המערכת.

---

## 5. כלל ברזל — הודעות לצוותים (ברירת מחדל + יוצאים)

**יש משימות לצוות → מיד הודעה ברורה עם משימות.**

### 5.1 ברירת מחדל — פרומט בבלוק קוד (חוסך קבצים)

- **הודעות לצוותים (20, 30, 40, 50, 60, 70, 90 וכו') — תמיד בפורמט הזה כברירת מחדל:**
  - **לא לייצר קבצים סתם.** להציג את ההודעה **בתוך בלוק קוד** (code block) — בדיוק כמו בקשת GATE_5 לצוות 90: identity header, מטאדאטה, קישורים לכל הארטיפקטים הרלוונטיים, הוראות מדויקות.
  - פורמט קנוני: identity header מלא, from/to, gate_id/work_package_id לפי רלוונטיות, רשימת קישורים (paths) למידע הנחוץ, pass/fail או תוצרים מצופים.
  - **יתרון:** חסכוני, נוח להעתקה־הדבקה לצוות; אין ריבוי קבצים כשהמידע כבר קיים ברפו.
- **חל על כל הצוותים** — 20, 30, 40, 50, 60, 70, 90 — כברירת מחדל.

### 5.2 מתי כן ליצור קובץ

- **רק במצבים שבהם:** (1) נדרש להעביר **מידע רב** (תוכן ארוך שלא רק קישורים), או (2) **נדרשים ארטיפקטים** לפי נוהל (למשל handover ל־QA בשער 4 — מסמך בנתיב קנוני), או (3) צד מקבל או נוהל מחייב מסמך בנתיב מסוים.
- אז מכינים קובץ ומניחים ב־`_COMMUNICATION/team_10/` (או בנתיב המחייב).

### 5.3 סיכום

- **Default:** הודעה = פרומט קנוני **בבלוק קוד**, עם קישורים; לא קובץ.
- **Exception:** קובץ רק כשיש מידע רב להעביר, או ארטיפקט/נתיב מחייב.
- נסחו משימות ותוצרים נדרשים; הצוותים **ממתינים להוראות**. בלי הודעה — אין הוראה.

---

## 6. מסמכים לחיוב

| מסמך | שימוש |
|------|--------|
| 00_MASTER_INDEX.md (root) §Active agent context | עוגן קונטקסט איגנטים — רשימת מסמכים פעילים בלבד |
| TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0 | מיפוי תפקידים (20/30/40/50/60/61/70/90/100/170/190) |
| AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0 | נוהל עבודה ואורקסטרציה פעיל יחיד (כל האיגנטים) |
| PHOENIX_MASTER_WSM_v1.0.0, 04_GATE_MODEL | WSM, Gate Model |
| TEAM_10_MASTER_TASK_LIST_PROTOCOL | נוהל רשימת משימות, היררכיה, הוצאת הודעות (סעיף 1.2.1) |
| TEAM_10_MASTER_TASK_LIST | מטריצת משימות — עדכון שוטף |
| TEAM_10_GATE_ACTIONS_RUNBOOK (קנוני) | פעולות Team 10 לכל שער — מקור יחיד: `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md` |
| TEAM_190_CANONICAL_MESSAGE_FORMAT_LOCK | פורמט הודעות חובה — from/to/cc, identity header, log_entry; `_COMMUNICATION/team_190/TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md` |
| TEAM_10_PROCEDURES_AND_GATE_ACTIONS_UPDATE_REQUIRED | רשימת עדכונים (טופל — רנבוק ונעילה בקנון) |
| TEAM_10_LEVEL2_LISTS_REGISTRY | רשימת כל רשימות רמה 2 + סטטוס ACTIVE/ARCHIVED |
| TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST | רשימת השלמות רמה 2 מפריטים פתוחים במסמכים שעברו ארכוב |
| TEAM_10_PRE_GATE_B_CHECKLIST_* | צ'קליסט לפני הגשת שער ב' (כאשר רלוונטי) |
| `_COMMUNICATION/_Architects_Decisions/` | מקור אמת אדריכלי מחייב (READ ONLY לצוותים) |
| `_COMMUNICATION/_ARCHITECT_INBOX/` | ערוץ הגשות רשמי לאדריכלית |
| `_COMMUNICATION/90_Architects_comunication/` | תקשורת תפעולית מול אדריכלית; לא SSOT |

---

## 7. הגשה ל־QA בשער 4 (GATE_4) — נוהל חובה

**צוות מקבל:** Team 50 (QA). **מקור:** TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0 §4; Gate Model (GATE_4 | QA | Team 50).

**כלל:** אין להניח ש־Team 50 יבצע QA בלי **מסמך handover רשמי** מ־Team 10. ללא המסמך — Team 50 לא מפעיל מחזור QA (לפי TEAM_50_TO_TEAM_10_*_GATE4_QA_HANDOVER_COMPLETION_REQUIREMENTS).

### 7.1 מתי ליצור handover

- **אחרי G3.9:** סגירת GATE_3, הרכבת חבילת יציאה, **מיד** לפני או עם "הגשה ל־GATE_4" — ליצור את מסמך ה־handover ולהניחו בנתיב הקנוני.

### 7.2 שם ומיקום המסמך (חובה)

- **נתיב:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_<work_package_id>_GATE4_QA_HANDOVER.md`  
  דוגמה: `TEAM_10_TO_TEAM_50_S002_P001_WP001_GATE4_QA_HANDOVER.md`

### 7.3 תוכן חובה במסמך ה־handover (צ'קליסט — למניעת חזרות)

| # | רכיב | תיאור |
|---|------|--------|
| 1 | **Identity header** | מלא: roadmap_id, stage_id, program_id, work_package_id, task_id, gate_id=GATE_4, phase_owner=Team 10, required_ssm_version, required_active_stage, project_domain. |
| 2 | **Context** | סיכום: Work Package, סקופ, אילו צוותים ביצעו (למשל 20, 70), מה הושלם, G3.8 pre-check PASS; קריטריון יציאה רלוונטי (למשל LLD400 §2.6). |
| 3 | **Links** | רשימת נתיבים: קוד (agents_os/… או מקביל), תבניות/תיעוד, דוחות השלמה (כל צוות), דוח G3.8. |
| 4 | **Evidence** | תוצאות בדיקות (pytest / runner / אחר): מספר טסטים, PASS; הוראות הרצה לשחזור. |
| 5 | **Test scenarios** | תרחישים מומלצים ל־QA: (1) הרצת pytest; (2) הרצת runner/CLI על ארטיפקט; (3) אימות בידוד דומיין או אחר — לפי סקופ ה־WP. |
| 6 | **Pass criterion** | 0 SEVERE בדוח QA; לאחר PASS — Team 10 מעדכן WSM וממשיך ל־GATE_5. |
| 7 | **Expected deliverable** | נתיב לדוח QA של Team 50 (למשל `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_<work_package_id>_QA_REPORT.md`). |

**פורמט:** לפי TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK — metadata block, Mandatory identity header, סעיפים ברורים.

### 7.4 רפרנס לתבנית מלאה

- **הפניה קבועה:** `_COMMUNICATION/team_10/TEAM_10_GATE4_QA_ACTIVATION_REFERENCE.md` — מגדיר צוות (Team 50), מידע דרוש, ותבנית handover לדוגמה (S002-P001-WP001). בכל Work Package חדש — להתאים את Context, Links, Evidence ו־Test scenarios ל־WP; המבנה והצ'קליסט נשארים קבועים.

### 7.5 דרישת Visionary — 100% ירוק (חובה תמיד)

**אין מעבר לשלב ולידציה (GATE_5) בלי שכל הבדיקות של צוות 50 עוברות ירוק ב־100%.** זו הדרישה בכל תוצאת בדיקה — ללא יוצאים מן הכלל. אם בדוח QA יש כל כישלון (failed checks, לא רק SEVERE) — GATE_4 נשאר פתוח עד לתיקון והרצת QA מחדש עם 100% ירוק.

### 7.6 סדר פעולה (לסיכום)

1. G3.8 pre-check PASS → איסוף דוחות השלמה.
2. G3.9 — סגירת GATE_3; עדכון WSM.
3. **לפני או עם "הגשה ל־GATE_4":** יצירת `TEAM_10_TO_TEAM_50_<WP_ID>_GATE4_QA_HANDOVER.md` עם כל הרכיבים ב־§7.3; הנחה ב־_COMMUNICATION/team_10/.
4. Team 50 מריץ תרחישים ומחזיר דוח QA.
5. **רק אם כל הבדיקות 100% ירוק** — GATE_4 PASS; Team 10 מעדכן WSM וממשיך ל־GATE_5. אחרת — תיקון, re-QA, עד 100% ירוק.

---

**log_entry | TEAM_10 | GATEWAY_ROLE_AND_PROCESS | REFRESHED | 2026-02-13**
**log_entry | TEAM_10 | GATEWAY_ROLE_AND_PROCESS | TEAM_70_100_AND_ARCH_CHANNELS_ALIGNMENT | 2026-02-18**
**log_entry | TEAM_170 | GATEWAY_ROLE_AND_PROCESS | RUNBOOK_ROLE_MAPPING_MESSAGE_LOCK_REF | 2026-02-23**
**log_entry | TEAM_10 | GATEWAY_ROLE_AND_PROCESS | §7_GATE4_QA_HANDOVER_PROCEDURE_ADDED | 2026-02-25**
**log_entry | TEAM_10 | GATEWAY_ROLE_AND_PROCESS | §5_LOCK_DEFAULT_PROMPT_IN_CODE_BLOCK_NO_FILES_UNLESS_NEEDED | 2026-02-25**
