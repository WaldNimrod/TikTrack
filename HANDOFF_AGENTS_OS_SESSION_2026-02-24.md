# HANDOFF — Agents_OS Architecture Session
**תאריך:** 2026-02-24
**מקור:** Claude Code (Pro) — session ראשוני עם סביבת הפרויקט
**מיועד ל:** כל session עתידי (Claude / Cursor / Codex) שממשיך את עבודת Agents_OS

---

## 1. הקשר — מה הסשן הזה עשה

סריקה ראשונית מלאה של הפרויקט + הבנת הארכיטקטורה + תכנון ראשוני של מערכת Agents_OS.
לא נכתב קוד. התוצר הוא תכנון + המלצות.

---

## 2. סקירת המערכת

### TikTrack
אפליקציית מעקב פיננסי ותיק השקעות.
**Stack:** FastAPI + PostgreSQL (backend) / React 18 + Vite (frontend)
**מיקום:** `/api/` (backend), `/ui/` (frontend)

### Agents_OS
מערכת אוטומציה לתהליך הפיתוח. דומיין מבודד לחלוטין מ-TikTrack (אפס imports).
**מיקום:** `/agents_os/`
**מצב עכשווי:** `validator_stub.py` קיים אך הוא stub בלבד — הלוגיקה טרם מומשה.

---

## 3. המצב הנוכחי (מ-WSM)

