# Team 170 — נוהל עבודה פנימי (מחייב)
**project_domain:** TIKTRACK / AGENTS_OS

**id:** TEAM_170_INTERNAL_WORK_PROCEDURE  
**owner:** Team 170 (Specification Engineering / SSOT Authority)  
**status:** 🔒 **מחייב** — נוהל עבודה פנימי צוות 170  
**last_updated:** 2026-02-26  
**מקור:** הנחיית אדריכלית — אפין אדריכלים; תפקיד צוות 170 ליישור, תאימות, הפקת Program קנוני והגשה לולידציה.

---

## 0. הקשר

האדריכלים נותנים **אפין** (brief) והגדרות עקרוניות; הם **לא יושבים על הקבצים ועל סביבת העבודה** ולכן לא תמיד מעודכנים בדיוקים. תפקיד צוות 170: לשמר במלואו את **הדרישות וההגדרות האדריכליות**, ובה parallel ליישר לסטנדרטים, לבדוק תאימות, ולהפוך את התוכנית העקרונית ל־**Program קנוני ומדויק** עם **אפיון מפורט** ולהעביר לולידציה (צוות 190).

---

## 1. תפקיד צוות 170 — ארבעת המחויבויות העיקריות

| # | מחויבות | תיאור |
|---|---------|--------|
| 1 | **עדכון קבצים להתאמה לסטנדרטים** | עדכון הקבצים (תבניות, אפיון, תיעוד) להתאמה מלאה לסטנדרטים ולנוהלי השערים — **תוך שימור מלא** של הדרישות וההגדרות האדריכליות. אין לשנות כוונה אדריכלית; רק ליישר פורמט, מספור, הפניות, וטרמינולוגיה. |
| 2 | **בדיקת תאימות ואינטגרציה** | בדיקה מדויקת של תאימות ואינטגרציה ל:**קוד קיים**, **תיעוד קיים**, **תוכניות אחריות** (שבוצעו או מתוכננות). במידה שמתגלים **חורים, התנגשויות, בעיות או שאלות** — **להעלות להחלטת האדריכלית** (דרך Team 10 / ערוץ אדריכלי). לא להשלים מעצמנו. |
| 3 | **הפיכה ל־Program קנוני ואפיון מפורט** | לאחר שיש **מידע שלם** — הפיכת התוכנית העקרונית של האדריכלית ל־**Program קנוני ומדויק** וייצור **אפיון מפורט ביותר** (כולל LLD400 כנדרש), בהתאם להיררכיה ולמספור (04_GATE_MODEL_PROTOCOL, SSM, WSM). |
| 4 | **הגשה לולידציה צוות 190** | את **האפיון והתיעוד** להגיש **לולידציה של צוות 190**. **החבילה המוגשת חייבת להיות סופית ומלאה** — לא טיוטה: LLD400 (או אפיון ברמת WP) מוכן לולידציה, הערות WSM/SSM מעודכנות למצב קנוני בזמן ההגשה, בקשת ולידציה פורמלית. אין הגשה ישירה לאדריכל לפני PASS של צוות 190 אלא לפי נוהל. |

---

## 2. דרישות לפי שער (Gate) — תפקיד צוות 170

**מקור:** 04_GATE_MODEL_PROTOCOL_v2.3.0; GATE_0_GATE_1_CANONICAL_DESIGN_GATES_LOCK.

| gate_id | תפקיד צוות 170 | דרישות מחייבות |
|---------|----------------|-----------------|
| **GATE_0** | STRUCTURAL_FEASIBILITY — Team 190 authority. | צוות 170: תמיכה בתיעוד/מבנה כפי שנדרש על ידי Team 190; אין אישור אדריכלי מצד 170. |
| **GATE_1** | ARCHITECTURAL_DECISION_LOCK (LOD 400) — Team 190 (validation), **Team 170 (documentation registry enforcement)**. | צוות 170: **מחזיק מקורות (originals)**; מפיק אפיון LLD400/Program או LLD400 ברמת WP (לפי הפעלה); מוודא יישור לסטנדרטים ולטרמינולוגיה הקנונית (למשל G3.5 within GATE_3 — לא PRE_GATE_3); בודק תאימות; **מגיש חבילה סופית ומלאה** ל־Team 190 (LLD400 + WSM_ALIGNMENT_NOTE + SSM_IMPACT_NOTE + SPEC_READY + בקשת ולידציה). אין יצירת Work Package; אין פתיחת GATE_3; אין שינוי SSM/WSM בלי הצדקה פורמלית. |
| **GATE_2** | KNOWLEDGE_PROMOTION — Team 70 (Executor). | צוות 170: **לא** מבצע קידום; Team 70 בלבד. צוות 170 מספק תוכן/מבנה כפי שנדרש לקדם. |
| **GATE_3 … GATE_8** | ביצוע / QA / ולידציה / אדריכלי / UX / סגירת תיעוד. | צוות 170: לא בעל השער; תומך בתיעוד ובמבנה קנוני לפי הנחיות Team 10 / Gate Owner. |

---

## 3. שלבי עבודה מפורטים — שלב GATE_1 (SPEC / LLD400)

כאשר מתקבל **אפין אדריכלים** (למשל Concept Package או הפעלה ל־LLD400):

