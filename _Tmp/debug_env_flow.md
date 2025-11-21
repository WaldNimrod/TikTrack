# Debug: זרימת משתני סביבה

## 1. איפה נוצרים המשתנים?

**מיקום:** `scripts/production-update/steps/05_sync_code.py` - שורה 57-59

```python
env = os.environ.copy()
project_root_str = str(project_root.resolve())
env['TIKTRACK_PROJECT_ROOT'] = project_root_str
```

**ערך:** `/Users/nimrod/Documents/TikTrack/TikTrackApp-Production`

## 2. באיזה צורה הם מועברים לסקריפט?

**דרך:** `subprocess.run()` עם פרמטר `env=env`

```python
result = subprocess.run(
    [sys.executable, str(sync_backend_script)],
    cwd=project_root_str,
    env=env,  # <-- כאן מועבר ה-env var
    capture_output=True,
    text=True
)
```

## 3. כיצד ניתן לדבג את התהליך?

### בדיקות שבוצעו:

✅ **Test 1-3:** יצירת וקריאת env vars - עובד
✅ **Test 4:** subprocess עם env var - עובד
✅ **Test 6:** sync_to_production.py עם env var - עובד
✅ **Test 7:** step5 -> subprocess -> sync_to_production.py - עובד
✅ **Test 9:** subprocess.run עם אותם פרמטרים - עובד
✅ **Test 10:** עם CWD שגוי אבל env var - עובד
✅ **Test 11:** בלי env var, עם CWD fallback - עובד

❌ **Test 8:** דרך step5.run_step() ישירות - **לא עובד!**

### הבעיה:

דרך `step5.run_step()` ישירות, ה-DEBUG output לא מופיע ב-stdout, מה שמעיד שה-env var לא מועבר ל-subprocess.

**השערה:** אולי יש בעיה עם איך step5 מעביר את ה-env var, או שה-CWD שגוי דרך step5.

### פתרון אפשרי:

1. לבדוק מה ה-CWD בפועל דרך step5
2. לבדוק אם ה-env var מועבר נכון דרך step5
3. להוסיף debug output נוסף ב-step5 לפני subprocess.run

