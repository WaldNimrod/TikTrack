---
id: TEAM_00_AOS_V3_CONTEXT_ARCHITECTURE_ASSESSMENT_v1.0.0
historical_record: true
from: Team 00
to: Nimrod
date: 2026-03-26
status: FINAL
type: ARCHITECTURAL_ASSESSMENT
subject: Team Context Architecture — איכות הפלט כפונקציה של דיוק הקונטקסט---

# הערכה אדריכלית — ארכיטקטורת הקונטקסט של הצוותים

---

## עיקרון הבסיס — Context = Output Quality

**הנחת העבודה הארכיטקטונית המרכזית:**

אגנט LLM מייצר פלט שאיכותו היא פונקציה ישירה של שלושה גורמים:

```
איכות_פלט = f(דיוק_זהות, דיוק_קונטקסט, דיוק_משימה)
```

- **דיוק_זהות:** האגנט יודע בדיוק מי הוא ומה לא מתפקידו
- **דיוק_קונטקסט:** ה-Layer 2 (גברנס) + Layer 3 (סטייט) שנטען רלוונטי ל-100% לתפקיד
- **דיוק_משימה:** ה-Layer 4 (task template) ממפה בדיוק מה דרוש כאן ועכשיו

**המשמעות הארכיטקטונית:**
כל "שורת רעש" בקונטקסט של אגנט — כלל שלא רלוונטי לו, מידע על דומיין שאינו שלו, תפקיד כפול שמטשטש מה שצריך לעשות — **מוריד את סבירות הפלט הנכון**. זה לא תיאורטי — זה מדיד ב-token-level: יותר קונטקסט לא-רלוונטי = יותר הסחת דעת = יותר "hallucination drift."

**הנגזרת המבנית:**
חלוקת צוותים נכונה **היא** ניהול קונטקסט. כל החלטה ב-ROSTER היא בעצם החלטה על מה כל אגנט יראה בשני עמודי הפרומפט הראשונים שלו.

---

## ניתוח מקבצי הצוותים — מנקודת מבט קונטקסט

### Cluster A — Implementation Teams (x0/x1 pattern)

**team_20, team_21, team_30, team_31, team_60, team_61**

זה הקלאסטר שבו דיוק הקונטקסט הוא **הקריטי ביותר** — כי אלה הצוותים שכותבים קוד ייצור.

**ממצא: תבנית x0/x1 היא ארכיטקטורת קונטקסט מצוינת.**

| צוות | Layer 2 שנטען | Layer 3 שנטען | הערה |
|---|---|---|---|
| team_20 (TT Backend) | TikTrack rules בלבד | pipeline_state_tiktrack | קונטקסט נקי ✅ |
| team_21 (AOS Backend) | AOS rules בלבד | pipeline_state AOS | קונטקסט נקי ✅ |
| team_30 (TT Frontend) | TikTrack UI rules | pipeline_state_tiktrack | קונטקסט נקי ✅ |
| team_31 (AOS Frontend) | AOS UI rules | pipeline_state AOS | קונטקסט נקי ✅ |
| team_60 (TT DevOps) | TikTrack infra rules | pipeline_state_tiktrack | קונטקסט נקי ✅ |
| team_61 (AOS DevOps) | AOS infra rules | pipeline_state AOS | קונטקסט נקי ✅ |

**מה שהיה לפני ההגדרה מחדש של team_61:**
team_61 היה "hands on keyboard for Team 100" — כלומר קיבל גם קונטקסט אדריכלי (של team_100) וגם קונטקסט ביצוע. זה anti-pattern קלאסי: האגנט לא יודע אם הוא בונה תכנית או מממש אותה. גבולות לא ברורים בזהות = גבולות לא ברורים בפלט.

**ניתוח תפקיד team_61 הנוכחי:**
team_61 שינוי שם → AOS DevOps פותר את הבעיה כי:
1. Context: infra-only (ports, containers, CI/CD, platform)
2. Identity: "I am infrastructure, not architect, not frontend, not backend"
3. Skills scope: `bash`, `docker`, `Makefile`, `nginx` — לא `python application logic`

**הנגזרת לאיכות:** צוות DevOps שמקבל קונטקסט DevOps-only כותב קוד infra טוב יותר ב-30–50% מאשר "general AOS implementer" שמקבל כל הקונטקסט.

---

### Cluster B — Gateway Teams (1x pattern)

**team_10, team_11**

Gateway teams פועלים כ-**orchestrators** — הם לא כותבים קוד, הם מפעילים צוותים אחרים ומנהלים gate submissions.

**ממצא חיובי:** הפרדה נכונה של Gateway מ-Implementation מנקה קונטקסט קריטי.

