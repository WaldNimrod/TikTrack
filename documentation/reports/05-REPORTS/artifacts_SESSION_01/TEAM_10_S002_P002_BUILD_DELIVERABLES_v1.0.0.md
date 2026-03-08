# S002-P002 MCP-QA — מה מייצרים (Build Deliverables) v1.0.0

**program_id:** S002-P002  
**owner:** Team 10  
**date:** 2026-03-07  
**מטרה:** רשימת **תוצרי פיתוח ותשתית** שצריך לייצר. לא דוחות.

---

## פוקוס שלב ראשון

**תשתית שתיבנה על ידי צוות 60** — ותאפשר **לצוותים 50, 90, 190** להשתמש ב־**MCP** לצורך בדיקות ועבודה מול **Chrome** — **במקום ובנוסף ל־Selenium** שממומש היום.  
זה העדיפות כרגע.

---

## Team 60 (תשתית) — מה מייצרים

| # | תוצר | תיאור קצר |
|---|--------|-------------|
| 1 | **תשתית MCP ל־Chrome** | תשתית (runtime, כלים, אינטגרציה) שמאפשרת ל־50/90/190 להריץ בדיקות ועבודה מול Chrome דרך MCP — **בנוסף ל־Selenium** הקיים. |
| 2 | **סביבת runtime מוגדרת** | סביבה שבה רצים MCP + Selenium; תיעוד identity ו־constraints (TARGET_RUNTIME / LOCAL_DEV_NON_AUTHORITATIVE). |
| 3 | **משמורת מפתחות Ed25519** | מפתחות לחתימת evidence תחת שליטה מתועדת; גישה ושימוש ניתנים למעקב. |
| 4 | **שירות חתימה (Signing service)** | שירות/API/סקריפט שמחזיר signature block (key_id, signature_base64, signed_payload_sha256, signed_at_utc, signed_by_team) ל־MATERIALIZATION_EVIDENCE.json. |

**צרכנים:** צוותים 50, 90, 190 — משתמשים ב־MCP (ו־Chrome) לבדיקות ועבודה, בנוסף ל־Selenium.

---

## Team 61 — תפקיד בשלב זה

**צוות 61 עובד על repo מרוחק.** בשלב ראשון — **יועץ ומתאם** למערכת האיגנטים בהמשך. **לא** בונה התשתית ב-repo הזה; התשתית נבנית על ידי צוות 60.  
כשייכנסו לעובי הקורה — תיאום ואינטגרציה עם מערכת האיגנטים (לפי הצורך).

---

## Team 50 / 90 / 190 — שימוש בתשתית

| צוות | שימוש |
|------|--------|
| **50** | בדיקות (QA) — MCP + Chrome בנוסף ל־Selenium; ריצות parity; evidence תואם חוזה. |
| **90** | אימות (GATE_5/GATE_6) — שימוש ב־MCP ו־Chrome ככל שנדרש; פרוטוקול checkpoints ל־evidence. |
| **190** | ולידציה חוקתית — שימוש ב־MCP/Chrome ככל שנדרש בתהליכי האישור. |

---

## סדר ביצוע (שלב ראשון)

1. **Team 60** — בונה תשתית: MCP ל־Chrome (בנוסף ל־Selenium), runtime, מפתחות, שירות חתימה.  
2. **G3.5** — Team 10 חותם על readiness (כשתשתית 60 מוכנה).  
3. **Team 50** — משתמשים ב־MCP + Chrome + Selenium; ריצות parity ו־evidence.  
4. **Team 90** — מסמך checkpoints; שימוש ב־MCP/Chrome באימות.  
5. **Team 61** — ייעוץ/תיאום (remote repo); לא בונה תשתית ב-repo זה בשלב זה.

---

**חוזה Evidence (כל MATERIALIZATION_EVIDENCE.json):**  
provenance + signature block (Ed25519) + gate context + artifact path.

---

**log_entry | TEAM_10 | S002_P002_BUILD_DELIVERABLES | v1.0.0 | 60_primary_61_advisor | 2026-03-07**
