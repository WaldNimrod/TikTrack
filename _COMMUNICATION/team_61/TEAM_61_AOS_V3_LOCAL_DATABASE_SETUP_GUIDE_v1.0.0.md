---
id: TEAM_61_AOS_V3_LOCAL_DATABASE_SETUP_GUIDE_v1.0.0
historical_record: true
from: Team 61 (AOS DevOps & Platform)
to: Operator / Principal
date: 2026-03-28
type: HOWTO — AOS v3 DB מקומי + בידוד מ-TikTrack
domain: agents_os
branch: aos-v3---

# מדריך צעד־אחר־צעד — בסיס נתונים מקומי ל־AOS v3

## מה המטרה

- מסד **PostgreSQL נפרד** רק ל־AOS v3 (לא מסד אפליקציית TikTrack).
- סיסמה ו־URL נשמרים **רק** בקובץ מקומי `agents_os_v3/.env` (לא ב־git, לא בצ’אט).

## איפה מה נמצא בריפו

| מה | נתיב |
|----|------|
| תבנית משתני סביבה (בלי סודות) | `agents_os_v3/.env.example` |
| הקובץ האמיתי שלך (אחרי העתקה) | `agents_os_v3/.env` — **לא** נכנס ל־git |
| סקריפט אתחול (פרוביז’ן Docker אוטומטי + מיגרציה 001 + seed) | `scripts/init_aos_v3_database.sh` |
| פרוביז’ן role+DB מול Docker מקומי | `agents_os_v3/db/ensure_local_postgres_for_aos.py` (נקרא מה־init) |
| הפעלת API ‎FastAPI‎ (ברירת מחדל פורט **8090**) | `scripts/start-aos-v3-server.sh` (רקע + ‎`/tmp/aos_v3_server.pid`‎); ‎`--foreground`‎ ללוגים בטרמינל |
| עצירה / ריסטארט API | `scripts/stop-aos-v3-server.sh` · `scripts/restart-aos-v3-server.sh` |
| אתחול מלא מקומי (DB + API) | `scripts/bootstrap_aos_v3_local.sh` (דילוג DB: ‎`AOS_V3_SKIP_DATABASE_INIT=1`‎) |
| משימות Cursor/VS Code | ‎`.vscode/tasks.json`‎ — Init AOS v3 DB, Start/Stop/Restart API, Bootstrap |
| בדיקת חיבור לשני מסדים (TikTrack + AOS) | `scripts/verify_dual_domain_database_connectivity.py` |
| חסימת סריקת `.env` ב־Cursor | `.cursorignore` (שורות `api/.env`, `agents_os_v3/.env`) |

---

## שלב 1 — הכנת הקובץ `agents_os_v3/.env`

1. בטרמינל, מתיקיית **שורש הריפו** (איפה ש־`agents_os_v3/` נמצא):
   ```bash
   cd /path/to/TikTrackAppV2-phoenix
   ```
2. העתק את התבנית:
   ```bash
   cp agents_os_v3/.env.example agents_os_v3/.env
   ```

---

## שלב 2 — מילוי `AOS_V3_DATABASE_URL`

### איפה זה קורה כשעובדים עם Docker?

| מה עושים | איפה |
|-----------|------|
| **שלב 2** (לערוך את ה־URL) | **במחשב המארח** — בקובץ `agents_os_v3/.env` ב־Cursor/VS Code. **לא** מריצים “שלב 2” בתוך קונטיינר. |
| **Postgres** | רץ **בקונטיינר Docker** (למשל `postgres:15`). |
| **HOST / PORT ב־URL** | מהמחשב שלך לכיוון הקונטיינר: בדרך כלל `127.0.0.1` ו־`5432` (או הפורט שמופיע ב־`docker ps` תחת `0.0.0.0:XXXX->5432/tcp` — אז `PORT=XXXX`). |
| **שלב 4** (`init_aos_v3_database.sh`) | **טרמינל על המארח** (Terminal / iTerm), אחרי `cd` לשורש הריפו — הסקריפט מתחבר ל־Postgres דרך הרשת המקומית כמו כל אפליקציה על המחשב. |

---

1. פתח ב**עורך** (Cursor / VS Code) את הקובץ:  
   **`agents_os_v3/.env`**
2. מצא את השורה:
   ```bash
   AOS_V3_DATABASE_URL=
   ```
3. מלא אחרי הסימן `=` את כתובת ה־Postgres **של מסד AOS בלבד**, בפורמט:
   ```text
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
   ```
   דוגמה טיפוסית למחשב מקומי:
   ```text
   postgresql://myuser:mypass@127.0.0.1:5432/aos_v3
   ```
4. **שמור** את הקובץ.

**חשוב:**  
- אל תריץ שורות שמתחילות ב־`#` בטרמינל (אלה הערות לקובץ בלבד).  
- אל תדביק את הסיסמה בצ’אט של Cursor.

---

## שלב 3 — פרוביז’ן אוטומטי (ברירת מחדל) מול Docker מקומי

כש־`AOS_V3_DATABASE_URL` מצביע על `127.0.0.1` / `localhost` (או `::1`) ופורט שממופה מקונטיינר Postgres:

