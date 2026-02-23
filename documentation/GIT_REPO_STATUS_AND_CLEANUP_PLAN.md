# תמונת מצב רפו Git ותוכנית סדר בית

**תאריך:** 23 פברואר 2026  
**מטרה:** להגיע לרפו עם `main` כגרסה עדכנית ומלאה, ללא שאריות ענפים/תצוגות/משימות ישנות, ולבנות workflows ופרויקט GitHub מסודר בלי לאבד פיתוח.

---

## ✅ בוצע – סדר בית (23 פברואר 2026)

- **מקור האמת:** הקבצים המקומיים + **phoenix-dev** היו העדכניים ביותר; כל העבודה בוצעה מול phoenix-dev.
- **מה בוצע:**
  1. **main** עודכן ל־**phoenix-dev** (`git reset --hard origin/phoenix-dev` על main, ואז `git push origin main --force`). main מצביע כעת על אותו קומיט כמו phoenix-dev (כל הקוד העדכני).
  2. **production** עודכן לאותה גרסה: `git push origin main:production --force`.
  3. **codex/portfolio-sync-main** נמחק מרמוט (נוצר בנסיונות מיזוג, לא מקור אמת).

### מעכשיו – עבודה מול main בלבד

- **כל העבודה מעכשיו מתבצעת מול ענף `main`.**
- ב-GitHub: להמשיך להגדיר את **main** כ-default branch.
- פיתוח: לעבוד על **main** (checkout main, commit, push origin main).

### ענפים – סגורים / לא פעילים

| ענף | סטטוס |
|-----|--------|
| **origin/main** | **פעיל** – הענף הראשי. כל העבודה מעכשיו ממולו. |
| **origin/production** | מסונכרן ל-main (עדכון בוצע). שימוש לפי צורך פריסה. |
| **origin/phoenix-dev** | **סגור** – היה הענף המנצח; main עודכן ממנו. לא לפתח עליו. |
| **origin/codex/portfolio-sync-main** | **נמחק** – נוצר בנסיונות מיזוג. |
| **origin/code-review-fixes** | **סגור** – ענף ישן. |
| **origin/init-loading-manifest-program** | **סגור** – ענף ישן. |

---

## 1. תמונת מצב (לפני הביצוע – לארכיון)

### מי היה הענף המנצח (לפני העדכון)

- **phoenix-dev + הקבצים המקומיים** = העדכניים ביותר; כל העבודה בוצעה מול phoenix-dev.
- **origin/main** היה ישן (גרסת לגסי).
- **origin/codex/portfolio-sync-main** נוצר בנסיונות מיזוג – נמחק.

### Workflow קיים

- **קובץ:** `.github/workflows/portfolio-auto-sync.yml`
- **מופעל ב:** `workflow_dispatch`, Push ל-**default branch (main)**, Push ל-**phoenix-dev**, ושינויים בנתיבים רלוונטיים.
- **מעכשיו:** Push ל-main מריץ את ה-workflow על הגרסה העדכנית.

---

## 2. המלצות המשך

- **עבודה יומיומית:** `git checkout main`, עריכות, `git add` / `git commit` / `git push origin main`.
- **ב-GitHub:** לוודא ש-default branch = **main**.
- **קבצים untracked:** להחליט לגבי `documentation/docs-governance/`, `_COMMUNICATION/`, `api/`, `storage/` – להוסיף ל-.gitignore או לכלול ברפו ולדחוף ל-main.
- **Workflow:** להריץ פעם אחת `workflow_dispatch` ל-portfolio-auto-sync ולוודא ש-GitHub Project מתעדכן.

---

## 3. פקודות עבודה מעכשיו (main בלבד)

```bash
git checkout main
git pull origin main
# ... עריכה ...
git add .
git commit -m "תיאור השינוי"
git push origin main
```
