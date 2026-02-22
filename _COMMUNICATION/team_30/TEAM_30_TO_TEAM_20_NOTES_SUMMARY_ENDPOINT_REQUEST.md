# Team 30 → Team 20: בקשת Endpoint — סיכום הערות (Notes Summary)
**project_domain:** TIKTRACK

**from:** Team 30 (Frontend)  
**to:** Team 20 (Backend)  
**date:** 2026-02-16  
**re:** MB3A Notes (D35) — סקשן "סיכום מידע" בעמוד הערות  
**אפיון מפורט:** [TEAM_30_NOTES_PAGE_DESIGN_DATA_COMPATIBILITY_REPORT.md](../../documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_NOTES_PAGE_DESIGN_DATA_COMPATIBILITY_REPORT.md) — §6, §7

---

## 1. רקע

עמוד הערות (notes.html, D35) כולל סקשן **"סיכום מידע"** עם ספירות לפי הבלופרינט.  
כרגע אין endpoint ייעודי — חישוב client-side מ־`GET /notes` אפשרי אך לא אופטימלי (טעינת כל ההערות לצורך ספירות בלבד).

---

## 2. אפיון מלא של הדרישה

### 2.1 מסמכי מקור

| מסמך | נתיב | תוכן רלוונטי |
|------|------|--------------|
| **דוח תאימות** | `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_NOTES_PAGE_DESIGN_DATA_COMPATIBILITY_REPORT.md` | §6 תאימות סקשן סיכום, §7 סטיות, §10 החלטות סופיות |
| **Blueprint** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/notes_BLUEPRINT.html` | שורות 1474–1496 — מבנה info-summary |

### 2.2 שדות סיכום (לפי הבלופרינט והחלטות)

| שדה | הגדרה | מקור נתונים |
|-----|--------|-------------|
| **סה"כ הערות** | ספירת הערות לא-מחוקות | `notes` WHERE `deleted_at IS NULL` |
| **הערות פעילות** | = סה"כ (הערות אין סטטוס; מחוק = לא מוצג) | זהה לסה"כ |
| **הערות חדשות** | נוצרו ב־**10 ימים אחרונים** | `created_at >= NOW() - INTERVAL '10 days'` |
| **סה"כ קישורים** | מספר **קבצים מצורפים** (attachments) | `note_attachments` — COUNT |
| **הערות מוצמדות** | `is_pinned = true` | `notes` |
| **הערות עם תגיות** | הערות עם `tags` לא-ריק | `notes` WHERE `tags IS NOT NULL AND array_length(tags,1) > 0` |
| **הערות על טיקרים** | `parent_type = 'ticker'` | `notes` |
| **הערות על טריידים** | `parent_type = 'trade'` | `notes` |

---

## 3. בקשת Endpoint

**מוצע:** `GET /notes/summary` (או `GET /api/v1/notes/summary`)  
**Response מוצע:**
```json
{
  "total_notes": 24,
  "recent_notes": 3,
  "total_attachments": 5,
  "pinned_notes": 2,
  "notes_with_tags": 8,
  "notes_by_parent_type": {
    "ticker": 12,
    "trade": 6,
    "trade_plan": 0,
    "account": 0,
    "general": 6
  }
}
```

**הערות:**
- `recent_notes` = 10 ימים אחרונים (החלטה סופית — ראה דוח תאימות §10).
- `notes_with_tags` — DB כולל `tags[]`; NoteResponse טרם מחזיר tags (סטיה מתועדת).
- **אין חובה** — אם לא ימומש, נחשב client-side מ־`GET /notes`.

---

## 4. הפניות

| פריט | נתיב |
|------|------|
| דוח תאימות | `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_NOTES_PAGE_DESIGN_DATA_COMPATIBILITY_REPORT.md` |
| Blueprint | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/notes_BLUEPRINT.html` |
| OpenAPI Addendum | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml` |

---

**log_entry | TEAM_30 | TO_20 | NOTES_SUMMARY_ENDPOINT_REQUEST | 2026-02-16**
