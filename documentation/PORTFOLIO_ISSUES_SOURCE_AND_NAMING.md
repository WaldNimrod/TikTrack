# מאיפה מגיעים ה-Issues ואיך נוצרים השמות

**מטרה:** להבהיר על איזה מידע מתבססים ה-Issues והמבנה, ולמה הכותרות והתוויות נראות מסובכות.

---

## 1. מקור המידע — רק מהקבצים שהגדרת

ה-workflow **לא** ממציא שום דבר. הוא קורא **רק** משלושה קבצי SSOT (מקור אמת אחד) שכבר קיימים אצלך:

| קובץ | מה יש בו (טבלה) | מה נוצר מזה |
|------|------------------|-------------|
| **PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md** | טבלת **Stages**: `stage_id`, `stage_name`, `planned_scope`, `status` | **Issue אחד לכל שורה** = כרטיס לכל שלב |
| **PHOENIX_PROGRAM_REGISTRY_v1.0.0.md** | טבלת **Programs**: `program_id`, `program_name`, `domain`, `stage_id`, `status`, `current_gate_mirror` | **Issue אחד לכל שורה** = כרטיס לכל תוכנית |
| **PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md** | טבלת **Work Packages**: `work_package_id`, `program_id`, `status`, `current_gate`, `is_active`, `active_marker_reason` | **Issue אחד לכל שורה** = כרטיס לכל חבילת עבודה |

בנוסף: **PHOENIX_MASTER_WSM** — ממנו נלקח **כרטיס Runtime אחד** (מצב נוכחי: איזה שלב/תוכנית/WP פעילים).

**סיכום:** כל שורה בטבלאות שלך → Issue אחד. אין יצירה "מהאוויר".

---

## 2. איך נראות כותרות ה-Issues היום (ולמה זה נראה מסובך)

