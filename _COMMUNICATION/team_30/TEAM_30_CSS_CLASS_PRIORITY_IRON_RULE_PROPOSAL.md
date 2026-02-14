# Team 30: כלל ברזל — סדר עדיפויות במחלקות CSS

**id:** `TEAM_30_CSS_CLASS_PRIORITY_IRON_RULE_PROPOSAL`  
**מאת:** Team 30 (Frontend)  
**תאריך:** 2026-01-31  
**נושא:** הצעת כלל ברזל לתיאום בנוהל — עדיפות מחלקות בכל עמוד/ממשק  
**עד:** Team 10 (Gateway) — לתיאום והנחלת הנוהל

---

## 1. כלל ברזל

**בכל עמוד או ממשק שאנחנו מיישמים:**

| עדיפות | פעולה | תיאור |
|--------|-------|--------|
| **1** | שימוש במחלקות ברירת מחדל או ללא מחלקה | אלמנטים סטנדרטיים (input, select, button, form-group) — ללא class או עם class בסיסי בלבד. העיצוב מגיע מ־phoenix-base / element selectors |
| **2** | שימוש במחלקה קיימת | אם נדרש סגנון שונה — **תחילה** לחפש מחלקה קיימת שכבר בשימוש בממשקים אחרים (index-section__*, phoenix-table-*, form-group, וכו') |
| **3** | מחלקה חדשה — רק במידת הצורך | רק כאשר יש **הבדל מהותי** ולא קיימת מחלקה מתאימה — לייצר מחלקה חדשה. **לבדוק תמיד** ב־CSS_CLASSES_INDEX / codebase לפני יצירה |

---

## 2. דוגמאות

```
✅ עדיפות 1: <select class="index-section__header-filter-select"> — מחלקה קיימת ב-header
✅ עדיפות 1: <input> — ללא מחלקה, ברירת מחדל מ־phoenix-base
✅ עדיפות 2: <div class="form-group"> — מחלקה קיימת במודולים
❌ מיותר: <select class="data-integrity-select"> — אם index-section__header-filter-select מספיק
```

---

## 3. בקשת תאום

1. **Team 10:** להנחיל את הכלל בנוהלים הרלוונטיים (TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE, אולי CURSOR_INTERNAL_PLAYBOOK)
2. **Team 40:** לאשר/לעדכן את TEAM_40_VISUAL_VALIDATION_CRITERIA — סעיף "בדיקה ב-CSS_CLASSES_INDEX לפני יצירת מחלקה חדשה" תואם לעדיפות 3
3. **צוותים 30+40:** ליישם בכל יישום חדש או מתוחזק
