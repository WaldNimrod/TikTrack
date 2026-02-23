# תפקיד צוות 10 (The Gateway) — ניהול תהליך והפעלת צוותים
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)

**id:** `TEAM_10_GATEWAY_ROLE_AND_PROCESS`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **מחייב — רענון תפקיד ונוהל עבודה**  
**last_updated:** 2026-02-23  
**מקורות קנוניים:** Gate Protocol `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`; Runbook `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`; מיפוי צוותים `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`; נעילת פורמט הודעות `_COMMUNICATION/team_190/TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md`.

---

## 1. תפקידנו — בקצרה

**מנצח התזמורת והמתזמן והמתזמר.** צוות 10 = שומרי השערים והסטטוס בכל רגע; הקורדינטור; יוצר התוכנית ואחראי להביאה לסיום ולידציה בצורה האופטימלית והיעילה ביותר — מקבלת האפיון המאושר ועד לסיום QA וולידציה.

- **ניהול התהליך:** שמירת סדר המשימות והסטטוס; **הפעלת הצוותים** — בסדר הנכון, עם המידע הדרוש לביצוע אופטימלי ומדויק.
- **לאחר אישור חבילת עבודה (GATE_3 G3.5 — work-plan validation PASS):** **להוציא את התוכנית לפועל** = להעביר לכל צוות: (1) **קישור לתוכנית המלאה** כקונטקסט, (2) **סדר ביצוע** כולל תלויות ותאומים דרושים, (3) **משימות ספציפיות** לאותו צוות. מסמך מרכזי אחד + פרומט לכל צוות (בבלוק קוד, עם כותרת קנונית) לפי סדר הביצוע.
- **משימות צוותים:** מיד הודעה ברורה עם משימות, תוצרים נדרשים ודיווח. הצוותים ממתינים להוראות מאיתנו.
- **משימות צוות 10:** לממש ישירות — אנחנו צוות 10.

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

## 5. כלל ברזל — הודעות לצוותים

**יש משימות לצוות → מיד הודעה ברורה עם משימות.**

- נסחו משימות ותוצרים נדרשים.
- קבצו במסמך ייעודי **אל הצוות** (למשל `TEAM_10_TO_TEAM_20_...`).
- שמרו ב־`_COMMUNICATION/team_10/`.  
הצוותים **ממתינים להוראות**. בלי הודעה — אין הוראה.

---

## 6. מסמכים לחיוב

| מסמך | שימוש |
|------|--------|
| PHOENIX_MASTER_BIBLE | מבנה ארגוני, עקרונות, אחריות Gateway |
| CURSOR_INTERNAL_PLAYBOOK | נהלי עבודה, תפקידים, תקשורת, ארגון קבצים |
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

**log_entry | TEAM_10 | GATEWAY_ROLE_AND_PROCESS | REFRESHED | 2026-02-13**
**log_entry | TEAM_10 | GATEWAY_ROLE_AND_PROCESS | TEAM_70_100_AND_ARCH_CHANNELS_ALIGNMENT | 2026-02-18**
**log_entry | TEAM_170 | GATEWAY_ROLE_AND_PROCESS | RUNBOOK_ROLE_MAPPING_MESSAGE_LOCK_REF | 2026-02-23**