הקוד כרגע **מוסיף** לתחילת כל כותרת קידומת טכנית כדי ש-GitHub יוכל למיין/לסנן. השדות **מההגדרות שלך** (stage_name, program_name וכו') כן מופיעים — אבל אחרי הקידומת.

### שלב (Stage)

- **מקור:** טבלת Stages ב־`PHOENIX_PORTFOLIO_ROADMAP` — עמודות `stage_id`, `stage_name`, `status`.
- **כותרת נוכחית:**  
  `[P01][STAGE] S001 | שלב 1 — Foundations Sealed | ACTIVE`
- **פירוק:**
  - `[P01]` — מספר סדר (למיון)
  - `[STAGE]` — סוג (שלב)
  - `S001` — ה-`stage_id` מהטבלה
  - `שלב 1 — Foundations Sealed` — **ה-`stage_name` שהגדרת**
  - `ACTIVE` — ה-`status` מהטבלה

### תוכנית (Program)

- **מקור:** טבלת Programs ב־`PHOENIX_PROGRAM_REGISTRY` — `program_id`, `program_name`, `domain`, `stage_id`, `status`.
- **כותרת נוכחית:**  
  `[P01.02][PROGRAM] S001-P001 | Agents_OS Phase 1 | COMPLETE`
- **פירוק:**
  - `[P01.02]` — סדר היררכי (שלב 1, תוכנית 2)
  - `[PROGRAM]` — סוג (תוכנית)
  - `S001-P001` — ה-`program_id` מהטבלה
  - `Agents_OS Phase 1` — **ה-`program_name` שהגדרת**
  - `COMPLETE` — ה-`status` מהטבלה

### חבילת עבודה (Work Package)

- **מקור:** טבלת Work Packages ב־`PHOENIX_WORK_PACKAGE_REGISTRY` — `work_package_id`, `program_id`, `status`, `current_gate`.
- **כותרת נוכחית:**  
  `[P01.02.001][WP] S001-P001-WP001 | CLOSED | GATE_8 (PASS)`
- **פירוק:**
  - `[P01.02.001]` — סדר (שלב.תוכנית.WP)
  - `[WP]` — סוג (חבילת עבודה)
  - `S001-P001-WP001` — ה-`work_package_id` מהטבלה
  - ברגיסטרי **אין** שדה "שם" ל-WP — לכן מופיעים רק `status` ו-`current_gate`.

---

## 3. התוויות (Labels) — למה יש כל כך הרבה ואיך הן נראות

התוויות משמשות ב-GitHub **לסינון ולקיבוץ** (למשל בפרויקט). חלק מהשמות ארוכים/טכניים:

| תווית (דוגמאות) | תפקיד |
|------------------|--------|
| `portfolio-pipeline` | כל ה-Issues שמנוהלים על ידי ה-workflow |
| `portfolio-stage`, `portfolio-program`, `portfolio-work-package` | סוג: שלב / תוכנית / חבילת עבודה |
| `portfolio-domain-SHARED` / `portfolio-domain-TIKTRACK` / `portfolio-domain-AGENTS_OS` | דומיין (שלב משותף = SHARED) |
| `portfolio-parent-stage-S001` | שיוך לשלב (לצורך "תחת איזה שלב") |
| `portfolio-parent-program-S001-P001` | שיוך לתוכנית (לצורך "תחת איזה תוכנית") |
| `portfolio-status-active`, `portfolio-status-closed` וכו' | סטטוס |

אפשר בהחלט **לקצר** חלק מהשמות (למשל `domain-TIKTRACK` במקום `portfolio-domain-TIKTRACK`) אם תרצה — זה שינוי בקוד בלבד.

---

## 4. כותרות פשוטות (מיושם)

- **שלב:** כותרת = `stage_name` מהקנון (למשל "שלב 1 — Foundations Sealed").
- **תוכנית:** כותרת = `program_name` (למשל "Agents_OS Phase 1").
- **חבילת עבודה:** כותרת = `work_package_id` (למשל "S001-P001-WP001").
- **Runtime:** כותרת = "Runtime — {current_gate}".

המיון וההיררכיה נשמרים ב-body ובתוויות (parent-stage-*, parent-program-*).

## 5. נושאים שלא בקנון — ממתין לסיווג

נושאים שהמערכת מאתרת (יש להם תווית portfolio-pipeline) אבל **אינם מופיעים** ב-Roadmap / Program Registry / WP Registry:

- **לא נסגרים** — נשארים פתוחים.
- מקבלים כותרת: "ממתין לסיווג — {כותרת קיימת}".
- תוויות: `portfolio-pipeline`, `portfolio-awaiting-classification`, `portfolio-parent-stage-UNCLASSIFIED`.
- body: "סטטוס: ממתין לסיווג. נושא זה אינו מופיע בקנון ויוקצה לשלב לאחר סיווג."

כך הם מופיעים תחת "שלב" וירטואלי (UNCLASSIFIED) עד שיסווגו כתוכנית או חבילת עבודה תחת שלב קיים.

## 6. תוויות — רק מהקנון, ניקוי רפו

- בכל עדכון לנושא, **מוחלפות** כל התוויות לרשימת הקנון בלבד (תגיות מניסויים מוסרות).
- **ניקוי תוויות ברפו:** הרצה עם `--clean-repo-labels` מוחקת מכל הרפו כל תווית `portfolio-*` שאינה בקנון. מומלץ להריץ פעם אחת אחרי מעבר להגדרות החדשות.

### איפה להריץ את הניקוי (כולל `--clean-repo-labels`)

**אפשרות א — ב-GitHub Actions (מומלץ):**

1. Actions → **Portfolio Auto Sync** → **Run workflow**
2. להשאיר **sync_scope:** full, **close_stale:** true
3. לסמן **clean_repo_labels:** **true**
4. Run workflow — ה-workflow יבנה את ה-snapshot, יסנכרן Issues וימחק תוויות מיותרות מהרפו

**אפשרות ב — מקומית (משורת הפקודה):**

1. מתוך שורש הרפו (היכן ש־`scripts/` ו־`documentation/`):
   ```bash
   # 1. לבנות snapshot (נדרש לפני sync)
   python scripts/portfolio/build_portfolio_snapshot.py --check \
     --out-json portfolio_project/portfolio_snapshot.json \
     --out-md portfolio_project/portfolio_snapshot.md

   # 2. סנכרון + ניקוי תוויות (דורש GITHUB_TOKEN ו-GITHUB_REPOSITORY)
   export GITHUB_TOKEN="<הטוקן שלך>"
   export GITHUB_REPOSITORY="owner/repo"   # למשל WaldNimrod/TikTrack
   python scripts/portfolio/sync_github_portfolio_issues.py \
     --snapshot portfolio_project/portfolio_snapshot.json \
     --scope full --close-stale --clean-repo-labels
   ```
2. `GITHUB_TOKEN`: Personal Access Token עם scope `repo` (או לפחות `public_repo` לרפו ציבורי).

---

## 7. סיכום

- **מקור:** רק הטבלאות ב־Roadmap, Program Registry ו־Work Package Registry (והמצב הנוכחי מ-WSM).
- **כותרת נוכחית:** = קידומת טכנית (למיון/סינון) + **השדות שהגדרת** (stage_name, program_name, id, status וכו').
- **תוויות:** משמשות לסינון ולהיררכיה ב-GitHub; השמות ארוכים — אפשר לקצר בהתאם להחלטה.

אם תגיד איך אתה **מעדיף** לראות את הכותרות (למשל "רק השם מהטבלה" או "id + שם"), אפשר להתאים את הקוד בהתאם.
