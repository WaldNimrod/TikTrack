# Team 61 → Team 120 (Hub) — בקשת הקמה: סוג צוות חדש וסביבת עבודה חדשה (Cursor Cloud Agent) — עדכון סביבה, משילות ומפתחות לפי קאנון

**date:** 2026-07-07
**historical_record:** true
**id:** TEAM_61_TO_TEAM_120_NEW_ENVIRONMENT_AND_TEAM_TYPE_PROVISIONING_REQUEST
**version:** 1.0.0
**owner:** Team 61 (Cloud Agent / DevOps Automation — Cursor Cloud Agent platform)
**addressee:** Team 120 (Hub — Platform/Team Provisioning)
**cc:** Team 100 (Chief System Architect), Team 170 (Spec & Governance), Team 10 (Gateway routing)
**project_domain:** multi (השפעה על tiktrack + agents_os)
**status:** ACTIVE — בקשת הקמה תפעולית (provisioning request)
**related:** `TEAM_61_TO_TEAM_100_CURSOR_CLOUD_ENVIRONMENT_REPORT_v1.0.0.md`, PR WaldNimrod/TikTrack#135

---

## 0. תקציר מנהלים

הוקמה בפועל **סביבת עבודה מסוג חדש — Cursor Cloud Agent VM** (הרצה אוטונומית/headless), אשר אינה תואמת אחד-לאחד את שלושת המנועים הרשומים בקאנון (`cursor` / `codex` / `claude-code`). בהתאם לבקשת ה-Principal, **Team 61 מבקש מ-Team 120 (Hub)** לבצע הקמה קאנונית של:
1. **סביבת עבודה חדשה** (environment/engine) — רישום ופרמטריזציה.
2. **הגדרות משילות** (Layer 1–4, Iron Rules, writes_to, gate authority, branch/push protocol).
3. **המפתחות/Secrets הדרושים** להפעלה מלאה של הסביבה.

הבקשה מנוסחת לפי הקאנון להקמת צוות מסוג חדש (`TEAM_TAXONOMY_v1.0.1`, `TEAMS_ROSTER_v1.0.0.json`, `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1`, `.cursorrules`, `PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0`).

> **הערה על סמכות:** Team 61 (implementation/devops) **אינו** מבצע קידום קאנוני ישיר (Knowledge Promotion Protocol). מסמך זה הוא **בקשה** בלבד; הרישום הקנוני ב-`documentation/` יבוצע ע"י Team 170 (governance) / Team 100 בתיאום Team 10 (Gateway routing).

---

## 1. הגדרת "הצוות מסוג חדש" ו"הסביבה החדשה"

### 1.1 סוג הצוות החדש (מוצע)
| שדה קאנוני | ערך מוצע | מקור |
|-------------|----------|------|
| Group | `implementation` | `TEAM_TAXONOMY §1` |
| Profession | `devops_engineer` (תת-סוג: **cloud_agent / autonomous automation**) | `TEAM_TAXONOMY §2` |
| Engine (חדש) | **`cursor-cloud-agent`** (headless/autonomous) — להוסיף ל-enum המנועים לצד `cursor`/`codex`/`claude-code` | `TEAM_TAXONOMY §3` |
| Domain | `multi` (מתחיל ב-tiktrack; ניתן להרחבה ל-agents_os) | roster |
| מיפוי ל-ID | Team 61 מתפקד כיום כ-Cloud Agent/DevOps Automation לפי `.cursorrules` | `.cursorrules` |

### 1.2 הסביבה החדשה (מפרט בפועל)
| רכיב | ערך |
|------|-----|
| Runtime | Cursor Cloud Agent VM (Ubuntu 24.04, kernel 6.12.58) |
| Backend | FastAPI :8082 (`api/venv`) |
| Frontend | Vite :8080 (npm) |
| DB | PostgreSQL 16.14 — **cluster apt מקומי** (ללא Docker), port 5432 |
| הפעלת שירותים | ידנית (ללא systemd): `sudo pg_ctlcluster 16 main start` + uvicorn + `npm run dev` |
| רשת | egress מוגבל (allowlist) |
| מודל התמדה | snapshot של ה-VM |

---

## 2. בקשה A — עדכון/הגדרת סביבת העבודה (Environment)

מבוקש מ-Team 120 להסדיר:

1. **רישום environment/engine חדש** `cursor-cloud-agent` ב-`TEAMS_ROSTER_v1.0.0.json` (`layer_1_identity.engine`) וב-`TEAM_TAXONOMY_v1.0.1 §3`, כולל תיאור "headless autonomous".
2. **קונפיגורציית `.cursor/environment.json`** (או snapshot) הרשמית לסביבה — כולל שכבת ה-update-script המאושרת:
   ```
   python3 -m venv api/venv
   api/venv/bin/pip install --upgrade pip
   api/venv/bin/pip install -r api/requirements.txt
   npm --prefix ui install
   ```
3. **מדיניות egress allowlist** — אישור דומייני market-data (Yahoo Finance / Alpha Vantage) לצורך בדיקות live; עד לאישור — ברירת מחדל dev `SKIP_LIVE_DATA_CHECK=true` + `RUN_LIVE_SYMBOL_VALIDATION=false`.
4. **נתיב בניית DB מבורך** — אימוץ `scripts/dev_bootstrap_schema.sql` + `scripts/dev_build_schema_from_orm.py` (עד לתיקון ה-DDL הקנוני; ראה דוח ל-Team 100).

---

## 3. בקשה B — הגדרות משילות (Governance / 4-Layer)

לפי המודל ב-`AGENTS.md` (4-Layer Context Model) ו-`TEAM_TAXONOMY §4` (Context Isolation), מבוקש לקבע עבור סוג הצוות החדש:

| Layer | תוכן שיש לקבע | מקור SSOT |
|-------|----------------|-----------|
| **Layer 1 — Identity** | `team_id`, name, role, `domain`, `engine=cursor-cloud-agent`, parent/children | `TEAMS_ROSTER_v1.0.0.json → layer_1_identity` |
| **Layer 2 — Authority** | `writes_to = _COMMUNICATION/team_61/`, `governed_by`, `gate_authority`, Iron Rules | roster `layer_2_authority` + `layer_4_procedure.iron_rules` |
| **Layer 3 — State** | WSM + `pipeline_state.json` + SSOT דומייני; לפרופסיה devops = SMALL + current WP/gate | WSM + pipeline_state |
| **Layer 4 — Task** | mandate + deliverables + AC מ-Team 10/100 | activation prompt |

