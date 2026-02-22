# 📖 תיעוד טכני: רכיבי אימות (Auth Core) - פרויקט פיניקס
**project_domain:** TIKTRACK

**id:** `AUTH_DEVELOPER_HANDOVER`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

---

## 🏗️ מבנה אדריכלי
הקבצים המצורפים (Login, Register, Reset) הם תוצרי ה-Blueprint שאושרו ברמת LOD 400.
הם מהווים את ה-Source of Truth (SSOT) עבור צוות 30 (Frontend Execution).

## 🎨 ניהול סגנונות (CSS & DNA)
1. **משתני DNA:** כל הצבעים, הריווחים והטיפוגרפיה מנוהלים דרך `variables.css`. אין להשתמש בערכי Hex קשיחים.
2. **Source of Truth:** הסגנונות הייחודיים לישות הזהות ממוקמים ב-`D15_IDENTITY_STYLES.css`.
3. **ספריות חיצוניות:** שימוש ב-Pico.css לבסיס ו-Lucide Icons עבור איקונוגרפיה.

## 🔄 אמנת RTL (Logical Properties)
הקוד נכתב בהתאם ל-RTL Development Charter:
- שימוש בלעדי ב-Logical Properties (למשל: `margin-inline-start` במקום `margin-left`).
- כיווניות `dir="rtl"` מוגדרת ברמת ה-HTML.

## 🚀 הנחיות לצוות 30 (Implementation)
- **Componentization:** יש לפרק את המבנה לרכיבי React פונקציונליים תוך שמירה על ה-Class names המוגדרים.
- **Forms:** הקפידו על ולידציית צד לקוח תואמת Blueprint (שדות חובה, טלפון במבנה בינלאומי).
- **Assets:** ודאו שכל הנתיבים לתמונות ואיקונים ממופים נכון בתוך סביבת ה-Vite.

---
*הופק על ידי G-Bridge (Architectural Control) - פרויקט פיניקס v252.60*