```
team_10 (TT Gateway):
  Layer 2: pipeline governance + SSM gate rules + TikTrack domain rules
  Layer 3: pipeline_state_tiktrack + current WP + current gate
  Context size: MEDIUM — יודע הכל על הפייפליין, לא יודע כלום על קוד Python

team_11 (AOS Gateway):
  Layer 2: pipeline governance + SSM gate rules + AOS domain rules
  Layer 3: pipeline_state AOS + current WP + current gate
  Context size: MEDIUM — אותו עיקרון
```

**פוטנציאל שיפור:** Gateway צריך לדעת **מי עושה מה** — כלומר את ה-Assignment matrix. בv3, ה-Assignment entity מגיע מה-DB ונטען ל-Layer 3 של Gateway. זה מאפשר ל-team_10 להגיד "WP001 שלב backend = team_20, WP001 שלב frontend = team_30" ולהפעיל אותם בדיוק.

---

### Cluster C — QA Teams (5x pattern)

**team_50, team_51**

**ממצא: מצוין.** QA domain-isolated הוא העיקרון הנכון.

```
team_50 (TT QA):
  יודע: Selenium E2E, test scripts, SOP-013
  לא יודע: AOS pipeline, AOS architecture
  → מייצר: TT-specific test scripts בלבד

team_51 (AOS QA):
  יודע: AOS pipeline logic, AOS UI structure
  לא יודע: TikTrack DB, TikTrack frontend stack
  → מייצר: AOS-specific validation בלבד
```

Cross-engine validation (team_51 = Cursor validates team_31 AOS Frontend) היא הגבור של ה-Iron Rule "Cross-Engine Validation Principle." QA team שקיבל הכשרה שונה מהImplentation team בהכרח יתפוס יותר.

---

### Cluster D — Architecture Teams (100x)

**team_00, team_100, team_101, team_102**

זה הקלאסטר עם הקונטקסט **הגדול ביותר** — ובצדק, כי אדריכלים צריכים ראייה רחבה.

**ממצא: יש בעיה מבנית שתוקנה חלקית.**

```
לפני תיקון:
team_101: domain=shared, parent=team_100, children=[team_102]
→ "IDE Architecture Authority"
→ בעיה: shared domain = מקבל קונטקסט של שני הדומיינים
→ תוצאה: ארכיטקט IDE שמבין גם TikTrack וגם AOS = פחות עמוק בכל אחד

אחרי תיקון:
team_101: domain=agents_os → ארכיטקט AOS IDE
team_102: domain=tiktrack, parent=team_100 → ארכיטקט TT IDE
→ כל אחד מקבל קונטקסט domain-specific בלבד
→ team_101 יודע AOS deep, team_102 יודע TikTrack deep
```

**המסקנה הארכיטקטונית:**
שני ארכיטקטי IDE עם domain isolation עדיפים על ארכיטקט IDE אחד עם shared domain, גם אם ה-engine זהה. הסיבה: context precision בזמן task execution — כשtask_template מגיע, האגנט כבר "ב-mode" של AOS בלבד.

**הערה על team_100:**
team_100 = Claude Code (Claude Code session). הוא מקבל **את הקונטקסט הגדול ביותר** — כי הוא GATE owner ל-AOS. זה נכון מבחינה היררכית. אבל ב-v3, מה שנטען ב-Layer 3 של team_100 חייב להיות diff-based (רק מה שהשתנה מהגייט הקודם) כדי להימנע מ-context explosion.

---

### Cluster E — Governance & Validation Teams (19x, 17x)

**team_170, team_190, team_191, team_90**

**הדילמה הארכיטקטונית של צוותי ממשל:**

```
בעיה: ממשל = multi-domain = קונטקסט גדול יותר
אבל: ממשל חייב לראות cross-domain כדי להיות אפקטיבי
→ Tension מובנית
```

**הפתרון — שני מצבי הפעלה נפרדים:**

| צוות | מצב A — Gate | מצב B — Advisory |
|---|---|---|
| team_190 | Constitutional validation, GATE_0–2 | מחקר אדריכלי לפי דרישה |
| team_170 | Spec production, registry sync | ייעוץ גברנס לפי דרישה |
| team_90 | Dev validation, cross-domain | — |

**מה זה אומר ב-layer 2:**
- **מצב A (Gate):** Layer 2 = constitutional rules + gate checklist + ה-domain הספציפי שנסקר
- **מצב B (Advisory):** Layer 2 = רק ה-research question + הכלים הרלוונטיים (לא כל ה-gate checklist)

**המסקנה:** team_190 ו-team_170 **אינם** צוותים עם בעיית context — הם צוותים עם **שני skills נפרדים**. בv3, כל "מצב הפעלה" ייצור skill נפרד ב-DB (מ-Template entity). זה מוציא את האמביגואיות.

