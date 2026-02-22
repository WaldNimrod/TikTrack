# Team 30 → Team 10: דוח תאימות עמוד הערות — עיצוב vs מבנה נתונים
**project_domain:** TIKTRACK

**from:** Team 30 (Frontend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-16  
**re:** MB3A Notes Page — Design/Data Compatibility Check  
**מקורות:** Blueprint (Team 31), OpenAPI Addendum (Teams 60+20), DDL, Scope Input

---

## 1. סיכום ביצוע

| פריט | סטטוס |
|------|--------|
| **תיעוד API** | ✅ נמצא — `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml` |
| **Blueprint** | ✅ `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/notes_BLUEPRINT.html` |
| **DDL** | ✅ `PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (user_data.notes), `PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql` (note_attachments) |

---

## 2. מבנה עמוד (Blueprint vs ממשק נוכחי)

| רכיב | Blueprint | notes.content.html נוכחי |
|------|-----------|---------------------------|
| **תבנית** | LEGO: tt-container → tt-section | tt-container → tt-section ✅ |
| **קונטיינר עליון** | סיכום מידע + התראות פעילות (active-alerts) | קיים חלקית — סיכום ריק, חסר active-alerts |
| **קונטיינר שני** | טבלת הערות + פילטר איקונים (כותרת) | placeholder בלבד |

**תבנית קבועה:** מאושר — עמוד פשוט, שני קונטיינרים עיקריים.

---

## 3. תאימות פילטר סוג ישות (Blueprint vs API)

| Blueprint `data-filter-type` | API `parent_type` (query) | תאימות |
|------------------------------|---------------------------|---------|
| `all` | (ללא פרמטר) | ✅ |
| `account` | `account` | ✅ |
| `trade` | `trade` | ✅ |
| `trade_plan` | `trade_plan` | ✅ |
| `ticker` | `ticker` | ✅ |
| — | `general` | ⚠️ אין כפתור סינון נפרד בבלופרינט; "הכל" מציג גם general |

**מסקנה:** מיפוי תקין. `general` = הערות שלא קשורות לישות — מוצגות ב"הכל".

---

## 4. תאימות טבלה (Blueprint vs API/DB)

| עמודת Blueprint | שדה API/DB | הערה |
|-----------------|------------|------|
| אובייקט מקושר | `parent_type`, `parent_id` | ✅ — badge לפי parent_type + מזהה |
| תוכן | `title`, `content` | ✅ — תצוגה מקוצרת מ-content (או title) |
| קובץ מצורף | — | ✅ **החלטה:** מספיק להגביל בממשק — לא נדרש API |
| נוצר ב | `created_at` | ✅ |
| עודכן | `updated_at` | ✅ |
| פעולות | — | ✅ לוגיקה מקומית |

---

## 5. תאימות category (סוג הערה) — API vs DB

| ערך | DB (note_category) | API (NoteCreate/NoteResponse) |
|-----|--------------------|-------------------------------|
| TRADE | ✅ | ✅ |
| PSYCHOLOGY | ✅ | ✅ |
| ANALYSIS | ✅ | ✅ |
| GENERAL | ✅ | ✅ |

**הערה:** הבלופרינט מסנן לפי **parent_type** (ישות מקושרת) בלבד — לא לפי **category**. אין סטיה.

---

## 6. תאימות סקשן סיכום (Blueprint vs API)

| שדה סיכום בבלופרינט | מקור נתונים | מצב |
|---------------------|-------------|------|
| סה"כ הערות | — | ⚠️ **אין endpoint** `GET /notes/summary` |
| הערות פעילות | — | ✅ **החלטה:** הערות אינן בעלות סטטוס; מחוק = לא מוצג (מבחינת המשתמש לא קיים). בעתיד: סל מיחזור |
| הערות חדשות | `created_at` | ✅ **החלטה:** 10 ימים אחרונים — **צוות 10 לא מודע; נדרש תאום מול שאר הצוותים** |
| סה"כ קישורים | — | ✅ **החלטה:** מספיק הגבלה בממשק — לא נדרש API |
| הערות מוצמדות | `is_pinned` | ✅ ניתן לחשב מ־`GET /notes` |
| הערות עם תגיות | `tags` | ⚠️ **סטיה:** DB כולל `tags[]`, אך **NoteResponse אינו מחזיר tags** |
| הערות על טיקרים/טריידים | `parent_type` | ✅ ניתן לחשב מ־`GET /notes` |

---

## 7. סטיות שנמצאו

| # | תיאור | המלצה |
|---|--------|--------|
| 1 | **NoteResponse חסר `tags`** — DB יש `tags VARCHAR(255)[]` | בקשה לצוות 20: הוספת `tags` ל־NoteResponse (או GIN לצוות 10) |
| 2 | **אין endpoint סיכום** — סקשן "סיכום מידע" דורש ספירות | חישוב client-side מ־`GET /notes` (ללא filter) או בקשה ל־`GET /notes/summary` |

---

## 8. התראות פעילות (active-alerts)

קומפוננטת "התראות פעילות" זהה לעמוד התראות — ישות **Alert** (D34), לא Note.  
**אין תיעוד API להתראות (Alerts)** בתיקיית `documentation/07-CONTRACTS` — משימה נפרדת (Alerts אחרי Notes).

---

## 9. כפתורי פילטר — העברת styles

כפי שנקבע ב־TEAM_31_TO_TEAM_10_MB3A_GATE0_NOTES_SCOPE_INPUT: כפתורי הסינון משתמשים ב־inline styles; במסירה נדרש מעבר ל־classes. **תלות בצוות 40** — מתי יסופקו ה-classes.

---

## 10. החלטות סופיות (עדכון 16/02/2026)

| פריט | החלטה | תאום נדרש |
|------|--------|------------|
| **קישורים** | מספיק להגביל בממשק — לא נדרש API | — |
| **הערות פעילות** | הערות אין להן סטטוס. מחוק = לא מוצג (מבחינת המשתמש לא קיים). בעתיד: סל מיחזור | — |
| **הערות חדשות** | **10 ימים אחרונים** — ההגדרה הוחלטה | ⚠️ **צוות 10 לא מודע להחלטה — נדרש תאום מול שאר הצוותים** |

---

## 11. שאלות פתוחות לצוות 10

1. **Endpoint סיכום:** האם צפוי `GET /notes/summary`? אם לא — נחשב client-side מ־`GET /notes`?
2. **`tags` ב־NoteResponse:** האם להוסיף `tags` לצורך "הערות עם תגיות" בסיכום?

---

**log_entry | TEAM_30 | TO_TEAM_10 | NOTES_DESIGN_DATA_COMPATIBILITY_REPORT | 2026-02-16**