**Iron Rules לקיבוע (הדגשים):**
- **No canonical promotion:** פלטים תפעוליים ל-`_COMMUNICATION/team_61/` בלבד; קידום דרך Team 10 → Team 170/70 לפי דומיין.
- **Cross-engine validation (Iron Rule #1):** builder ≠ validator — Cloud Agent (`cursor-cloud-agent`) בונה; ולידציה על engine שונה (codex/claude).
- **Branch/Push protocol:** commit format `S{NNN}-P{NNN}-WP{NNN}: Team 61 — ...`; עבודה ב-`main` למנדטים מאושרים / feature branches לניסויי; לענף Cloud Agent — prefix `cursor/…-31ad`.
- **Task closure = Seal (SOP-013)** בלבד.
- **Concurrent repo changes:** שינויים מקבילים לא-חופפים אינם חוסמים.

---

## 4. בקשה C — המפתחות/Secrets הדרושים (per canon)

מבוקש מ-Team 120 להסדיר הזרקת ה-Secrets הבאים דרך פאנל ה-Secrets של ה-Cloud Agent (personal/team/repo scope), **ללא שמירה ב-repo**:

| Secret | חובה/רשות | מטרה | הערה |
|--------|-----------|------|------|
| `JWT_SECRET_KEY` | חובה | חתימת JWT (≥64 תווים) | נוצר לוקאלית ב-dev; לסביבה משותפת — לקבע |
| `ENCRYPTION_KEY` | חובה | הצפנת שדות רגישים | ≥32 תווים |
| `DATABASE_URL` | חובה (מקומי) | חיבור Postgres | ב-Cloud מקומי: `postgresql://postgres:postgres@localhost:5432/tiktrack` |
| `ALPHA_VANTAGE_API_KEY` | רשות (מומלץ) | fallback ל-market data חי | נדרש כאשר Yahoo נכשל; בלעדיו הוספת tickers עלולה להיכשל (422) |
| `GITHUB_TOKEN` / gh auth | קיים | git/PR read + push | כבר מאומת ב-VM |
| מפתחות מנועי LLM (codex/gemini) | רשות | לזרימות AOS/ולידציה חוצת-מנועים | רלוונטי אם הסביבה תשרת גם דומיין agents_os |

> **הערה אבטחה:** ערכי secrets עלולים להופיע כ-`[REDACTED]` בפלט כלים. יש להעדיף סוג **Redacted Secret** למפתחות רגישים. אין לכלול secrets ב-commit (detect-secrets baseline קיים: `.secrets.baseline`).

---

## 5. Definition of Done לבקשה זו (מבוקש מ-Team 120)

1. `cursor-cloud-agent` רשום ב-`TEAMS_ROSTER` + `TEAM_TAXONOMY` (דרך Team 170/100).
2. `.cursor/environment.json` / snapshot רשמי + update-script מאושרים.
3. משילות Layer 1–4 + Iron Rules מקובעים לסוג הצוות.
4. Secrets §4 הוזרקו ואומתו (health של Backend + login עוברים).
5. מדיניות egress allowlist הוחלטה (אושרה או נדחתה עם נימוק).
6. אישור/ניתוב חזרה דרך Team 10; סגירה ב-Seal (SOP-013).

---

## 6. רפרנסים (תיעוד ודוקומנטציה)

- קאנון הקמת צוות/סביבה:
  - `documentation/docs-governance/01-FOUNDATIONS/TEAM_TAXONOMY_v1.0.1.md` (Group/Profession/Engine enums, Context Isolation)
  - `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json` (SSOT ל-4-Layer)
  - `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md`
  - `documentation/docs-governance/01-FOUNDATIONS/PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md`
  - `.cursorrules` (רשימת Squad IDs + onboarding); `AGENTS.md` (4-Layer + Cursor Cloud specific instructions)
  - `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`
- סביבה בפועל + ראיות:
  - `AGENTS.md → ## Cursor Cloud specific instructions`
  - `scripts/dev_bootstrap_schema.sql`, `scripts/dev_build_schema_from_orm.py`
  - PR **WaldNimrod/TikTrack#135** (`cursor/dev-environment-setup-31ad`)
  - `TEAM_61_TO_TEAM_100_CURSOR_CLOUD_ENVIRONMENT_REPORT_v1.0.0.md` (דוח מלווה)
- Secrets/אבטחה: `.secrets.baseline`, `.pre-commit-config.yaml` (hooks: detect-secrets, bandit)

---

## 7. סיכום

מבוקש מ-Team 120 לבצע הקמה קאנונית של סוג הצוות החדש (engine `cursor-cloud-agent`) והסביבה החדשה — עדכון סביבה (§2), משילות (§3) ומפתחות (§4) — בהתאם לקאנון, ולנתב אישור חזרה דרך Team 10 עם סגירת Seal. Team 61 זמין לתמיכה טכנית בהזרקת ה-Secrets ובאימות ה-health.

---

**--- PHOENIX TASK SEAL ---**
**TASK_ID:** TEAM_61_CURSOR_CLOUD_ENV_PROVISIONING_REQUEST
**STATUS:** OPEN — awaiting Team 120 provisioning (routed via Team 10)
**FILES_MODIFIED:**
  - `_COMMUNICATION/team_61/TEAM_61_TO_TEAM_120_NEW_ENVIRONMENT_AND_TEAM_TYPE_PROVISIONING_REQUEST_v1.0.0.md`
  - `_COMMUNICATION/team_61/TEAM_61_TO_TEAM_100_CURSOR_CLOUD_ENVIRONMENT_REPORT_v1.0.0.md`
**PRE_FLIGHT:** N/A (communication artifact — לא קוד ייצור)
**HANDOVER_PROMPT:** "Team 120: הוקמה סביבת Cursor Cloud Agent חדשה עבור TikTrack. נדרש רישום engine/environment, קיבוע משילות (Layer 1–4 + Iron Rules), והזרקת Secrets (§4). ניתוב אישור דרך Team 10; ראה דוח מלווה ל-Team 100 ו-PR #135."

**log_entry | TEAM_61 | NEW_ENV_AND_TEAM_TYPE_PROVISIONING_REQUEST_TO_TEAM_120_CREATED | ACTIVE | 2026-07-07**
