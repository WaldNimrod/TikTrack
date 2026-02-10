# 📢 מיסוד נהלי ליבה — QA ו-Blueprint Handoff

**נושא:** מיסוד נהלים חדשים — פרוטוקול שערי איכות ודרישות מסירת בלופרינט  
**אל:** All Development Teams (20, 30, 31, 40, 50, 60, 90)  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-09  
**סטטוס:** 🔒 **הודעה רשמית — נהלים מחייבים**

---

לידיעתכם, בהתאם למנדט מיסוד נהלים (TEAM_91), הוגדרו שני נהלי ליבה חדשים ומחייבים ב-SSOT:

---

## 1. פרוטוקול הבטחת איכות — שערי בדיקה (Quality Gates)

תהליך הבדיקות התלת-שכבתי ממוסד ומחייב:

| שער | אחריות | סטטוס מעבר |
|-----|--------|------------|
| **שער א'** | צוות 50 — בדיקות אוטומטיות (0 SEVERE) | GATE_A_PASSED |
| **שער ב'** | צוות 90 — ביקורת חיצונית | GATE_B_PASSED |
| **שער ג'** | Visionary — אישור ויזואלי סופי | FINAL_APPROVAL |

**מסמך מחייב:** `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md`

לא ניתן לקדם גרסה לייצור ללא מעבר מוצלח של כל שלושת השערים בסדר שצוין.

---

## 2. דרישות מסירת בלופרינט (Blueprint Handoff)

כל בלופרינט שמועבר צוות 31 לצוותי הפיתוח (30, 40) חייב לעמוד ב-Checklist המחייב: מבנה V3, רכיבי LEGO, סדר טעינת CSS, Pixel Perfect, תוכן דמה מלא, כל המצבים, ואיסור מוחלט על inline styles/scripts.

**מסמך מחייב:** `documentation/05-PROCEDURES/TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md`

תהליך מסירה: צוות 31 → Checklist → אישור Visionary → מסירה לצוות 40 ו-30.

---

## 3. עדכון מסמכי ליבה

- `documentation/00-MANAGEMENT/00_MASTER_INDEX.md` (v3.8) — נוספו קישורים לשני הנהלים.
- `documentation/09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md` — עודכנו הגדרות תפקיד (צוות 31, 50, 90) והפניות לנהלים.

נא להתייחס לנהלים בעבודה השוטפת ולפנות לצוות 10 בכל שאלה.

---

**מקור מנדט:** id `TEAM_91_TO_TEAM_10_PROCESS_FORMALIZATION_MANDATE`
