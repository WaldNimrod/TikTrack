# Team 10: מנדט יישום — System Status Values (SSOT → Code)

**מאת:** Team 10 (The Gateway)  
**לכל:** Team 30 (Frontend), Team 40 (UI), צוותים נוגעים  
**תאריך:** 2026-02-12  
**מקור:** החלטה אדריכלית נעולה — יישום אחיד, מנגנון חד‑פעמי

**⚠️ שער ביצוע:** מנדט זה **מבוצע כשער נוסף אחרי** השלמה וולידציה של תוכנית סגירת הפערים (Batch 1+2): Module/Menu Styling + Header Persistence + דוח סגירה. תוכנית העבודה הנוכחית: `05-REPORTS/artifacts/TEAM_10_BATCH_1_2_FINAL_REPORT_AND_CLOSURE_PLAN.md` סעיף 4.5. אין לשלוח את מנדט הסטטוסים לצוותים לפני סגירת הפערים.

---

## 1. עקרון (Single Source)

**SSOT יחיד → מקור קוד יחיד → Adapter יחיד → שימוש בכל מקום.**  
אין מימושים מקבילים; כל סטטוס עובר דרך המקור והאדפטר בלבד.

---

## 2. קבצים (הוטמעו)

| תפקיד | קובץ | תוכן |
|--------|------|------|
| **מקור יחיד** | `ui/src/utils/statusValues.js` | `STATUS_VALUES`, `STATUS_CANONICAL`, `STATUS_LABELS_HE` |
| **Adapter יחיד** | `ui/src/utils/statusAdapter.js` | `toCanonicalStatus(label)`, `toHebrewStatus(value)`, `getStatusOptions()` |

---

## 3. שימוש חובה

כל מקום שמציג או מסנן סטטוסים **חייב** להישען על ה-Adapter:

- **Header filter** (`unified-header.html` + JS) — אופציות מ-`getStatusOptions()`; מיפוי סינון ב-`toCanonicalStatus`.
- **DataLoaders** (D16/D18/D21) — מיפוי עברית↔קנוני רק דרך `toCanonicalStatus` / `toHebrewStatus`.
- **badges / EFR rendering** — תצוגת עברית דרך `toHebrewStatus(value)`.
- **PhoenixFilterBridge** — תיאום ל-SSOT דרך Adapter.

---

## 4. Acceptance Criteria

- [ ] אין ערכי סטטוס "קשיחים" בשום מודול — רק Shared source דרך Adapter.
- [ ] Header filter מציג 4 סטטוסים (כולל "ממתין"); אופציות מ-Adapter.
- [ ] DataLoaders ממפים לכל 4 ערכים קנוניים דרך Adapter.
- [ ] badges מציגים עברית אחידה לפי `toHebrewStatus(value)`.
- [ ] PhoenixFilterBridge תואם ל-SSOT דרך Adapter.
- [ ] כל שימוש חדש בסטטוס עובר דרך Adapter בלבד.

---

## 5. אסור

- אסור להגדיר רשימות מקומיות בכל מודול.
- אסור להוסיף תרגום עברי ידני בקוד.
- אסור לקוד "חריגים" ללא אישור SSOT.

---

## 6. SSOT ותיעוד

- **SSOT:** `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md`
- **מיפוי קוד:** `documentation/02-DEVELOPMENT/TT2_STATUS_VALUES_CODE_MAP.md`

---

**log_entry | TEAM_10 | SYSTEM_STATUS_IMPLEMENTATION_MANDATE | 2026-02-12**
