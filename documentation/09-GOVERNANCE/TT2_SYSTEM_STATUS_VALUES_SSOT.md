# 🏰 סטטוסים מערכתיים — SSOT (רשימת סטטוסים מרכזית)

**id:** `TT2_SYSTEM_STATUS_VALUES_SSOT`  
**owner:** Team 10 (The Gateway) — נעילה לפי בקשת Team 30  
**status:** 🔒 **SSOT - LOCKED**  
**last_updated:** 2026-02-12  
**מקור:** TEAM_30_TO_TEAM_10_STATUS_SSOT_ESCALATION.md

---

## 1. עקרון

**ארבעת הסטטוסים הבאים קבועים לכל הישויות במערכת.**  
ערך קנוני (אנגלית/DB/API) + תרגום עברית לתצוגה ולסינון.

---

## 2. טבלת הסטטוסים הרשמיים

| ערך קנוני (אנגלית / DB / API) | תרגום עברית (תצוגה / סינון) |
|--------------------------------|-----------------------------|
| `active`   | פתוח   |
| `inactive` | סגור   |
| `pending`  | ממתין  |
| `cancelled`| מבוטל  |

**חובה:** בכל מקום במערכת (Backend, Frontend, Header filters, EFR, Field Maps) — להשתמש **רק** בערכים הקנוניים בנתונים, ו**רק** בתרגומי העברית הרשומים כאן בתצוגה/סינון.

---

## 3. שימוש

- **שדה `status`** בטבלאות/ישויות — ערכים: `active` | `inactive` | `pending` | `cancelled`.
- **StatusRenderer (EFR)** — Categories above. מיפוי תצוגה: קנוני → עברית לפי טבלה זו.
- **סינון בתפריט (unified-header, PhoenixFilter)** — אופציות סינון: הכול + פתוח, סגור, ממתין, מבוטל (ארבעת העבריים).
- **Field Maps / TT2_EFR_LOGIC_MAP** — מפנים ל-SSOT זה עבור שדה `status`.

---

## 4. מקורות שתואמים

- `documentation/01-ARCHITECTURE/TT2_EFR_LOGIC_MAP.md` — Status Fields, Categories: active, inactive, pending, cancelled ✓
- **נדרש עדכון:** `ui/src/views/shared/unified-header.html` — וידוא שכל ארבע האופציות (כולל "ממתין") קיימות בתפריט סינון הסטטוס. ראה מיפוי מקומות בקוד.

---

**log_entry | TEAM_10 | SYSTEM_STATUS_VALUES_SSOT | LOCKED | 2026-02-12**
