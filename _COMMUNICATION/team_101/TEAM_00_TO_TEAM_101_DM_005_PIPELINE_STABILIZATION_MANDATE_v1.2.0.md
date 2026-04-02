---
id: DM-005
date: 2026-04-02
historical_record: true
version: 1.2.0
supersedes: TEAM_00_TO_TEAM_101_DM_005_PIPELINE_STABILIZATION_MANDATE_v1.1.0.md
dm_type: DIRECT_MANDATE
from: Team 00 (System Designer / Principal — בן־אנוש יחיד)
to: Team 101 (AOS Domain Architect / Stabilization Lead)
authority: Team 00 — constitutional authority, unrestricted
classification: IRON_RULE
pipeline_impact: BRIDGE_TO_PIPELINE
scope_boundary: Pipeline stabilization + dashboard 100% clean — zero TikTrack implementation
wsm_update_required: true (upon completion)
return_path: Team 101 → completion report → Team 100 architectural review → Team 00 sign-off
cascade_authorization: Team 101 may activate Team 61 / Team 51 / Team 90 / Team 170 as needed. All cascaded actions within this DM scope are implicitly authorized (DMP cascade ratification 2026-03-24).
status: ACTIVE
date_issued: 2026-03-24
date_updated: 2026-03-24
registry_ref: _COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md
supersedes_work_plan: S003-P011-WP002 (CANCELLED)
basis_documents:
  - TEAM_00_S003_CLOSURE_SCOPE_AND_PIPELINE_STABILITY_CRITERIA_v1.0.0.md
  - TEAM_101_TO_TEAM_00_S003_PIPELINE_STABILITY_ASSESSMENT_v1.0.0.md
v1.2.0_change: Added ITEM-0 Dashboard Hardening (Team 61) — dashboard must be 100% clean before verification run. ZERO console 404 errors. ZERO SEVERE logs.---

# DM-005 v1.2.0 — Pipeline Stabilization Mandate
## ייצוב Pipeline + הוכחת ריצה + Dashboard 100% — Team 101 כ-Lead

---

## §1 — מצב נוכחי: מה MET, מה נותר

### §1.1 — מה MET (לא לגעת)

| SC | מצב | ראיה |
|---|---|---|
| SC-AOS-01 | ✅ MET | WP099 cleared; ssot_check exit 0 |
| SC-AOS-04 | ✅ MET | GATE_2 five-phase — Canary level |
| SC-AOS-05 | ✅ MET | ssot_check agents_os exit 0 |
| SC-TT-01/02 | ✅ MET | pipeline_state_tiktrack COMPLETE; ssot_check tiktrack exit 0 |
| SC-TEST-01/02/03 | ✅ MET | 206 pytest + Layer1 + Selenium PASS |
| SC-UI-04/05 | ✅ MET | Refresh+last-updated confirmed; DM badge accurate (DM-004) |

### §1.2 — מה נותר (4 פריטים)

| פריט | SC | טיב |
|---|---|---|
| **ITEM-0** | SC-UI-01/02/03 | Dashboard hardening — אפס שגיאות console. **חדש ב-v1.2.0.** |
| **ITEM-1** | SC-AOS-02 | WP002 formal deferral document |
| **ITEM-2** | SC-AOS-03, SC-TT-03 | G0→G5 verification run |
| **ITEM-3** | SC-UI-01/02 | Dashboard sweep במהלך הריצה — הוכחה ויזואלית |

**סדר ביצוע חובה: ITEM-0 → ITEM-1 → ITEM-2+3 במקביל**

---

## §2 — ITEM-0: Dashboard Hardening (Team 61) — **PRE-CONDITION לכל שאר**

**⚠️ IRON RULE:** הריצה (ITEM-2) לא מתחילה עד שDashboard עומד ב-100% הגדרה הבאה:
> **אפס 404 errors בconsole. אפס SEVERE logs. כל שגיאה גלויה לאופרטור — חוסמת.**

### §2.1 — בעיות ידועות לתיקון (Team 61 מממש)

**קבוצה A — Team 10 canonical list files (404 מ-Roadmap):**

3 קבצים שה-Roadmap מנסה לטעון ולא קיימים:
```
_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md
_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md
_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md
```

**פתרון נדרש מ-Team 61:**
- בדוק את הלוגיקה ב-`pipeline-roadmap.js` שמנסה לטעון קבצים אלה
- שנה ל-graceful degradation: אם קובץ לא קיים → הצג placeholder UI ("List not available") במקום console error
- **אסור** ליצור קבצי stub ריקים כפתרון — זה masking; תיקון ה-JS הוא הפתרון הנכון