**מקור:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` → בלוק `CURRENT_OPERATIONAL_STATE`

| שדה | ערך |
|-----|-----|
| active_stage_id | S001 |
| active_work_package_id | S001-P001-WP002 |
| current_gate | **GATE_8 (OPEN)** |
| last_gate_event | GATE_7 APPROVED — Nimrod — 2026-02-23 |
| next_required_action | Team 70 מבצע GATE_8 closure (AS_MADE + cleanup + archive) → Team 90 validates |
| next_responsible_team | Team 70 |

**WP001** — GATE_8 PASS ב-2026-02-22 — lifecycle שלם.
**WP002** — ממתין לביצוע GATE_8 על ידי Team 70.

---

## 4. מבנה הצוותים

### הבסיס החשוב ביותר
**בית התוכנה הזה מורכב מאדם אחד (Nimrod) וכל שאר ה"צוותים" הם LLM sessions.**
הממשל כולו מיועד לנהל ולסנכרן בין sessions שונים על filesystem משותף.

### מפת הצוותים

| צוות | תפקיד | שכבה |
|------|--------|-------|
| Team 00 (Nimrod) | Chief Architect — אישור סופי | אדריכלות |
| Team 100 | Dev Architecture Authority — מגדיר gates ותהליכים | אדריכלות |
| Team 170 | Spec Owner — כותב SPEC originals | אדריכלות |
| Team 190 | Validator + Submission Owner — מאמת, בלוקר | אדריכלות |
| Team 70 | Librarian — הסמכות היחידה שכותבת לתיקיות קנוניות | ידע |
| Team 10 | Gateway / Orchestrator — מתזמר GATE_3, מנדטים | ביצוע |
| Team 20 | Backend Implementation | ביצוע |
| Team 30 | Frontend Implementation | ביצוע |
| Team 40 | UI Assets / Design | ביצוע |
| Team 50 | QA | ביצוע |
| Team 60 | DevOps | ביצוע |
| Team 90 | External Validation — סמכות GATE_5–8 | ולידציה |

**הגדרות תפקידים:** `documentation/docs-governance/` — תיקייה ייעודית
**תקשורת בין צוותים:** `_COMMUNICATION/team_X/`

---

## 5. מחזור חיים — שערים 0–8

```
[Team 190]              [Team 10]         [Team 90]
GATE_0 → GATE_1 → GATE_2 → GATE_3 → GATE_4 → GATE_5 → GATE_6 → GATE_7 → GATE_8
Spec     Spec     Arch      Impl     QA       Dev      Arch     Human    Docs
LOD200   LOD400   Validate  (9 sub)           Validate Validate (Nimrod) Closure
```

**Gate ownership:**
- GATE_0–2: Team 190 (owner + WSM updater)
- GATE_3–4: Team 10 (owner + WSM updater)
- GATE_5–8: Team 90 (owner + WSM updater)

**GATE_3 sub-stages (9):**
G3.1 SPEC_INTAKE → G3.2 SPEC_IMPLEMENTATION_REVIEW → G3.3 ARCH_CLARIFICATION_LOOP →
G3.4 WORK_PACKAGE_DETAILED_BUILD → **G3.5 WORK_PACKAGE_VALIDATION_WITH_TEAM_90** →
G3.6 TEAM_ACTIVATION_MANDATES → G3.7 IMPLEMENTATION_ORCHESTRATION →
G3.8 COMPLETION_COLLECTION_AND_PRECHECK → G3.9 GATE3_CLOSE_AND_GATE4_QA_REQUEST

**חוק ברזל:** Lifecycle לא שלם ללא GATE_8 PASS.
**חוק ברזל:** כל gate closure מחייב עדכון WSM על ידי ה-gate owner לפני המשך.

---

## 6. ממשקי מפתח (SSM)

**הירארכיה:** Roadmap → Stage (S) → Program (P) → Work Package (WP) → Task (T)
**מספור:** `S{NNN}-P{NNN}-WP{NNN}-T{NNN}`
**Gate binding:** רק ב-Work Package level
**Active stage:** `GAP_CLOSURE_BEFORE_AGENT_POC`
**Execution order lock:** S001-P002 FROZEN עד שWP001 מסיים GATE_8 ✅ (כבר הושלם)

**חוקי ברזל מרכזיים (SSM §1):**
- **No-Guessing Rule:** עמימות = CLARIFICATION_REQUEST. אין הנחות.
- **Precision 20,8:** כל חישוב כספי ב-NUMERIC(20,8)
- **RTL Native:** UI בעברית עם Logical Properties בלבד (Start/End)
- **Authority separation:** אדריכלות (100+) vs ביצוע (10-90) — הפרדה מוחלטת

---

## 7. החזון של Agents_OS — מה מנסים לבנות

### הבעיה הנוכחית
```
Nimrod → [copy-paste] → Team 10 → [copy-paste] → Team 90 → [copy-paste] → Team 10 ...
```
כל "שיחה" בין צוותים עוברת דרך Nimrod שמעתיק-מדביק קבצים וורפמטים בין sessions.

### המטרה הסופית
```
Nimrod → [spec] → Agents_OS Machine → [validated, tested code]
```

### הדרך — 3 שלבים
**א.** הגדרת ה-נטיבים (connectives) המרכזיים בין הצוותים
**ב.** בניית מערכת מודולרית המבוססת על הנטיבים + נוהל השערים
**ג.** מערכת שמקבלת feature spec ומחזירה קוד אחרי תהליך מלא

**עיקרון:** לא 6 חודשי פיתוח. הדרגתי ומודולרי — נטיב אחד בכל פעם.

---

## 8. ארכיטקטורת הנטיבים — ההצעה

### התובנה המרכזית
**הממשל הקיים הוא כבר ה-spec של האוטומציה.**
כל artifact שצוות כותב לצוות אחר = נטיב מוגדר עם INPUT schema, OUTPUT schema, תנאי הפעלה ולוגיקת סיום.
מה שחסר: **runtime דק שמחבר את הכל.**

### מבנה מוצע

```
agents_os/
├── connectives/
│   ├── engine.py              # לולאת ולידציה גנרית — הלב
│   ├── g35_validation.yaml    # נטיב: Team10 ↔ Team90 (G3.5)
│   ├── gate5_validation.yaml  # נטיב: Team10 ↔ Team90 (GATE_5)
│   └── spec_validation.yaml   # נטיב: Team170 ↔ Team190 (GATE_1-2)
├── runtime/
│   ├── wsm_reader.py          # קורא/כותב CURRENT_OPERATIONAL_STATE
│   ├── artifact_io.py         # קריאה/כתיבה _COMMUNICATION/
│   └── llm_client.py          # wrapper: OpenAI + Anthropic
└── roles/
    └── loader.py              # טוען role definition מ-docs-governance
```

### פורמט נטיב (YAML)

```yaml
connective_id: G3_5_VALIDATION
requester_team: team_10
validator_team: team_90
max_retries: 5
llm_provider: openai        # או anthropic
trigger:
  gate: GATE_3
  sub_stage: G3.5