- `bash scripts/init_aos_v3_database.sh` קורא ל־`agents_os_v3/db/ensure_local_postgres_for_aos.py` **לפני** המיגרציה.
- הסקריפט מזהה קונטיינר עם image שמכיל `postgres` ושמפרסם את הפורט מה־URL, קורא `POSTGRES_USER` / `POSTGRES_PASSWORD` מ־`docker inspect`, מתחבר ל־`postgres` מהמארח, ואז:
  - יוצר את ה־role מה־URL (אם חסר) עם הסיסמה מה־URL;
  - אם ה־role כבר קיים — **מעדכן סיסמה** לפי ה־URL (כדי שלא יישאר mismatch אחרי שינוי ב־`.env`);
  - יוצר את מסד הנתונים מהנתיב ב־URL עם `OWNER` = אותו משתמש (אם חסר).

**אופציונלי ב־`agents_os_v3/.env`:** אם יש כמה קונטיינרים Postgres — הגדר שם מלא:

```bash
AOS_V3_DOCKER_PG_CONTAINER=שם_הקונטיינר_שלך
```

(רק בשורה בקובץ; **אל** להקליד `AOS_V3_DOCKER_*` בטרמינל — zsh glob.)

**מתי עדיין ידני:** אין Docker, ה־host בר־URL הוא לא מקומי, או אין קונטיינר מתאים — אז תראה הודעת `INFO: ... skip` / `no Postgres Docker container found` וצריך ליצור role/DB בדרך שלך.

---

## שלב 4 — הרצת המיגרציה וה־seed

מתיקיית **שורש הריפו**:

```bash
bash scripts/init_aos_v3_database.sh
```

- הסקריפט **טוען רק** `agents_os_v3/.env` (לא `api/.env`).
- לפני המיגרציה: ניסיון **פרוביז’ן** (שלב 3) כשהתנאים מתקיימים.
- אם המסד כבר מלא מסכמה קודמת, תקבל הודעה על schema לא ריק — אז DB חדש או `DROP DATABASE` לפי מדיניות שלך.

---

## שלב 4ב (אחרי DB) — הפעלת שרת AOS v3 API

**חשוב:** פורט **8090** משמש גם את ‎`agents_os/scripts/start_ui_server.sh`‎ (מסלול v2 הקפוא). לא מריצים את שני השרתים על אותו פורט; לפיתוח — עצירת v2 או ‎`AOS_V3_SERVER_PORT=8091`‎.

```bash
bash scripts/start-aos-v3-server.sh
```

אימות:

```bash
curl -s http://127.0.0.1:8090/api/health
```

צפוי: ‎`{"status":"ok"}`‎. עצירה: ‎`bash scripts/stop-aos-v3-server.sh`‎.

**אתחול DB + שרת בפקודה אחת:**

```bash
bash scripts/bootstrap_aos_v3_local.sh
```

---

## שלב 5 — אימות שני המסדים (TikTrack + AOS) מנותקים

1. ודא שקיים **`api/.env`** עם `DATABASE_URL` של **TikTrack** (כרגיל לפרויקט).
2. ודא ש־**`agents_os_v3/.env`** מכיל `AOS_V3_DATABASE_URL` מלא (כמו בשלב 2).
3. הפעל venv עם `psycopg2` (למשל של ה־backend):
   ```bash
   source api/venv/bin/activate
   ```
4. הרץ:
   ```bash
   python3 scripts/verify_dual_domain_database_connectivity.py
   ```
   צפוי: הודעת **PASS** — שני חיבורים עובדים וה־URLים **לא זהים**.

---

## שלב 6 — איך סוכן Cursor “מקבל גישה” בלי שתשלח סיסמה לצ’אט

- הסיסמה נשארת ב־**`agents_os_v3/.env`** במחשב שלך.
- `.cursorignore` מונע מ־Cursor לסרוק את הקובץ להקשר AI.
- הסוכן יכול להריץ בטרמינל, למשל:
  ```bash
  bash -c 'set -a && source agents_os_v3/.env && set +a && python3 agents_os_v3/seed.py'
  ```
  כך הסוד נטען **מקומית** ולא מופיע בשיחה.

---

## פתרון בעיות קצר

| תסמין | מה לעשות |
|--------|-----------|
| `AOS_V3_DATABASE_URL is empty` | ערוך `agents_os_v3/.env` — השורה חייבת להכיל URL מלא אחרי `=` |
| `zsh: command not found: #` | לא להדביק שורות הערה מהמדריך כפקודות |
| `no matches found: AOS_V3_DOCKER_*` | לא להקליד כוכבית בטרמינל; הגדר משתנים ב־`.env` בשם מלא |
| שגיאת `psycopg2` | `source api/venv/bin/activate` או התקן תלויות מ־`agents_os_v3/requirements.txt` |
| `password authentication failed` אחרי שינוי סיסמה ב־`.env` | להריץ שוב את `init_aos_v3_database.sh` — ה־ensure מעדכן סיסמת ה־role לפי ה־URL; או לוודא ש־`POSTGRES_PASSWORD` בקונטיינר תואם לחיבור admin |

---

**log_entry | TEAM_61 | AOS_V3_BUILD | LOCAL_DB_SETUP_GUIDE | ISSUED | 2026-03-28**
