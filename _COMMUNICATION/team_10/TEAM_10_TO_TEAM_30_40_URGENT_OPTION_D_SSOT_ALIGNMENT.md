# 🚨 Team 10 → Team 30 & Team 40: תיקון דחוף — יישור Option D ל-SSOT

**אל:** Team 30 (Frontend), Team 40 (UI Assets & Design)  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-09  
**עדיפות:** 🔴 **דחוף** — ממצא ביקורת

---

## ממצא

מיפויי **Option D** (רספונסיביות טבלאות) לא מיושרים ל-**Architect Table Responsivity** (SSOT). הדבר מונע "100% סגור ללא ניחושים" ומנוגד למנדט צוות 90 (אפס סובלנות לסטיות מ-clamp()/masking).

---

## SSOT מחייב

**מסמך:** `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`

עיקרי ההחלטה:
- **Option D (מודל היברידי):** table-layout: auto; Atomic (Fixed) לאייקונים/צ'קבוקס; Fluid (Weighted) עם clamp() ו-min-width; Expansion (Flexible) לטקסט.
- **Sticky Isolation:** Start — `inset-inline-start: 0`; End — `inset-inline-end: 0`.
- **Retrofit Mandate:** חובה לתקן תוך 48 שעות — D15_INDEX, D15_PROF_VIEW, Trading Accounts (D16), ועמודי Phase 2 (D18, D21 וכו').

---

## נדרש מכם

1. **ליישר** את המיפוי והמימוש (CSS/מבנה טבלאות) **במדויק** להחלטות במסמך לעיל — כולל clamp(), Sticky Start/End, סוגי עמודות (Atomic/Fluid/Expansion).
2. **לעדכן** את קובץ המיפוי (או מסמך נפרד) עם הפניה מפורשת ל-`ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md` ווידוא שכל עמוד (D16, D18, D21 וכו') מתועד בהתאם.
3. **להחזיר** עדכון בתיקיית הצוות — גרסה מעודכנת של המיפוי + ציון "מיושר ל-ARCHITECT_TABLE_RESPONSIVITY_DECISIONS".

---

## קריטריון אימות (צוות 10 יוודא לפני אישור)

- המיפוי והקוד תואמים את ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md.
- אין סטיות מ-clamp() או מ-Sticky כפי שמוגדר ב-SSOT.

---

**דוח פערים:** `TEAM_10_GATEKEEPER_GAPS_REPORT.md`  
**SSOT רספונסיביות:** `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`