**קבוצה B — COMPLETE state probes (404 מ-Dashboard):**

3 קבצים שהDashboard מנסה לטעון כשstate = COMPLETE:
```
_COMMUNICATION/agents_os/prompts/tiktrack_COMPLETE_prompt.md
_COMMUNICATION/team_61/TEAM_61_S003_P013_WP001_DELIVERY_v1.0.0.md
_COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_S003_P013_WP001_MANDATE_v1.0.0.md
```

**פתרון נדרש מ-Team 61:**
- `pipeline-dashboard.js`: בדוק את הלוגיקה שמנסה לטעון gate prompt עבור `COMPLETE` state
- COMPLETE אינו gate — אין prompt. הלוגיקה צריכה לדלג על fetch כשgate = COMPLETE
- Delivery/mandate files של WP שהושלם: בדוק מדוע ה-Dashboard מנסה לטעון אותם; אם fetches של "optional artifacts" — הוסף בדיקת response.ok לפני logging כ-error
- כל fetch של optional artifact: שגיאת 404 = `console.warn` לכל היותר, **לא** console.error

**קבוצה C — SEVERE browser log warnings (כל סיבה):**
- הרץ Dashboard בdevelopment + פתח DevTools
- בדוק את כל ה-SEVERE logs (Network + Console)
- תעד ותקן **כל** SEVERE log שמקורו ב-JS של ה-Dashboard (לא מהדפדפן עצמו / external)

### §2.2 — תנאי קבלה ל-ITEM-0

```
□ פתח Dashboard ב-browser עם DevTools פתוח
□ טען state COMPLETE (המצב הנוכחי)
□ Console: ZERO 404 errors
□ Console: ZERO SEVERE logs שמקורם ב-Dashboard JS
□ Dashboard עדיין מציג את כל המידע הנכון (אין רגרסיה)
□ ssot_check exit 0 (לא השתנה)
□ pytest 206+ (לא השתנה)
□ Team 51: QA regression לאחר כל fix של Team 61
□ Screenshot evidence: Console DevTools + Network tab — clean
```

**רק לאחר שכל ✓ לעיל — ממשיכים ל-ITEM-1.**

---

## §3 — ITEM-1: WP002 Formal Deferral (SC-AOS-02)

**פעולה:** כתוב:
```
_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0.md
```

**תוכן חובה:**
- הצהרה: S003-P011-WP002 → `DEFERRED_TO_S004`
- סיבה: ייצוב AOS מספיק לביצוע TikTrack (מאושר ב-assessment)
- Scope lock: KB-26..KB-39 — כל הפריטים ה-unimplemented → S004
- WSM note: WP002 אינו active, לא יופיע ב-pipeline_state
- Authority: DM-005

**SC-AOS-02 → MET ✅ לאחר מסמך זה**

---

## §4 — ITEM-2: Pipeline Verification Run G0→G5 (SC-AOS-03 + SC-TT-03)

**תנאי מקדים:** ITEM-0 ו-ITEM-1 חייבים להיות COMPLETE.

**פעולה:** הרץ ריצת pipeline מלאה G0→G5 → COMPLETE על WP AOS מינימלי.

**WP מומלץ:** WP ייעודי לאימות בלבד — scope: documentation-only, ללא feature implementation. כותרת: "AOS Pipeline Verification Run — DM-005".

**תנאי PASS:**
```
□ ./pipeline_run.sh --domain agents_os עובד בכל gate ללא exit-code שגיאות
□ ssot_check --domain agents_os exit 0 לאורך כל הריצה
□ GATE_2 five-phase (2.1 → 2.1v → 2.2 → 2.2v → 2.3) עובר בשלמות
□ ריצה מלאה עד COMPLETE ללא blocking errors
□ ssot_check exit 0 גם לאחר COMPLETE
```

**הפסקה / escalation:** blocking error → עצור → תעד exact message+gate+command → הפעל Team 61 לתיקון → Team 51 QA → הרץ מחדש מתחילה.

---

## §5 — ITEM-3: Dashboard Full-Sweep (SC-UI-01/02) — **במהלך ITEM-2**

**פעולה:** screenshot/MCP snapshot בכל gate במהלך הריצה.

**תנאי PASS בכל gate:**
```
□ WHO: ברור מי עובד עכשיו
□ WHAT NOW: ברור מה לעשות
□ Mandate content: זמין / ניתן לנווט אליו
□ Two-phase gates: שני phases ביחד, active highlighted
□ ZERO 404 errors בconsole (ITEM-0 כבר פתר — לאמת שנשמר)
□ ZERO SEVERE logs בconsole
□ אין הודעת שגיאה blocking visible לאופרטור
```

