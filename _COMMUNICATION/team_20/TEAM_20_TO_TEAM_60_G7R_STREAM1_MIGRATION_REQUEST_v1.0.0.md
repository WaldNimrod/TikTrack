# TEAM 20 → TEAM 60 | G7R Stream 1 — בקשת הרצת Migration

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_60_G7R_STREAM1_MIGRATION_REQUEST_v1.0.0  
**from:** Team 20 (Backend)  
**to:** Team 60 (DevOps & Platform)  
**cc:** Team 10  
**date:** 2026-01-31  
**historical_record:** true  
**status:** PENDING_EXECUTION  
**reference:** S002_P003_WP002_G7R_BATCH1_STREAM1_FOUNDATIONS

---

## בקשת ביצוע

נא להריץ את ה-migration הבא מול מסד הנתונים (TARGET_RUNTIME או סביבת ה-dev המתאימה):

**קובץ:** `scripts/migrations/g7r_stream1_alerts_notes_datetime_linkage.sql`

---

## הוראות הרצה

```bash
# מתוך שורש הפרויקט
psql "$DATABASE_URL" -f scripts/migrations/g7r_stream1_alerts_notes_datetime_linkage.sql
```

או באמצעות Python (אם psql לא זמין):
```bash
cd /path/to/TikTrackAppV2-phoenix
. api/venv/bin/activate
python -c "
import os
from pathlib import Path
# Load DATABASE_URL from api/.env
env = Path('api/.env')
if env.exists():
    for line in env.read_text().splitlines():
        if 'DATABASE_URL=' in line and not line.strip().startswith('#'):
            os.environ.setdefault('DATABASE_URL', line.split('=', 1)[1].strip().strip('\"').strip(\"'\"))
            break
import psycopg2
db = os.getenv('DATABASE_URL', '').replace('postgresql+asyncpg://', 'postgresql://')
conn = psycopg2.connect(db)
conn.autocommit = True
sql = Path('scripts/migrations/g7r_stream1_alerts_notes_datetime_linkage.sql').read_text()
for stmt in sql.split(';'):
    s = stmt.strip()
    if s and not s.startswith('--'):
        conn.cursor().execute(s + ';')
conn.close()
print('Migration completed')
"
```

---

## בדיקות לאחר ההרצה

נא לאמת את המצב כפי שהוגדר:

| בדיקה | שאילתת אימות |
|-------|--------------|
| 1. target_datetime קיים ב-alerts | `SELECT column_name FROM information_schema.columns WHERE table_schema='user_data' AND table_name='alerts' AND column_name='target_datetime';` |
| 2. parent_datetime קיים ב-notes | `SELECT column_name FROM information_schema.columns WHERE table_schema='user_data' AND table_name='notes' AND column_name='parent_datetime';` |
| 3. target_type מקבל NULL | `SELECT COUNT(*) FROM user_data.alerts WHERE target_type IS NULL;` — מותר > 0 |
| 4. אין general ב-target_type | `SELECT COUNT(*) FROM user_data.alerts WHERE target_type = 'general';` — צריך 0 |
| 5. trigger_status כולל rearmed | `SELECT conname FROM pg_constraint WHERE conrelid = 'user_data.alerts'::regclass AND conname LIKE '%trigger_status%';` + בדיקת CHECK |
| 6. notes parent_type כולל datetime | `SELECT conname FROM pg_constraint WHERE conrelid = 'user_data.notes'::regclass AND conname LIKE '%parent_type%';` |

---

## דוגמת דוח אימות (לאחר הרצה)

```text
Migration: g7r_stream1_alerts_notes_datetime_linkage.sql
Run time: YYYY-MM-DD HH:MM
DB: [connection string — host only]
Result: OK / FAIL
Checks:
  1. target_datetime: EXISTS
  2. parent_datetime: EXISTS
  3. general rows corrected: 0 remaining
  4. trigger_status rearmed: ADDED
  5. notes parent_type datetime: ADDED
```

---

## הערות

- ההרצה דורשת הרשאות ALTER TABLE על `user_data.alerts` ו־`user_data.notes`.
- יש לבצע גיבוי DB לפני הרצה (לפי נוהלי Team 60).

---

**log_entry | TEAM_20→TEAM_60 | G7R_STREAM1_MIGRATION_REQUEST | PENDING | 2026-01-31**
