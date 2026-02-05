# גרסאות קודמות של user_profile.html

תיקייה זו מכילה את כל הגרסאות הקודמות של עמוד פרופיל המשתמש שנמצאו בגיט.

## מבנה התיקייה

### trading-ui/
גרסאות מהתיקייה `trading-ui/user_profile.html`:

**גרסאות עיקריות:**
- **v1_2026-01-24.html** (27KB, 352 שורות) - גרסה מ-24 בינואר 2026
- **v2_2025-12-26.html** (13KB, 223 שורות) - גרסה מ-26 בדצמבר 2025
- **v3_2025-12-29.html** (37KB, 502 שורות) - גרסה מ-29 בדצמבר 2025

**גרסאות נוספות (רובן ריקות/קטנות):**
- user_profile_15efcf9a_2026-01-06.html (0B)
- user_profile_175ea949_2025-12-26.html (0B)
- user_profile_1af2d532_2025-12-23.html (0B)
- user_profile_38542c7d_2026-01-04.html (0B)
- user_profile_485b4dca_2026-01-23.html (0B)
- user_profile_4bea8cdc_2025-12-29.html (0B)
- user_profile_4bf6591f_2026-01-24.html (0B)
- user_profile_9ac77ca7_2026-01-04.html (0B)
- user_profile_ce4b8eb8_2026-01-04.html (0B)
- user_profile_d0dc5f81_2025-12-25.html (0B)
- user_profile_e7af8997_2025-12-23.html (0B)

### legacy/
גרסאות מהתיקייה `_COMMUNICATION/Legace_html_for_blueprint/user_profile.html`:

- **user_profile_78920404_2026-01-31.html** (83KB) - גרסה מ-31 בינואר 2026
- **user_profile_02266c2f_2026-01-31.html** (83KB) - גרסה מ-31 בינואר 2026
  - **הערה**: קבצים אלה הם HTML שמור מהדפדפן (saved from url), לא קבצי מקור

### Blueprints/
- **D15_PROF_VIEW_blueprint.html** (8.4KB) - Blueprint מ-Team 01
  - מבנה: `tt-section-row` עם 2 `tt-section` (הגדרות משתמש + אבטחה) + `tt-section` נפרד למפתחות API
  - **זהו Blueprint, לא קובץ פעיל**

## הערות חשובות

1. הקבצים ב-`trading-ui/` הם קבצי מקור אמיתיים מהגיט.
2. הקבצים ב-`legacy/` הם HTML שמור מהדפדפן ולא קבצי מקור.
3. הקובץ הנוכחי הפעיל נמצא ב: `ui/src/views/financial/user_profile.html`
4. הקובץ הנוכחי הוא **untracked** (לא נשמר בגיט עדיין).
5. **D15_PROF_VIEW_blueprint.html** הוא Blueprint/תבנית עיצוב, לא קובץ פעיל.

## מה לבדוק

בדוק את כל הגרסאות כדי למצוא:
- ✅ שדות email/phone verification עם badges (emailVerificationStatus, phoneVerificationStatus)
- ✅ כפתורי resend verification (resendEmailVerificationBtn, resendPhoneVerificationBtn)
- ✅ מבנה של 3 סקשנים:
  1. סקשן עליון: מידע אישי + verification status + resend buttons
  2. סקשן שני: עריכת פרטי משתמש + כפתור שינוי סיסמה
  3. סקשן שלישי: מפתחות API עם ממשק עריכה והוספה מדויק
- ✅ עיצוב מדויק של סקשן המפתחות (טבלה עם פעולות עריכה/הוספה)

## הוראות שימוש

1. פתח כל קובץ בדפדפן או בעורך טקסט
2. השווה את המבנה והשדות עם הקובץ הנוכחי (`ui/src/views/financial/user_profile.html`)
3. זהה את הגרסה עם השדות המדויקים ביותר
4. העתק את המבנה והשדות הנכונים לקובץ הנוכחי
5. בדוק במיוחד את:
   - **v3_2025-12-29.html** - הגרסה הגדולה ביותר (502 שורות)
   - **D15_PROF_VIEW_blueprint.html** - Blueprint עם מבנה LEGO Components

## רשימת קבצים מלאה

סה"כ: **18 קבצים** בתיקייה זו:
- 3 גרסאות עיקריות ב-`trading-ui/`
- 11 גרסאות נוספות ב-`trading-ui/` (רובן ריקות)
- 2 גרסאות ב-`legacy/` (HTML שמור מהדפדפן)
- 1 Blueprint ב-`D15_PROF_VIEW_blueprint.html`
