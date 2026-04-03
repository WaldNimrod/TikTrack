---
id: TEAM_190_AOS_V3_STAGE1B_ENTITY_DICT_REVIEW_v1.0.0
historical_record: true
from: Team 190
to: Team 100, Team 00
date: 2026-03-26
status: SUBMITTED
verdict: CONDITIONAL_PASS
blocker_count: 0
major_count: 3---

# Stage 1b — Entity Dictionary v2.0.0 Review

## עמדה כוללת: CONDITIONAL_PASS

**סיבה קצרה:** המודל השתפר משמעותית ועומד ברוב דרישות Stage 1b, אך נדרשות שלוש הבהרות נורמטיביות (MAJOR) כדי למנוע התנהגות לא דטרמיניסטית ב־pause/resume ובמעבר legacy→Assignment.

---

## ממצאים

### BLOCKER (0)
לא זוהו BLOCKER-ים בשלב זה.

### MAJOR (3)

#### M1 — חסרה נעילת רזולוציה בעת PAUSED (freeze semantics)
**ישות:** `Run`, `RoutingRule`, `Assignment`  
**בעיה:** המסמך קובע ש־resume חוזר לאותו gate/phase (`runs` invariant), אך מנגנון ה־resolver ממשיך להישען על `Assignment ACTIVE` בזמן אמת. אם שיוך הוחלף בזמן pause, ה־owner עלול להשתנות בלי החלטת resume מפורשת.  
**השפעה:** סיכון לניתוב שונה אחרי resume למרות שהריצה אמורה להמשיך מאותה נקודת מצב.  
**המלצה:** להוסיף invariant/contract מפורש: בזמן מעבר ל־`PAUSED` נשמר snapshot מחייב של `resolved_role_id/resolved_assignment_id/resolved_team_id` (או event חתום), ו־resume משתמש בו כברירת מחדל; חריגה מותרת רק עם אירוע מאושר Team 00.  
**evidence-by-path:** `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:313`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:352`

#### M2 — מנגנון migration ל־`resolve_from_state_key` לא נסגר עד הסוף
**ישות:** `RoutingRule`  
**בעיה:** השדה מסומן `DEPRECATED` ורק מייצר warning; לא מוגדר cutover חד (מתי warning הופך לשגיאה), ולא מוגדר fallback behavior קשיח במקרה ש־Assignment חסר.  
**השפעה:** dual-path routing עלול להישאר לאורך זמן ולייצר drift בין engines/סביבות.  
**המלצה:** לקבע policy בשלבים: (1) v2.x warning בלבד, (2) Stage 2 validator שמחייב כיסוי `role_id` מלא, (3) Stage 3/4 איסור על `resolve_from_state_key != NULL` והפיכה לשגיאת ולידציה. להוסיף סדר קדימויות מפורש ב־resolver.  
**evidence-by-path:** `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:298`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:305`

#### M3 — `can_block_gate` מוגדר חלקית ללא scope חוקתי
**ישות:** `PipelineRole`  
**בעיה:** השדה `can_block_gate` מגדיר יכולת חסימה ברמת role, אך ללא מגבלת scope לפי gate/phase/authority matrix (מי רשאי לחסום איפה).  
**השפעה:** עלול להיווצר מצב שבו תפקיד עם `can_block_gate=1` חורג ממטריצת הסמכויות השערית.  
**המלצה:** להוסיף constraint נורמטיבי: `can_block_gate` כפוף למטריצת Gate Authority (gate/phase + role + domain), עם ולידציה בזמן seed/CI ובזמן resolver decision.  
**evidence-by-path:** `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:150`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:154`

### MINOR (3)

#### m1 — השפעת `operating_mode` על ניתוב לא מנוסחת כ־invariant
**ישות:** `Team`  
**בעיה:** יש ENUM ברור ל־`operating_mode`, אבל אין כלל אכיפה מפורש איך mode משפיע על eligibility בניתוב בפועל.  
**השפעה:** פרשנות שונה בין resolverים.  
**המלצה:** להוסיף invariant קצר: מי eligible ב־GATE mode ומתי Advisory mode רק משנה Layer 4 template.  
**evidence-by-path:** `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:110`, `documentation/docs-governance/01-FOUNDATIONS/TEAM_TAXONOMY_v1.0.0.md:125`

#### m2 — חסר invariant שמחייב Event ייעודי ל־SUPERSEDE ב־Assignment
**ישות:** `Assignment`, `Event`  
**בעיה:** מצוין ש־SUPERSEDE דורש אישור/אודיט, אך אין קישור מחייב ל־`event_type` ספציפי + payload מינימלי.  
**השפעה:** אודיט חלקי או לא אחיד בין מימושים.  
**המלצה:** לחייב `TEAM_ASSIGNMENT_CHANGED` עם שדות חובה (`old_assignment_id`, `new_assignment_id`, `approved_by`, `reason_code`).  
**evidence-by-path:** `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:189`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:207`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:383`

#### m3 — שלמות ייחוס ל־`work_package_id` עדיין חוזית בלבד
**ישות:** `Assignment`, `Run`, `Event`  
**בעיה:** `work_package_id` מוגדר כשדה טקסט חיצוני ללא FK מפורש ב־Stage 1b.  
**השפעה:** סיכון לשגיאות כתיב/אי־עקביות בין טבלאות לפני Stage 4.  
**המלצה:** להוסיף כבר עכשיו contract ולידטור לוגי (pre-DDL) מול registry canonical, ולסמן target ל־FK/bridge ב־Stage 4.  
**evidence-by-path:** `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:183`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:330`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md:387`

### NOTES

1. יישור ה־ENUMs של `group`/`profession` מול `TEAM_TAXONOMY_v1.0.0` נראה תקין ועקבי.  
2. Separation בין `PipelineRole` (capability) ל־`Assignment` (binding ל־team) מוגדר היטב ומפחית coupling.  
3. טיפול `PAUSED` שופר לעומת v1.0.0; נדרש רק לסגור את חוזה הרזולוציה בזמן pause.

---

## שאלות פתוחות שנותרו לשלב הבא

1. האם שינוי Assignment בזמן `Run=PAUSED` מותר בכלל, ואם כן באילו תנאים ומי החותם המחייב?  
2. מהו תאריך/גרסה מדויקת שבה `resolve_from_state_key` הופך משדה legacy לשגיאת ולידציה?  
3. האם `can_block_gate` צריך להישאר ב־PipelineRole או לעבור למטריצת סמכויות נפרדת (`gate_authority_matrix`)?

---

## אישור / אי אישור gate

**Gate Decision:** `CONDITIONAL_PASS`  
ניתן להתקדם ל־Stage 2 **רק לאחר** תיקון M1–M3 בפרסום `v2.0.1` של המילון (ללא שינויי ארכיטקטורה רחבים מעבר למסגרת Stage 1b).

**log_entry | TEAM_190 | AOS_V3_STAGE1B_ENTITY_DICT_REVIEW | CONDITIONAL_PASS_WITH_ACTIONS | 2026-03-26**
