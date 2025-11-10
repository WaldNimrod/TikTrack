# TikTrack Versioning Guide (Development)

## 🎯 עקרונות בסיסיים

- מבנה גרסה אחיד לכל הסביבות: `Major.Minor.Patch.Build`.
- `Major`, `Minor` → מוגדרים ידנית ע״י נמרוד בלבד (כולל קפיצה לגרסת Production חדשה).
- `Patch` → קידום אוטומטי כאשר `main` מתקדם לגרסה חדישה (למשל לאחר השלמת פיתוח/בדיקות).
- `Build` → קידום לכל הפעלה/בדיקה של אותה גרסת קוד (שמירת Trace של Build מקומי או CI).
- מצב עדכני נרשם ב-`documentation/version-manifest.json` והיסטוריית הפעלות ב-`documentation/development/VERSION_HISTORY.md`.

## 🛠️ כלי ניהול הגרסה

```bash
python3 scripts/versioning/bump-version.py --help
```

- `--env development` | `--env production` – בחירת סביבה.
- `--bump patch` – קידום Patch (מאפס Build לאפס).
- `--bump build` – קידום Build באותה גרסה.
- `--set-version` + `--allow-major-minor` – שינוי Major/Minor (אישור נמרוד בלבד).
- כל הרצה מוסיפה חתימת Commit ותאריך ל-manifest ולמפל ההיסטוריה.

## 🔄 תרחישים נפוצים ב-main

1. **סיום פיתוח / Merge משמעותי ל-main**  
   ```bash
   git checkout main
   git pull origin main

   python3 scripts/versioning/bump-version.py \
     --env development \
     --bump patch \
     --note "Post-merge: feature XYZ"
   ```

2. **Build נוסף (CI / QA)**  
   ```bash
   python3 scripts/versioning/bump-version.py \
     --env development \
     --bump build \
     --note "QA regression run"
   ```

3. **קפיצת Major/Minor** (נמרוד בלבד)  
   ```bash
   python3 scripts/versioning/bump-version.py \
     --env development \
     --set-version 2.1.0.0 \
     --allow-major-minor \
     --note "Major release kickoff (approved by Nimrod)"
   ```

## 🗂️ קבצים חשובים

- `documentation/version-manifest.json` – סטטוס מעודכן לכל הסביבות.
- `documentation/development/VERSION_HISTORY.md` – לוג מלא של עדכוני main.
- `documentation/production/VERSION_HISTORY.md` – לוג פרודקשן (לעיון).
- `scripts/versioning/bump-version.py` – סקריפט הניהול.

## ✅ Best Practices

- הפעל את הסקריפט *מיד* לאחר merge משמעותי ל-main.  
- הוסף `--note` קצרה שמתארת את הסיבה לקידום (feature, bugfix, QA וכו').  
- לפני קידום פרודקשן, ודא שהגרסה ב-main כבר זוהתה ב-manifest (קל להשוות).
- אל תקדם Major/Minor ללא תיאום – זה משפיע על כל הדוקומנטציה והפריסה.

## 🔒 Hook אוטומטי (מומלץ)

```bash
./scripts/git-hooks/install-version-hook.sh
```

- ההתקנה יוצרת `pre-commit` שמפעיל בדיקה על ענפי `main` ו-`production`.
- הקומיט ייחסם אם `documentation/version-manifest.json` והיסטוריית הסביבה המתאימה לא נמצאים בסטייג׳.
- לעקיפה חריגה: `SKIP_VERSION_CHECK=1 git commit ...`.


