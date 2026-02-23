# תמונת מצב רפו Git ותוכנית סדר בית

**תאריך:** 23 פברואר 2026  
**מטרה:** להגיע לרפו עם `main` כגרסה עדכנית ומלאה, ללא שאריות ענפים/תצוגות/משימות ישנות, ולבנות workflows ופרויקט GitHub מסודר בלי לאבד פיתוח.

---

## 1. תמונת מצב נוכחית (מעודכן)

### מי הוא הענף המנצח

- **origin/phoenix-dev** = **הענף עם כל הקוד העדכני.** הענף החשוב, האחרון והמנצח.
- **origin/main** = **ישן מאוד** – גרסת לגסי של הקוד (קומיט אחרון: 19 דצמ׳ 2025, "Bundle Implementation Complete").
- **origin/codex/portfolio-sync-main** = **נוצר הרגע בנסיונות מיזוג** – לא המקור האמיתי; אפשר להתעלם ממנו או למחוק אחרי ש-main מעודכן מ-phoenix-dev.

### ענף נוכחי (מקומי)

- **נמצאים על:** `codex/portfolio-sync-main` או `phoenix-dev` (לפי איפה עובדים)
- **קבצים לא במעקב (untracked):**  
  `.claude/`, `.tmp.driveupload/`, `_COMMUNICATION/`, `api/`,  
  `documentation/docs-governance/` (חלק מהתיקייה – ייתכן שיש קבצים חדשים מקומיים),  
  `scripts/.sync_ticker_prices.lock`, `storage/`

### רמוט (origin) – ענפים ועקבות אחרונים

| ענף | קומיט אחרון | הערה |
|-----|-------------|------|
| **origin/phoenix-dev** | `085ab687e` fix(portfolio): auto-deduplicate... (23 פבר׳ 2026) | **הענף המנצח** – כל הקוד העדכני |
| **origin/main** | `7e8b57440` Merge main branch - Bundle Implementation Complete (19 דצמ׳ 2025) | **ישן מאוד** – גרסת לגסי |
| **origin/codex/portfolio-sync-main** | `f554cd47f` (23 פבר׳ 2026) | נוצר בנסיונות מיזוג – לא המקור |
| **origin/production** | `7e8b57440` | זהה ל-main (לגסי) |
| **origin/code-review-fixes** | `ce4b8eb89` (4 ינו׳ 2026) | ענף ישן |
| **origin/init-loading-manifest-program** | `4bf6591fd` (24 ינו׳ 2026) | ענף ישן |

### מקומיים (ללא רמוט או לא מסונכרנים)

- `claude/friendly-bell` – קומיט: TEAM_190_PORTFOLIO_CANONICALIZATION...
- `phoenix-dev` – קיים מקומית ומסונכרן עם origin (ענף המנצח)

### יחסי ענפים

- **phoenix-dev** מקדים את **main** בהרבה קומיטים (כל היסטוריית הפיתוח מאז דצמ׳ 2025).
- **main** הוא אב קדמון של **phoenix-dev** – אין קומיטים ב-main שאין ב-phoenix-dev, ולכן **עדכון main מ-phoenix-dev לא מאבד שום קוד.**
- **codex/portfolio-sync-main** נוצר בנסיונות מיזוג; המקור האמיתי הוא **phoenix-dev**.

### Workflow קיים

- **קובץ:** `.github/workflows/portfolio-auto-sync.yml`
- **מופעל ב:**  
  - `workflow_dispatch`  
  - Push ל-**default branch** (כרגע `main`)  
  - Push ל-**phoenix-dev**  
  - שינויים בנתיבים: `documentation/docs-governance/...`, `scripts/portfolio/**`, ה-workflow עצמו
- **בעיה:** ה-default branch הוא `main`, וה-main **מפגר**. העבודה האמיתית נמצאת ב-**phoenix-dev**.

---

## 2. מה נדרש – סדר בית יסודי

### יעד

- **main** = גרסה אחת, עדכנית ומלאה = **בדיוק מה שיש ב-phoenix-dev** (הענף המנצח).
- ענפים מיותרים מסומנים/ממולים כך שלא ייצרו בלבון ב-workflows וב-GitHub Projects.
- workflows ו-GitHub Project נשענים על **main**; הפיתוח היום-יומי יכול להמשיך על **phoenix-dev** או לעבור ל-main.

### צעדים מומלצים (בלי לאבד פיתוח)

