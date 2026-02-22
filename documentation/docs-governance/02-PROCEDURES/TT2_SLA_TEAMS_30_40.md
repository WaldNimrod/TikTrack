# 🤝 אמנת שירות: צוות 30 (Frontend) ↔ צוות 40 (UI Assets & Design)
**project_domain:** TIKTRACK

**id:** `TT2_SLA_TEAMS_30_40`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - MANDATORY**  
**last_updated:** 2026-02-09  
**version:** v1.0  
**context:** מיסוד חלוקת אחריות בין צוותי הפרונטאנד (מנדט TEAM_91 / ביקורת אדריכלית).

---

## 1. מטרה

הפחתת חיכוכים והגברת מהירות הביצוע באמצעות הגדרה ברורה של אחריות:
- **צוות 40:** Blueprints → רכיבי Presentational (Pixel Perfect) + בעלות על CSS ומראה ויזואלי.
- **צוות 30:** רכיבי Presentational → Containers (לוגיקה, State, API).

---

## 2. חלוקת אחריות מחייבת

### 2.1 צוות 40 (UI Assets & Design)

| אחריות | תיאור |
|--------|--------|
| **קלט** | Blueprints (ממשק, Design Tokens, Specs). |
| **פלט** | רכיבי React **Presentational** ("טיפשים") — ללא לוגיקה עסקית, ללא State גלובלי, ללא קריאות API. |
| **איכות** | **Pixel Perfect** מול ה-Blueprint. |
| **בעלות** | **בעלים בלעדיים** של ה-CSS והמראה הוויזואלי (Design Tokens, CSS Layers: Base/Comp/Header). |
| **לא באחריות** | ניהול מצב (State), קריאות API, חיבור ל-Backend. |

### 2.2 צוות 30 (Frontend)

| אחריות | תיאור |
|--------|--------|
| **קלט** | רכיבים Presentational שמסופקים על ידי צוות 40. |
| **פלט** | רכיבי **Container** ("חכמים") — שילוב לוגיקה עסקית, ניהול מצב (State), וקריאות API. |
| **תפקיד** | חיבור הרכיבים הוויזואליים ל-Backend, Routes, Context, ו-UAI/PDSC. |
| **לא באחריות** | שינוי עיצוב/CSS של רכיבים Presentational — יש להפנות לצוות 40. |

---

## 3. כללי עבודה

1. **זרימת עבודה:** Blueprint → צוות 40 (Presentational) → צוות 30 (Container + אינטגרציה).
2. **שינויי עיצוב:** רק צוות 40 משנה CSS/מראה של רכיבים Presentational.
3. **תקשורת:** חריגות וספקות — דרך צוות 10 (The Gateway).

---

## 4. הפניות

- מבנה ארגוני: `documentation/00-MANAGEMENT/PHOENIX_ORGANIZATIONAL_STRUCTURE.md`
- נהלים פנימיים: `documentation/09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md`
- מנדט יישום: id `TEAM_91_TO_TEAM_10_IMPLEMENT_SLA_MANDATE` (תיעוד תקשורת)
