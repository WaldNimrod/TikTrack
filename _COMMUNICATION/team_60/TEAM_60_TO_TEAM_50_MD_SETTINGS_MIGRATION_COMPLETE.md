# Team 60 → Team 50: MD-SETTINGS — מיגרציה בוצעה

**id:** `TEAM_60_TO_TEAM_50_MD_SETTINGS_MIGRATION_COMPLETE`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 50 (QA)  
**date:** 2026-02-15  
**מקור:** דוח Gate-A — חסימת PATCH 503 (טבלת system_settings לא מיגרציה)

---

## סטטוס

טבלת **`market_data.system_settings`** נוצרה בהצלחה.

| פריט | פרטים |
|------|--------|
| **Migration** | `make migrate-md-settings` |
| **קובץ** | `scripts/migrations/md_system_settings.sql` |
| **תוצאה** | CREATE TABLE, CREATE INDEX, COMMENT — OK |

---

## אם עדיין 503 — צעדי אימות

1. **הרצת מיגרציה (אם לא רצת):**
   ```bash
   make migrate-md-settings
   ```

2. **אימות שהטבלה קיימת ב-DB שאליו ה-API מתחבר:**
   ```bash
   make verify-md-settings
   ```
   או: `python3 scripts/verify_md_system_settings.py`  
   → חייב להציג: `✅ market_data.system_settings EXISTS`

3. **אימות DATABASE_URL** — `api/.env` חייב להצביע על אותו DB:
   - Makefile: `TikTrack-phoenix-db` (Docker `tiktrack-postgres-dev`)
   - אם ה-DATABASE_URL מצביע על DB אחר — להריץ את המיגרציה גם שם

4. **אתחול מחדש של Backend** לאחר מיגרציה (אם רץ לפני):
   ```bash
   ./scripts/restart-backend.sh
   ```

---

## המשך

- **PATCH valid** — אמור להחזיר **200** (לא 503)
- ניתן לחזור על Gate-A — סעיף "PATCH valid → 200"

---

**log_entry | TEAM_60 | TO_TEAM_50 | MD_SETTINGS_MIGRATION_COMPLETE | 2026-02-15**