request_schema: VALIDATION_REQUEST
response_schema: VALIDATION_RESPONSE
termination_states: [PASS, ESCALATE, STUCK]
```

**עיקרון:** הוספת נטיב חדש = קובץ YAML אחד בלבד. ללא קוד חדש.

### הלוגיקה של engine.py (פסאודו-קוד)

```python
def run_validation_loop(connective_config, initial_request_path):
    for attempt in range(connective_config.max_retries):
        # 1. קרא request artifact
        request = artifact_io.read(request_path)

        # 2. טען role definition של הולידטור
        validator_role = roles.load(connective_config.validator_team)

        # 3. קרא קונטקסט SSM + WSM
        context = wsm_reader.get_current_state()

        # 4. קרא ל-LLM
        response = llm_client.call(
            system=validator_role,
            context=context,
            artifact=request
        )

        # 5. כתוב response artifact
        response_path = artifact_io.write(response, connective_config)

        # 6. בדוק תוצאה
        if response.verdict == "PASS":
            wsm_reader.update_gate_state("PASS")
            return LoopResult.PASS
        if response.verdict == "ESCALATE":
            return LoopResult.ESCALATE

        # 7. FAIL — טען requester role, תקן וחזור
        requester_role = roles.load(connective_config.requester_team)
        corrected = llm_client.call(
            system=requester_role,
            context=context,
            artifact=response
        )
        request_path = artifact_io.write(corrected, connective_config)

    return LoopResult.STUCK  # עבר max_retries
```

---

## 9. משאבים טכניים זמינים

| משאב | פרטים |
|------|--------|
| OpenAI API | חשבון קיים |
| Anthropic (Claude) | חשבון Pro |
| הגדרות תפקידים | `documentation/docs-governance/` — תיקייה ייעודית |
| דוגמאות artifacts | `_COMMUNICATION/team_10/`, `_COMMUNICATION/team_90/` |
| WSM (state machine) | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` |
| סביבת פיתוח ראשית | Cursor (עם .cursorrules) — רוב העבודה הטכנית |

---

## 10. ממצאים חשובים מהסריקה

### נקודות כשל שאותרו

**כשל 4 — עומס הגשה ב-Gate_6 (7 קבצים)**
חבילת ה-7 קבצים כבדה ויוצרת שגיאות. ניראה בהיסטוריה של commits: `REREVIEW`, `REMEDIATION`, `F1`, `F2`.
**המלצה:** validator אוטומטי שבודק מבנה חבילה לפני הגשה.

**כשל 5 — צבירת קבצים ב-`_COMMUNICATION/`**
אם GATE_8 לא מבוצע בזמן, תיקיות `_COMMUNICATION/` גדלות ללא שליטה.
Context loading הופך יקר — agents מתחילים להחמיץ מידע.
**המלצה:** ביצוע Gate_8 קפדני + cleanup אוטומטי כחלק מהנטיב.

### מה עובד טוב
- הפרדת הרשויות (ארכיטקטורה vs ביצוע) — מנגנון הגנה אמיתי מ-hallucination
- WSM כ-single operational truth — פתרון אלגנטי לסנכרון בין sessions
- No-Guessing Rule — מאלץ דיוק, מונע drift

---

## 11. השלבים הבאים המיידיים

### עכשיו (GATE_8 של WP002)
1. **Team 70** מבצע: AS_MADE report + developer guides update + cleanup + archive
2. **Team 90** מאמת את חבילת GATE_8
3. עדכון WSM ל-GATE_8 PASS

### WP003 — הנטיב הראשון
**לא הוחלט סופית** — Nimrod צריך לקבוע איזה לופ ולידציה הכי כואב לאוטומט ראשון.
המועמדים:
- **G3.5** (Team10 ↔ Team90 — work plan validation) — הכי תכוף
- **GATE_1/2** (Team170 ↔ Team190 — spec validation) — הכי כבד

### לפני כתיבת קוד — צריך לבדוק
1. **פורמט הגדרות התפקידים** ב-`docs-governance/` — מה המבנה שלהן?
2. **דוגמת VALIDATION_REQUEST + RESPONSE** מ-`_COMMUNICATION/` — מה הפורמט המדויק?
3. **האם יש כבר API keys מוגדרים** ב-`.env` או בקובץ config?

---

## 12. ניווט מהיר — קבצים קריטיים

| מה | נתיב |
|----|------|
| מצב נוכחי (SSOT) | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` → CURRENT_OPERATIONAL_STATE |
| חוקה קנונית | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` |
| Gate Model | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` |
| Gate lifecycle + owners | `documentation/docs-governance/01-FOUNDATIONS/GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md` |
| Master Index | `00_MASTER_INDEX.md` |
| Task list | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` |
| Agents_OS | `agents_os/` |
| הגדרות תפקידים | `documentation/docs-governance/` — תיקייה ייעודית |

---

**log_entry | CLAUDE_CODE | SESSION_HANDOFF | AGENTS_OS_ARCHITECTURE_PLANNING | 2026-02-24**