| שלב | פעולה | תוצר / קריטריון |
|-----|--------|-------------------|
| **3.1** | **עדכון קבצים להתאמה לסטנדרטים** | כל הקבצים הרלוונטיים (תבניות, אפיון, Identity Header) מעודכנים לסטנדרטים: 04_GATE, SSM/WSM, תבניות קנוניות, טרמינולוגיה (Stage/Program/Work Package/Task). **שימור מלא** של הדרישות וההגדרות האדריכליות. |
| **3.2** | **בדיקת תאימות ואינטגרציה** | סריקה מול: קוד קיים, תיעוד קיים (documentation/, _COMMUNICATION/), מפת דרכים, WSM/SSM, תוכניות אחריות (Master Task List, תוכניות צוותים). תיעוד ממצאים: חורים, התנגשויות, שאלות. **העלאה להחלטת אדריכלית** לכל פריט שדורש החלטה. |
| **3.3** | **הפיכה ל־Program קנוני + אפיון מפורט** | רק לאחר שיש **מידע שלם** (כולל תשובות להעלאות לאדריכלית): הפקת מסמך Program קנוני (מספור S-P-WP תואם WSM/SSM); אפיון מפורט (LLD400) לפי התבנית הקנונית; WSM_ALIGNMENT_NOTE, SSM_IMPACT_NOTE. |
| **3.4** | **הגשה לולידציה צוות 190** | הגשת **חבילה סופית** (לא טיוטה): LLD400 מלא, WSM_ALIGNMENT_NOTE (משקף CURRENT_OPERATIONAL_STATE קנוני בזמן ההגשה), SSM_IMPACT_NOTE, SPEC_SUBMISSION_PACKAGE_READY_NOTE, ובקשת ולידציה פורמלית (TEAM_170_TO_TEAM_190_..._VALIDATION_REQUEST). הגשה ל־Team 190 דרך ערוץ 170↔190; המתנה ל־PASS; טיפול בממצאים חוסמים. רק אחרי PASS — Team 190 מכין חבילת SPEC approval submission (לפי נוהל); אין הגשה ישירה לאדריכל לפני PASS. |

---

## 4. דרישות לכל שלב עבודה (כללי)

- **אין השלמה מפרשנות עצמאית:** פערים = סימון והעלאה להחלטה.
- **כל שינוי מבוסס מקור:** מתועד, ניתן לאימות, עם רפרנס לסטנדרט/אדריכל.
- **תיעוד ממצאים:** חורים, התנגשויות ושאלות — במסמך מסודר (למשל RISK_REGISTER, OPEN_QUESTIONS) והעלאה ל־Team 10/אדריכלית.
- **חוזה הגשה עם צוות 190:** לפי `TEAM_170_SUBMISSION_ORIGINALS_AND_190_CONTRACT_PROCEDURE_v1.0.0.md` — צוות 170 מחזיק originals; צוות 190 בעל חבילת ההגשה.

---

## 5. רפרנסים

| מסמך | שימוש |
|------|--------|
| `documentation/docs-governance/AGENTS_OS_GOVERNANCE/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` | נוהל שערים; תפקיד 170 ב־GATE_1; **§4.1** — דיוק תהליך GATE_1 ו־LLD400 (אושר אדריכלית). |
| `documentation/docs-governance/AGENTS_OS_GOVERNANCE/01-FOUNDATIONS/GATE_0_GATE_1_CANONICAL_DESIGN_GATES_LOCK.md` | נעילת GATE_0/GATE_1. |
| `_COMMUNICATION/team_170/TEAM_170_SUBMISSION_ORIGINALS_AND_190_CONTRACT_PROCEDURE_v1.0.0.md` | נוהל מקורות והגשה ל־190. |
| `_COMMUNICATION/team_170/TEAM_170_GATE_1_ROLE_PRECISION_PROPOSAL_FOR_GOVERNANCE.md` | הצעת דיוק תפקיד GATE_1 לנוהל השערים (להכללה בקנון). |
| `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_ACTIVATION_AGENTS_OS_PHASE_1_LLD400_v1.0.0.md` | מנדט הפעלה ל־LLD400; מבנה חובה, deliverables, איסורים. |
| `_COMMUNICATION/team_100/AGENTS_OS_GATE_1_PROGRAM_LAYER_LLD400_TEMPLATE_v1.2.0.md` | תבנית קנונית למסמך LLD400 ברמת Program. |
| `00_MASTER_INDEX.md` — "Stage / Program / Work Package / Task — Where to read" | מיקום WSM, SSM, רשימות, מפת דרכים. |
| `documentation/docs-governance/04-PROCEDURES/KNOWN_BUGS_REMEDIATION_GOVERNANCE_PROCEDURE_v1.0.0.md` | נוהל קנוני לבאגים מאומתים: intake, routing, closure, IMMEDIATE/BATCHED. |
| `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` | רג'יסטר קנוני יחיד לבאגים מאומתים — תחזוקה צוות 170. |

---

**log_entry | TEAM_170 | INTERNAL_WORK_PROCEDURE | MANDATORY_ADOPTED | 2026-02-26**
**log_entry | TEAM_170 | INTERNAL_WORK_PROCEDURE | KNOWN_BUGS_GOVERNANCE_REFERENCES_ADDED | 2026-03-03**