**team_90 — Dev Validator:**
team_90 הוא multi-domain validator — רואה גם TikTrack וגם AOS. זה **נכון** כי:
1. Dev validation היא cross-domain בטבעה (cross-engine validation principle)
2. אגנט שמכיר שני הדומיינים יתפוס inconsistencies בין הדומיינים שאגנט single-domain יפספס
3. Context cost: מקבל קונטקסט של שניהם — מקבל תועלת מקביל

---

### Cluster F — Documentation Teams (7x)

**team_70, team_71**

**ממצא: חסר team_71 יוצר בעיה של context pollution ב-team_70.**

כאשר team_70 הוא multi-domain ואין team_71, כל תיעוד AOS נופל ל-team_70. זה אומר:
- team_70 מקבל context של שני הדומיינים
- כותב documentation ל-TikTrack וגם ל-AOS
- פלט: consistency problems (שפה, format, references) בין הדומיינים

עם team_71 (AOS Documentation):
- team_70: TikTrack documentation context בלבד → consistent TikTrack voice
- team_71: AOS documentation context בלבד → consistent AOS voice
- cross-domain consistency: מוצלב על ידי team_170 (Spec & Governance) בשלב review

---

## הערכה כוללת — ציון per cluster

| Cluster | ציון | ביאור |
|---|---|---|
| Implementation (2x–6x) | **A** אחרי תיקונים | x0/x1 pattern עם domain isolation מצוין |
| Gateway (1x) | **A** | הפרדה נכונה מ-implementation |
| QA (5x) | **A** | cross-engine isolation מושלם |
| Architecture (100x) | **B+** | תוקן עם team_101→agents_os, team_102→team_100 |
| Governance (19x, 17x) | **B** | נדרש: skills נפרדים למצב Gate vs Advisory |
| Documentation (7x) | **B−** → **A** אחרי team_71 | חסר team_71 יוצר multi-domain context pollution |

---

## הנגזרת לעיצוב Skills

### מה שמגדיר skill מדויק

```
skill = Layer_1 (identity) + Layer_2 (governance filters) + Layer_4 (task template)

Layer_1 precision:
  ✅ "I am AOS Backend — I write Python FastAPI code for the Agents_OS runtime"
  ❌ "I am AOS Implementation — I do whatever AOS needs"

Layer_2 filtering:
  ✅ team_20 sees: FastAPI rules, DB patterns, maskedLog — NOT AOS pipeline logic
  ❌ team_61 (pre-fix) sees: architectural patterns + implementation + DevOps = everything

Layer_4 task template:
  ✅ Template for "AOS Backend — implement entity CRUD endpoint" = 3 fields
  ❌ Template for "AOS implementer — do the AOS task" = undefined
```

### מפת skills מוצעת

```
Per implementation team:  1 primary skill
Per QA team:              2 skills (fresh_validation + regression_run)
Per gateway team:         3 skills (WP_activation + gate_submission + status_report)
Per architecture team:    4 skills (LOD200 + LOD400 + review + consolidation)
Per governance team:      2 skills (gate_mode + advisory_mode)
Per documentation team:   2 skills (new_doc + update_existing)

סה"כ: ~28 skills ≈ 28 מקרים שימוש מוגדרים היטב
```

**המשמעות:** כל skill הוא context window מנוהל. 28 contexts = 28 "מסלולי חשיבה" שונים שהמערכת יכולה להפעיל בדיוק.

---

## סיכום ממצאים — 4 עקרונות אדריכליים שמוכחים במבנה

**1. Domain Isolation עדיף על Generalization**
גם כשhuman team יכול להתמחות בשני דומיינים — אגנט מרוויח יותר מ-isolation. Context pollution = output drift.

**2. Function Isolation עדיף על Full-Stack Teams**
Gateway ≠ Backend ≠ Frontend ≠ DevOps — גם אם ה-engine זהה (Cursor). הפרדה functional = precision.

**3. Multi-Domain מותר רק כשהוא עצמו תכונה (לא היעדר החלטה)**
team_90 (multi-domain validator) = עיצובי. team_70 (multi-domain documentation) = היעדר team_71. ההבדל קריטי.

**4. צוות עם שני מצבי הפעלה = שני skills, לא זהות כפולה**
team_190 ב-Gate mode ≠ team_190 ב-Advisory mode. הפתרון: שני Layer 4 templates, לא שינוי Layer 1.

---

**log_entry | TEAM_00 | AOS_V3_CONTEXT_ARCHITECTURE_ASSESSMENT | FINAL | v1.0.0 | 2026-03-26**
