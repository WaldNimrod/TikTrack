# טבלת שלבים - תהליך עדכון פרודקשן

**תאריך:** 2025-01-21  
**גרסה:** 1.0.0

---

## 📊 טבלת שלבים מפורטת

| שלב | שם השלב | סביבה | Branch | מי מבצע | אוטומטי? | זמן משוער | פקודות/כלים |
|-----|---------|-------|--------|---------|-----------|------------|--------------|
| **0** | הכנה בסביבת הפיתוח | פיתוח | `main` | צוות הפיתוח | חלקי | 5 דק' | `git commit`, `prepare_changelog.py`, `pre_sync_validation.py` |
| **0.5** | שמירת שינויים בפרודקשן | פרודקשן | `production` | צוות הפרודקשן | חלקי | 2 דק' | `preserve_production_changes.py` |
| **1** | עדכון main branch | פרודקשן | `production` | צוות הפרודקשן | כן | 1 דק' | `git pull origin production`, `git fetch origin main` |
| **2** | מיזוג main → production | פרודקשן | `production` | צוות הפרודקשן | כן (Master Script) | 2-5 דק' | `git merge main` או `master.py` (Step 2) |
| **3** | סינכרון קוד | פרודקשן | `production` | Master Script | כן | 3-5 דק' | `sync_to_production.py` (Step 5) |
| **3.5** | תיקון הגדרות Production | פרודקשן | `production` | Master Script | כן | 1 דק' | Post-sync transformer (Step 7) |
| **4** | בדיקות ואימות | פרודקשן | `production` | Master Script + ידני | חלקי | 2-3 דק' | `sync_verifier.py`, `verify_production.sh` (Step 8) |
| **5** | עדכון גרסה | פרודקשן | `production` | Master Script | כן | 1 דק' | `bump-version.py` (Step 9) |
| **6** | Commit & Push | פרודקשן | `production` | Master Script | כן | 1 דק' | `git commit`, `git push` (Step 10) |
| **7** | תיעוד עדכוני שרת | פרודקשן | `production` | צוות הפרודקשן | חלקי | 1 דק' | `document_server_changes.py` |

---

## 🔍 פירוט לפי סביבה

### סביבת הפיתוח (Development Environment)

| שלב | שם | Branch | פעולות | כלים |
|-----|-----|--------|--------|------|
| **0** | הכנה בסביבת הפיתוח | `main` | 1. שמירת שינויים ב-git<br>2. יצירת changelog<br>3. Pre-sync validation | `git commit`<br>`prepare_changelog.py`<br>`pre_sync_validation.py` |

**מיקום:** `/path/to/TikTrackApp` (סביבת הפיתוח)  
**Branch:** `main`  
**תפקיד:** הכנת השינויים לפני העברה לפרודקשן

---

### סביבת הפרודקשן (Production Environment)

| שלב | שם | Branch | פעולות | כלים |
|-----|-----|--------|--------|------|
| **0.5** | שמירת שינויים בפרודקשן | `production` | שמירת שינויים ב-config לפני merge | `preserve_production_changes.py` |
| **1** | עדכון main branch | `production` | עדכון מ-remote | `git pull`, `git fetch` |
| **2** | מיזוג main → production | `production` | מיזוג שינויים מ-main | `git merge main` או `master.py` |
| **3** | סינכרון קוד | `production` | העתקת Backend + UI | `sync_to_production.py` |
| **3.5** | תיקון הגדרות Production | `production` | תיקון הגדרות production | Post-sync transformer |
| **4** | בדיקות ואימות | `production` | בדיקת sync, מבנה, הפרדה | `sync_verifier.py`, `verify_production.sh` |
| **5** | עדכון גרסה | `production` | קידום גרסה | `bump-version.py` |
| **6** | Commit & Push | `production` | שמירה ב-Git | `git commit`, `git push` |
| **7** | תיעוד עדכוני שרת | `production` | תיעוד שינויים ב-config | `document_server_changes.py` |

**מיקום:** `/path/to/TikTrackApp-Production` (סביבת הפרודקשן)  
**Branch:** `production`  
**תפקיד:** ביצוע עדכון הפרודקשן

---

## 📋 טבלת Master Script - שלבים אוטומטיים

