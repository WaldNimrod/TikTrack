# Evidence: יישום אחיד סטטוסים — מקור קוד + Adapter

**תאריך:** 2026-02-12  
**מבצע:** Team 10 (The Gateway)  
**מקור:** החלטה אדריכלית — System Status Values יישום אחיד (SSOT → Code)

---

## הוטמע

| # | פריט | נתיב |
|---|--------|------|
| 1 | מקור קוד יחיד | `ui/src/utils/statusValues.js` — STATUS_VALUES, STATUS_CANONICAL, STATUS_LABELS_HE |
| 2 | Adapter יחיד | `ui/src/utils/statusAdapter.js` — toCanonicalStatus, toHebrewStatus, getStatusOptions |
| 3 | SSOT עודכן | עקרון Single Source, נתיבי קוד, Acceptance Criteria, אסור |
| 4 | מנדט יישום | _COMMUNICATION/team_10/TEAM_10_SYSTEM_STATUS_IMPLEMENTATION_MANDATE.md |
| 5 | מיפוי קוד עודכן | TT2_STATUS_VALUES_CODE_MAP — סעיף מקור+Adapter, דרישת שימוש ב-Adapter בכל מקום |

---

**log_entry | TEAM_10 | STATUS_IMPLEMENTATION_TEMPLATE | 2026-02-12**