**אם נמצאת בעיה UI בריצה** → הפעל Team 61, תיקון, QA, המשך ריצה.

---

## §6 — Cascade Authorization Matrix

| צוות | מתי | scope |
|---|---|---|
| **Team 61** | ITEM-0 (pre-condition); blocking pipeline error; UI bug | תיקון בלבד |
| **Team 51** | אחרי כל fix של Team 61 | QA regression (206+ tests) |
| **Team 90** | GATE_2 phase validation | per pipeline flow |
| **Team 170** | documentation closure | תיעוד בלבד |

**לא תפעיל:** Team 10/20/30 (TikTrack scope).
**Escalation:** blocking שאי אפשר לתקן ב-2 ניסיונות → עצור → Team 100.

---

## §7 — מחוץ לסקופ

| פריט | סיבה |
|---|---|
| KB-26..KB-39 implementation | DEFERRED_TO_S004 (ITEM-1) |
| GAP-002..008 | DEFER-001..007 — לא חוסמים |
| S003-P011-WP003 RBAC feature | Team 00 יחליט בנפרד |
| TikTrack implementation | Phase 2 — אחרי DM-005 CLOSED |
| AOS_v3 | S004 |
| Team 10 canonical files creation | Team 10 אחראי; Team 61 מתקן ה-JS בלבד |

---

## §8 — תוצרים נדרשים

| תוצר | נתיב |
|---|---|
| ITEM-0 evidence | Screenshots: Console+Network clean (BEFORE run) |
| WP002 deferral | `_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0.md` |
| Errata note | `_COMMUNICATION/team_101/TEAM_101_S003_STABILITY_SCOPE_ERRATA_v1.0.0.md` |
| SC Completion Report | `_COMMUNICATION/team_101/TEAM_101_DM_005_SC_COMPLETION_REPORT_v1.0.0.md` |

**SC Completion Report — חובה:**
```
- טבלת כל SC-AOS/TT/UI/TEST: MET / MET_VERIFIED / DEFERRED
- ראיות: תוצאות ריצה, screenshots כל gate (ITEM-3), Console clean (ITEM-0), ssot_check output
- הצהרה מפורשת: "Pipeline מוכן לפתיחת Phase 2 — TikTrack S003-P004"
- הצהרה מפורשת: "Dashboard — ZERO console 404 errors, ZERO SEVERE logs"
- חתימת Team 101
```

---

## §9 — Acceptance Criteria (Team 100 יבדוק)

| AC | Pass Condition |
|---|---|
| **AC-00** | **ITEM-0 COMPLETE:** Console screenshots מראים ZERO 404 + ZERO SEVERE לפני הריצה |
| AC-01 | WP002 deferral doc קיים עם KB-26..KB-39 scope lock |
| AC-02 | G0→G5 run: screenshot evidence לכל gate + ssot_check exit 0 לאורך הריצה |
| AC-03 | Dashboard snapshots לכל gate מראים WHO+WHAT+mandate |
| AC-04 | Two-phase gates: שני phases visible ביחד |
| AC-05 | Errata note קיים |
| AC-06 | SC Completion Report — הצהרת Phase 2 readiness + Dashboard 100% clean |
| AC-07 | pytest 206+ pass exit 0 לאחר כל שינוי קוד |
| AC-08 | ssot_check agents_os + tiktrack exit 0 לאחר כל השינויים |
| AC-09 | WSM updated: WP002 → DEFERRED; ready לפתיחת S003-P004 |

**AC-00 הוא gate — ללא AC-00 לא מאשרים ITEM-2.**

---

## §10 — Return Path

```
Team 101 → TEAM_101_DM_005_SC_COMPLETION_REPORT_v1.0.0.md
→ Team 100: architectural review (AC-00..09)
→ PASS: DM-005 CLOSED — Bridge: FORMALIZE (KB-26..KB-39 → S004 WP)
→ Team 00: פתיחת Phase 2 — S003-P004 TikTrack activation
```

---

## §11 — WSM Updates לאחר DM-005 CLOSED

| שדה | ערך |
|---|---|
| `agents_os_parallel_track` | `Pipeline + Dashboard stabilization verified 2026-03-24; ready for Phase 2 TikTrack` |
| S003-P011 registry WP002 | `DEFERRED_TO_S004` |
| STAGE_PARALLEL_TRACKS AOS | `STABLE — Dashboard 100% clean — awaiting S003-P004 TikTrack activation` |

---

**log_entry | TEAM_00 | DM_005 | v1.2.0 | DASHBOARD_100PCT_HARDENING_ADDED | ITEM_0_PRE_CONDITION | 2026-03-24**