| Step | שם | סביבה | Branch | אוטומטי? | זמן משוער | תיאור |
|------|-----|-------|--------|-----------|------------|--------|
| **1** | Collect Changes | פרודקשן | `production` | כן | 1 דק' | איסוף שינויים מ-main |
| **2** | Merge Main | פרודקשן | `production` | כן | 2-5 דק' | מיזוג עם conflict resolver |
| **3** | Cleanup Documentation | פרודקשן | `production` | כן | 1 דק' | ניקוי דוקומנטציה |
| **4** | Backup Database | פרודקשן | `production` | כן | 1 דק' | גיבוי DB |
| **5** | Sync Code | פרודקשן | `production` | כן | 3-5 דק' | סנכרון Backend + UI |
| **6** | Cleanup Backups | פרודקשן | `production` | כן | 1 דק' | ניקוי גיבויים |
| **7** | Fix Config | פרודקשן | `production` | כן | 1 דק' | תיקון הגדרות production |
| **8** | Validate | פרודקשן | `production` | כן | 2-3 דק' | בדיקות ואימות |
| **9** | Bump Version | פרודקשן | `production` | כן | 1 דק' | עדכון גרסה |
| **10** | Commit & Push | פרודקשן | `production` | כן | 1 דק' | Git commit & push |
| **11** | Start Server | פרודקשן | `production` | כן (אופציונלי) | 1 דק' | הפעלת שרת |

**שימוש:**
```bash
# בסביבת הפרודקשן
python3 scripts/production-update/master.py
```

---

## 🗺️ מפת תהליך - זרימת עבודה

```
┌─────────────────────────────────────────────────────────────┐
│  סביבת הפיתוח (Development)                                 │
│  Branch: main                                                │
│  מיקום: /path/to/TikTrackApp                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ שלב 0: הכנה
                            │ - שמירת שינויים
                            │ - יצירת changelog
                            │ - Pre-sync validation
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  סביבת הפרודקשן (Production)                                │
│  Branch: production                                          │
│  מיקום: /path/to/TikTrackApp-Production                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ שלב 0.5: שמירת שינויים
                            │ - preserve_production_changes.py
                            ↓
                            │ שלב 1: עדכון main
                            │ - git pull origin production
                            │ - git fetch origin main
                            ↓
                            │ שלב 2: מיזוג
                            │ - git merge main
                            │   או
                            │ - master.py (Step 2)
                            ↓
                    ┌───────┴───────┐
                    │ Master Script │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ↓                   ↓                   ↓
    Step 3-4          Step 5            Step 6-7
    Cleanup +          Sync Code         Cleanup +
    Backup DB          (Backend+UI)      Fix Config
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ↓
                    Step 8: Validate
                    - sync_verifier.py
                    - verify_production.sh
                            │
                            ↓
                    Step 9: Bump Version
                            │
                            ↓
                    Step 10: Commit & Push
                            │
                            ↓
                    Step 11: Start Server (אופציונלי)
                            │
                            ↓
                    שלב 7: תיעוד (אופציונלי)
                    - document_server_changes.py
```

---

## 📝 טבלת החלטות - מתי להשתמש במה

| מצב | שיטה | סביבה | Branch | פקודה |
|-----|------|-------|--------|-------|
| **תהליך מלא אוטומטי** | Master Script | פרודקשן | `production` | `python3 scripts/production-update/master.py` |
| **תהליך ידני** | שלבים נפרדים | פרודקשן | `production` | כל שלב בנפרד |
| **תהליך מהיר** | Master Script + תיעוד | פרודקשן | `production` | `master.py` + `document_server_changes.py` |
| **רק merge** | git merge | פרודקשן | `production` | `git merge main` |
| **רק sync** | sync scripts | פרודקשן | `production` | `sync_to_production.py` |

---

## ⚠️ נקודות קריטיות לפי סביבה

### סביבת הפיתוח

- ✅ כל השינויים נשמרו ב-git
- ✅ כל השינויים נדחפו ל-main
- ✅ Changelog נוצר
- ✅ Pre-sync validation עבר

### סביבת הפרודקשן

- ✅ שינויים בפרודקשן נשמרו לפני merge
- ✅ מיזוג מ-main בלבד (לא מ-new-db-uopgrde)
- ✅ הגדרות production נכונות אחרי sync
- ✅ כל הבדיקות עברו
- ✅ גרסה עודכנה
- ✅ שינויים נדחפו ל-remote

---

## 📚 מסמכים נוספים

- [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) - תהליך מפורט מלא
- [`PROCESS_STEPS_SUMMARY.md`](./PROCESS_STEPS_SUMMARY.md) - סיכום שלבים
- [`HANDOFF_TO_PRODUCTION_TEAM.md`](./HANDOFF_TO_PRODUCTION_TEAM.md) - מידע להעברה

---

**עודכן:** 2025-01-21  
**גרסה:** 1.0.0

