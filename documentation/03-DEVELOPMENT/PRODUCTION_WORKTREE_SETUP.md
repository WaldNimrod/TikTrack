# TikTrack Production Worktree Setup - מדריך עבודה

**תאריך:** 2025-11-09  
**גרסה:** 0.1.0  
**מטרה:** הקמה והפעלה של סביבת הפרודקשן המקומית בתיקיית Worktree נפרדת `~/Documents/TikTrack/TikTrackApp-Production`, עם תהליך עדכון אחיד וגרסת בסיס (“Production Version 0”).

**חשוב:** אין תיקיית `production/` בתוך `TikTrackApp` (פיתוח). הפרודקשן מנוהל בענף `production` וב‑worktree נפרד.

---

## 1. רקע ומטרות

- **הפרדת ענפים מלאה:** כל ענף (main / production) פועל בעץ קבצים עצמאי – אין יותר תקיית `production/` בתוך `TikTrackApp`.
- **שמירה על Git Workflow קיים:** ענף `main` נשאר סביבת הפיתוח היחידה; ענף `production` מנוהל דרך worktree ייעודי.
- **אפס העתקות ידניות:** אין להעתיק קבצים ידנית. ה־worktree יוצר/מעדכן את התיקייה אוטומטית.
- **תהליך אחיד לגרסה 0:** מגדיר כיצד לסנכרן את הקוד הראשוני (Baseline) לענף production לאחר מעבר למבנה החדש.

---

## 2. מבנה ספריות חדש

| נתיב | תיאור | הערות |
|------|-------|-------|
| `~/Documents/TikTrack/TikTrackApp/` | סביבת פיתוח (ענף `main`) | אין שינויים במבנה |
| `~/Documents/TikTrack/TikTrackApp-Production/` | סביבת פרודקשן (ענף `production`) | נוצר אוטומטית ע״י `git worktree add` |

> ⚠️ **אין ליצור תיקיית production ידנית ואין להכניס אותה מחדש לתוך `TikTrackApp/`.**

---

## 3. שלבי הקמה (חד־פעמי)

1. **וודא שהריפו נקי:**  

   ```bash
   cd ~/Documents/TikTrack/TikTrackApp
   git status -sb
   ```

   יש להמשיך רק אם אין שינויים לא שמורים.

2. **עדכן את הענפים לפני יצירת worktree:**  

   ```bash
   git checkout main && git pull origin main
   git fetch origin production
   ```

3. **צור Worktree חדש לפרודקשן:**  

   ```bash
   git worktree add ../TikTrackApp-Production production
   ```

   - אם התיקייה `TikTrackApp-Production` אינה קיימת – Git יוצר אותה אוטומטית.
   - אם התיקייה קיימת ואינה ריקה – הפקודה תכשל; יש לרוקן/להסיר אותה קודם.

4. **אימות:**  

   ```bash
   ls -1 ..
   cd ../TikTrackApp-Production
   git status -sb
   ```

   יש לוודא שהמצב מציג `## production...origin/production`.

---

## 4. גרסת פרודקשן 0 – תהליך עדכון בסיסי

מטרה: לסנכרן את קוד הפיתוח הנוכחי לענף `production` במבנה worktree החדש.  
השלבים מתבצעים מה־worktree (`~/Documents/TikTrack/TikTrackApp-Production/`).

### 4.1 הכנה

```bash
cd ~/Documents/TikTrack/TikTrackApp-Production
git pull origin production
```

### 4.2 מיזוג main → production

```bash
# מתוך worktree הפרודקשן
git merge --ff-only origin/main
```

- אם מתבצע פיתוח פעיל בפרודקשן, ניתן להחליף ל-`git merge main` ולפתור קונפליקטים ידנית.

### 4.3 בדיקות התאמה

הרץ את הסקריפטים הסטנדרטיים (מתוך worktree):

```bash
./scripts/verify_production_isolation.sh
./scripts/verify_production.sh
```

### 4.4 Commit & Push

```bash
git status -sb
git add .
git commit -m "feat: Production worktree baseline sync (version 0)"
git push origin production
```

---

## 5. תהליך עדכון שוטף (לאחר הקמה)

1. **פיתוח רגיל:** כל העבודה נמשכת ב-`TikTrackApp/` על ענף `main`.
2. **הכנת עדכון לפרודקשן:**

   ```bash
   cd ~/Documents/TikTrack/TikTrackApp
   git checkout main
   git pull origin main
   ```

3. **כניסה לסביבת production:**

   ```bash
   cd ../TikTrackApp-Production
   git pull origin production
   git merge --ff-only origin/main
   ```

4. **בדיקות חובה:**  
   - `./scripts/verify_production_isolation.sh`  
   - `./scripts/verify_production.sh`  
   - בדיקות ייעודיות לפי `documentation/production/UPDATE_PROCESS.md`
5. **Commit & Push:** לבצע מהמיקום הנוכחי (worktree production).

---

## 6. נקודות בקרה ו-Automation

- **Hooks קיימים:** ניתן להשאירם בריפו הראשי; אין צורך לעדכן אותם.
- **סקריפטים קיימים:** כל הסקריפטים שהיו תלויים בנתיב `production/` צריכים לרוץ מתוך worktree זהה (למעט עדכון מסלולים מוחלטים, אם קיים).
- **מומלץ:** להוסיף alias ב-shell:

  ```bash
  alias tt-dev='cd ~/Documents/TikTrack/TikTrackApp'
  alias tt-prod='cd ~/Documents/TikTrack/TikTrackApp-Production'
  ```

---

## 7. Rollback והחלפת סביבת production

1. **למחיקת worktree (אם נדרש):**

   ```bash
   cd ~/Documents/TikTrack
   git worktree remove TikTrackApp-Production
   rm -rf TikTrackApp-Production
   ```

   > מומלץ רק אם בטוחים שהשינויים ב-push בוצעו.

2. **יצירה מחדש:** חזרה לסעיף 3 (שלבי הקמה).

---

## 8. שאלות נפוצות

**האם צריך להעתיק קבצים לפרודקשן?**  
לא. ה-worktree משתמש באותו ריפו ויוצר קבצים אוטומטית. אין להעתיק ידנית.

**מה קורה עם בסיס הנתונים והשרת?**  
סביבת הפרודקשן המקומית ממשיכה להשתמש ב-db ובסקריפטים הייעודיים בתוך worktree. נתיבי DB/שרת נשארים כפי שמוגדרים בתיעוד הפרודקשן הקיים, רק שהבסיס החדש נמצא בתיקיית ה-worktree.

**איך מפעילים שרת פרודקשן?**  
מפעילים מתוך worktree הפרודקשן (`./start_production.sh`). אין להפעיל את הסקריפט מתוך סביבת הפיתוח.

**מה לגבי תיעוד קיים?**  
`documentation/production/UPDATE_PROCESS.md` ויתר הקבצים נשארים רלוונטיים – הם מניחים כעת שהפוקוס הוא על worktree חיצוני ולא על תת-תיקייה בתוך הפרויקט.

---

## 9. הפניות

- `documentation/production/UPDATE_PROCESS.md`
- `documentation/production/CODE_SEPARATION.md`
- `documentation/production/PRODUCTION_SETUP.md`
- `documentation/03-DEVELOPMENT/GUIDELINES/BACKUP_AND_VERSION_CONTROL_GUIDE.md`

---

**עודכן:** 2025-11-09  
**תחזוקה:** צוות הפיתוח של TikTrack  
**סטטוס:** פעיל – חל על כל עדכון Production מגרסה 0 ואילך