1. **גיבוי / וידוא**
   - וודא שכל העבודה המקומית ב-**phoenix-dev** דחופה ל-origin (כבר מסונכרן).
   - אופציונלי: צור tag לפני שינוי main, למשל:  
     `git tag archive/pre-cleanup-main-2026-02-23 && git push origin archive/pre-cleanup-main-2026-02-23`

2. **עדכון main מהענף המנצח (phoenix-dev)**
   - **מקור האמת:** `origin/phoenix-dev`.
   - צעדים:
     - `git fetch origin`
     - `git checkout main` (או: `git checkout -b main origin/main` אם אין main מקומי)
     - `git merge origin/phoenix-dev` (אמור להיות fast-forward – main רק מקדם ל-phoenix-dev)
     - `git push origin main`
   - כך **main** יהפוך לגרסה העדכנית והמלאה, וה-workflow ירוץ עליה ב-push ל-main.

3. **החלטה על ענף פיתוח עיקרי**
   - אפשר להמשיך לעבוד על **phoenix-dev** ו periodically למזג ל-main, או לעבור לעבוד ישירות על main.
   - ה-workflow כבר מוגדר לרוץ גם על **phoenix-dev** – אין חובה לשנות.

4. **ניקוי ענפים (אחרי ש-main מעודכן)**
   - **codex/portfolio-sync-main**: נוצר בנסיונות מיזוג – אחרי ש-main מעודכן מ-phoenix-dev, אפשר למחוק מרמוט (`git push origin --delete codex/portfolio-sync-main`) או להשאיר ל-reference.
   - **לא למחוק** עד וידוא: `code-review-fixes`, `init-loading-manifest-program`.
   - **phoenix-dev**: להשאיר – זה הענף המנצח; אפשר להמשיך לפתח עליו ולמזג ל-main.
   - **production**: אם מפרסמים מ-main – לעדכן ל-main אחרי העדכון (`git push origin main:production`) או למחוק אם לא בשימוש.

5. **Workflow**
   - אחרי ש-main מעודכן מ-phoenix-dev, ה-workflow ירוץ על הגרסה הנכונה ב-push ל-main.
   - התנאי הקיים כבר תומך ב-**phoenix-dev** – אין צורך בשינוי.

6. **קבצים untracked**
   - `documentation/docs-governance/` – אם יש קבצים חדשים שחשובים, להוסיף ולדחוף (רצוי מענף phoenix-dev).
   - `.claude/`, `_COMMUNICATION/`, `api/`, `storage/` – להחליט אם להוסיף ל-.gitignore או לכלול ברפו (לפי מדיניות הפרויקט).
   - `scripts/.sync_ticker_prices.lock` – כבר ב-.gitignore.

---

## 3. סיכום פעולות מומלצות (Checklist)

- [ ] גיבוי / tag: `archive/pre-cleanup-main-2026-02-23` (אופציונלי)
- [ ] merge **origin/phoenix-dev** ל-`main` ו-push ל-`origin main` (מקור האמת = phoenix-dev)
- [ ] לוודא ש-GitHub default branch = `main` ושעבודה אחרונה נמצאת ב-main
- [ ] להחליט איזה ענף פעיל ממשיכים (main בלבד או main + phoenix-dev) ולעדכן תיעוד
- [ ] אופציונלי: למחוק את `codex/portfolio-sync-main` מרמוט (נוצר בנסיונות מיזוג)
- [ ] להחליט מה לעשות עם ענפים ישנים (code-review-fixes, init-loading-manifest-program, production) – תיעוד / מחיקה
- [ ] לטפל ב-untracked: docs-governance ושאר התיקיות לפי מדיניות
- [ ] להריץ פעם אחת את ה-workflow (workflow_dispatch) אחרי העדכון ולוודא ש-GitHub Project מתעדכן

---

## 4. פקודות לדוגמה (לאחר וידוא וגיבוי)

**מקור האמת = phoenix-dev. עדכון main ממנו:**

```bash
# עדכון main לגרסה המלאה מהענף המנצח (phoenix-dev)
git fetch origin
git checkout main          # או: git checkout -b main origin/main אם אין main מקומי
git merge origin/phoenix-dev   # אמור להיות fast-forward
git push origin main

# אופציונלי – עדכון production לאותה גרסה
git push origin main:production

# אופציונלי – מחיקת ענף שנוצר בנסיונות מיזוג (רק אחרי ש-main מעודכן)
# git push origin --delete codex/portfolio-sync-main
```

אחרי הצעדים האלה, הרפו יחזיק ב-**main** גרסה עדכנית ומלאה (כמו **phoenix-dev**), ואפשר לבנות מסודר את ה-workflows ופרויקט GitHub בלי לאבד פיתוח.
