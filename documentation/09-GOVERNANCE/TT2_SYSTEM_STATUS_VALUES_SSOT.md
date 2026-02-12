# 🏰 סטטוסים מערכתיים — SSOT (רשימת סטטוסים מרכזית)

**id:** `TT2_SYSTEM_STATUS_VALUES_SSOT`  
**owner:** Team 10 (The Gateway) — נעילה לפי בקשת Team 30 + החלטה אדריכלית  
**status:** 🔒 **SSOT - LOCKED**  
**last_updated:** 2026-02-12  
**מקור:** TEAM_30_TO_TEAM_10_STATUS_SSOT_ESCALATION.md + החלטה אדריכלית (יישום אחיד SSOT → Code)

---

## 1. עקרון היישום (Single Source)

**SSOT יחיד → מקור קוד יחיד → Adapter יחיד → שימוש בכל מקום.**  
מנגנון חד‑פעמי שלא יאפשר "מימושים מקבילים".

| שלב | מקום |
|-----|------|
| מקור אמת (SSOT) | מסמך זה |
| מקור טכני בקוד | `ui/src/utils/statusValues.js` — `STATUS_VALUES` |
| Adapter אחיד | `ui/src/utils/statusAdapter.js` — `toCanonicalStatus`, `toHebrewStatus`, `getStatusOptions` |
| שימוש | Header filter, DataLoaders (D16/D18/D21), badges/EFR, PhoenixFilterBridge — **רק דרך Adapter** |

---

## 2. עקרון (תוכן)

**ארבעת הסטטוסים הבאים קבועים לכל הישויות במערכת.**  
ערך קנוני (אנגלית/DB/API) + תרגום עברית לתצוגה ולסינון.

---

## 3. טבלת הסטטוסים הרשמיים

| ערך קנוני (אנגלית / DB / API) | תרגום עברית (תצוגה / סינון) |
|--------------------------------|-----------------------------|
| `active`   | פתוח   |
| `inactive` | סגור   |
| `pending`  | ממתין  |
| `cancelled`| מבוטל  |

**חובה:** בכל מקום במערכת (Backend, Frontend, Header filters, EFR, Field Maps) — להשתמש **רק** בערכים הקנוניים בנתונים, ו**רק** בתרגומי העברית הרשומים כאן בתצוגה/סינון.

---

## 4. שימוש

- **שדה `status`** בטבלאות/ישויות — ערכים: `active` | `inactive` | `pending` | `cancelled`.
- **StatusRenderer (EFR)** — Categories above. מיפוי תצוגה: קנוני → עברית לפי טבלה זו.
- **סינון בתפריט (unified-header, PhoenixFilter)** — אופציות סינון: הכול + פתוח, סגור, ממתין, מבוטל (ארבעת העבריים).
- **Field Maps / TT2_EFR_LOGIC_MAP** — מפנים ל-SSOT זה עבור שדה `status`.

---

## 5. מקורות קוד (חובה)

- **מקור יחיד:** `ui/src/utils/statusValues.js` — `STATUS_VALUES`, `STATUS_CANONICAL`, `STATUS_LABELS_HE`
- **Adapter יחיד:** `ui/src/utils/statusAdapter.js` — `toCanonicalStatus(label)`, `toHebrewStatus(value)`, `getStatusOptions()`

## 6. Acceptance Criteria (יישום)

- אין ערכי סטטוס "קשיחים" בשום מודול — רק Shared source (statusValues.js) דרך Adapter.
- Header filter מציג 4 סטטוסים (כולל "ממתין"); אופציות נוצרות/מסוננות דרך Adapter.
- DataLoaders ממפים לכל 4 ערכים קנוניים דרך `toCanonicalStatus` / `toHebrewStatus`.
- badges מציגים עברית אחידה לפי `toHebrewStatus(value)`.
- PhoenixFilterBridge תואם ל-SSOT דרך Adapter.
- כל שימוש חדש בסטטוס עובר דרך Adapter בלבד.

## 7. אסור

- אסור להגדיר רשימות מקומיות בכל מודול.
- אסור להוסיף תרגום עברי ידני בקוד.
- אסור לקוד "חריגים" ללא אישור SSOT.

## 8. מקורות תיעוד שתואמים

- `documentation/01-ARCHITECTURE/TT2_EFR_LOGIC_MAP.md` — Status Fields, Categories + הפניה ל-SSOT ✓
- מיפוי מקומות לעדכון: `documentation/02-DEVELOPMENT/TT2_STATUS_VALUES_CODE_MAP.md`

---

**log_entry | TEAM_10 | SYSTEM_STATUS_VALUES_SSOT | LOCKED | IMPLEMENTATION_MANDATE | 2026-02-12**
