# 🚨 Team 10 → Team 60: תיקון דחוף — Makefile / seed_test_data.py

**אל:** Team 60 (DevOps & Infra)  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-09  
**עדיפות:** 🔴 **דחוף** — ממצא ביקורת

---

## ממצא

ה-**Makefile** מפנה ל-`scripts/seed_test_data.py` — **הקובץ לא קיים**.  
**תוצאה:** `make db-test-fill` שבור בפועל.

---

## נדרש מכם

1. **אופציה א':** ליצור את הסקריפט `scripts/seed_test_data.py` בהתאם למפרט (זריעת נתוני בדיקה עם `is_test_data = true`), כך ש-`make db-test-fill` ירוץ בהצלחה.
2. **אופציה ב':** לעדכן את ה-Makefile כך שיפנה לסקריפט קיים (אם יש תחליף תקף באותו תכלית) — ולוודא שהנתיב והפקודה נכונים.

---

## קריטריון אימות (צוות 10 יוודא לפני אישור)

- הרצת `make db-test-fill` מסתיימת ב-**exit code 0** (או הודעת הצלחה מוגדרת).
- הקובץ אליו מפנה ה-Makefile **קיים** בנתיב המצוין.

---

**דוח פערים:** `TEAM_10_GATEKEEPER_GAPS_REPORT.md`  
**מסמך משימה:** `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_TASK_SPEC_SUPPLEMENT_REQUEST.md`
