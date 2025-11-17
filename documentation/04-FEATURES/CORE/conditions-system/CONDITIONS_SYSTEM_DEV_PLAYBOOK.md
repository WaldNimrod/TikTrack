# Conditions System – Developer Playbook

> **Purpose**: long-lived reference for engineers who extend או מתחזקים את מערכת התנאים.  
> **Scope**: backend services, frontend flows (ModalManagerV2 + ButtonSystem), Plan→Trade→Alert pipeline, API usage, tests, and common pitfalls.

---

## 0. How to Use This Guide
1. **Start** עם סעיפים 1–3 כדי להבין את הארכיטקטורה והמודולים המרכזיים.  
2. **המשך** לסעיפים 4–6 כאשר מיישמים UI/Modal flows או API חדשים.  
3. **בדיקות** – סעיף 8 מספק צ׳ק־ליסט מלא ל-Phase 5–6.  
4. **פתרון תקלות** – חפש קודם בסעיף 9 לפני דיבוג קוד.

קישורים רלוונטיים:
- מסמך מערכת: [`CONDITIONS_SYSTEM.md`](CONDITIONS_SYSTEM.md)
- מדריך משתמש: [`CONDITIONS_SYSTEM_USER_GUIDE.md`](CONDITIONS_SYSTEM_USER_GUIDE.md)
- API: [`CONDITIONS_SYSTEM_API_DOCUMENTATION.md`](CONDITIONS_SYSTEM_API_DOCUMENTATION.md)
- בדיקות: [`CONDITIONS_SYSTEM_TESTING_GUIDE.md`](CONDITIONS_SYSTEM_TESTING_GUIDE.md)

---

## 1. Architecture Snapshot
| Layer | Key Files | Notes |
| --- | --- | --- |
| **DB / ORM** | `Backend/models/{plan_condition,trade_condition,trading_method}.py` | כוללים `method_key`, `parameters_json`, `auto_generate_alerts`, `trigger_action`, `action_notes`. |
| **Services** | `Backend/services/{conditions_validation_service,alert_service,condition_evaluation_task}.py` | ולידציה, הערכה ברקע, ניהול התראות. |
| **Routes** | `Backend/routes/api/plan_conditions.py`, `trade_conditions.py` | CRUD + evaluate + alert toggle. |
| **Frontend Core** | `trading-ui/scripts/conditions/*` | מודולים: initializer, crud-manager, validator, translations, form-generator, ui-manager, modal-controller. |
| **Integrations** | `trade_plans.js`, `trade_plans-config.js`, `trades.js`, `trades-config.js` | טעינת סיכום תנאים, כפתורי Evaluate, ModalNavigationService. |
| **Shared Systems** | ButtonSystem, FieldRenderer, LoggerService, ModalManagerV2, ModalNavigationService, UnifiedCacheManager | חובה להשתמש במקום קוד מקומי. |

### Data Flow (text diagram)
```
User Action → conditions-ui-manager → conditions-crud-manager → /api/plan-conditions
      ↓                                                                ↓
ModalManagerV2 / ModalNavigationService                         PlanCondition ORM
      ↓                                                                ↓
Summary table (trade_plans.js) ← EntityDetailsAPI ← AlertService (stats)
      ↓
Plan → Trade (copy via trade_plan_service) → trade_conditions routes → Alerts
```

---

## 2. Backend Services & Tasks
1. **ConditionsValidationService (`Backend/services/conditions_validation_service.py`)**
   - מבצע בדיקת חובה/טווחים לכל 6 השיטות.
   - מחלץ `method_key` דרך cache של CRUD Manager (frontend) או DB (backend).
   - חובה להריץ `safeParse` לפרמטרים JSON.

2. **Plan Conditions Routes (`Backend/routes/api/plan_conditions.py`)**
   - `_ensure_conditions_tables` מריץ CREATE/ALTER idempotent לטבלאות (`plan_conditions`, `trade_conditions`, `condition_alerts_mapping`, `trading_methods`, `method_parameters`).
   - Endpoints זמינים:
     - `GET /trade-plans/<id>/conditions`
     - `POST /trade-plans/<id>/conditions`
     - `GET/PUT/DELETE /<condition_id>`
     - `POST /<condition_id>/evaluate`
     - `POST /<condition_id>/alert/toggle`
     - `DELETE /<condition_id>/alerts`

3. **Trade Conditions Routes (`Backend/routes/api/trade_conditions.py`)**
   - זהים במבנה ל-plan, אך פועלים על `trade_id`.
   - בזמן יצירת טרייד חדש מתוך תכנית, `trade_plan_service` מעתיק את הפרמטרים + `trigger_action` + `action_notes`.

4. **Condition Evaluation Task (`Backend/services/condition_evaluation_task.py`)**
   - רץ כל 20 דקות (scheduler חיצוני).
   - מושך נתוני שוק (`MarketDataQuote`) ומעדכן Alerts דרך `AlertService`.
   - מכבד `auto_generate_alerts`; אם False – שומר log אך לא יוצר Alert.

5. **AlertService (`Backend/services/alert_service.py`)**
   - יצירה/עדכון/ביטול התראות ומיפוי (`condition_alerts_mapping`).
   - פונקציות עיקריות: `create_or_update_alert_for_condition`, `cancel_condition_alerts`, `delete_condition_alerts`, `get_condition_alert_stats` (להוסיף aggregation לשימוש ב-Phase 5).

---

## 3. Frontend Architecture & Shared Utilities
### 3.1 Conditions Package (`trading-ui/scripts/conditions/…`)
- **initializer**: מוודא שכל הקבצים נטענו, יוצר אובייקטים גלובליים (`window.conditionsCRUDManager`, `window.conditionsModalController`, `window.conditionsUIManager`).
- **crud-manager**: עבודה מול `/api/plan-conditions`/`/api/trade-conditions`, ניהול cache מקומי, רישום לוגים (`ConditionsCRUD`).
- **validator**: חוקים לכל method + שימוש ב־`crudManager.getCachedTradingMethods`.
- **form-generator**: בונה טופס 2 עמודות, מנטרל submit טבעי, משתמש ב-ButtonSystem לפוטר, מנהל הסבר שיטה (`renderMethodExplanation`).
- **ui-manager**: מצב Form-only בתוך מודל התנאים, מאזין לאירועי `tradePlanConditionsUpdated`, מפעיל confirm delete דרך `showConfirmationDialog`.
- **modal-controller**: חיבור ל-ModalManagerV2 + ModalNavigationService, ניהול reload bypass (מונע page refresh אחרי save).

### 3.2 Shared Systems to reuse
- **ModalManagerV2 / ModalNavigationService** – אין לפתוח מודלים ידנית; השתמשו ב־`ModalNavigationService.registerModalOpen` וניהול breadcrumbs.
- **ButtonSystem** – כל כפתור (evaluate/add/edit/delete/toggle) מוכרח להיות `data-button-type` + מעובד ע״י `ButtonSystem.processButtons`.
- **FieldRendererService** – לרינדור badges סטטוס (Triggered/Not Triggered).
- **LoggerService** – תיוגים: `ConditionsFlow`, `ConditionsCRUD`, `ConditionsFormFlow`, `ConditionsReloadBypass`.
- **UnifiedCacheManager** – אחסון תנאים ברמת modal (ה-CRUD Manager כבר משתמש בו; בעת אינטגרציה חדשה יש להימנע מ-localStorage ידני).

---

## 4. Trade Plans Modal Flow (Phase 5.1 Baseline)
1. **Config (`trading-ui/scripts/modal-configs/trade-plans-config.js`)**
   - שורה דו-עמודתית: Tags (`col-md-4`) + Conditions controls (`col-md-8`).
   - בתוך controls: `#tradePlanConditionsSummary`, כפתור Evaluate (`data-button-type="REFRESH"`), כפתור Add (`data-button-type="ADD"`).

2. **Runtime (`trade_plans.js`)**
   - `setupTradePlanConditionsButton` מריץ `loadTradePlanConditionsSummary` כאשר המודל במצב edit ומוגדרת `entityId`.
   - Evaluate flow:
     ```js
     handleTradePlanEvaluateConditionsClick()
        → getTradePlanConditionsForEvaluation()
        → evaluatePlanConditions() // async POST לכל תנאי
        → tradePlanConditionEvaluations Map ← תוצאות
        → loadTradePlanConditionsSummary() מעדכן טבלה
     ```
   - טבלת הסיכום (`buildTradePlanConditionsSummaryTable`) מציגה:
     - Method, Operator, Parameters summary
     - Action (trigger_action + notes)
     - Last check (badge + timestamp)
     - Updated date
     - Buttons (edit/delete) – אייקונים בלבד, `data-onclick`.

3. **Events**
   - `tradePlanConditionsUpdated` (CustomEvent) משוגר ע״י `conditionsUIManager` לאחר create/update/delete.
   - EntityDetails UI מקשיב לאירוע ומרענן את Linked Items + Conditions summary.

---

## 5. Trades Modal Flow (Phase 5.2 Target)
*(דרוש יישום מלא – סעיף זה משמש כ-spec)*  
1. **Modal Config**: יש להרחיב `tradeConditionsControls` בדומה ל-trade plans (טבלה, Evaluate, toggle).  
2. **Initialization**: `setupTradeConditionsButton` צריך לקרוא ל-`loadTradeConditionsSummary` (יש ליישם) כאשר modal במצב edit.  
3. **Evaluation**: להשתמש באותן פונקציות CRUD אך עם `entityType='trade'`.  
4. **Plan→Trade Sync**: בהפעלת “Create Trade from Plan” לשמר:
   - `parameters_json`
   - `logical_operator`
   - `is_active`
   - `auto_generate_alerts`
   - `trigger_action`
   - `action_notes`
   - סטטיסטיקות הערכה האחרונות (אם רלוונטי) → לשקול שמירה בטבלת alerts במקום.

---

## 6. Plan → Trade → Alert Pipeline
1. **Create Condition** (Plan)
   - CRUD Flow: form → CRUD Manager → `/api/plan-conditions`.
   - `auto_generate_alerts` ברירת מחדל True; Toggle זמין ממסך העריכה.

2. **Generate Trade** (Plan→Trade)
   - `trade_plan_service` מעתיק תנאים דרך `TradeCondition` ORM (שדות 1:1).
   - שינוי תנאים בטרייד **לא** משפיע אוטומטית על התוכנית – חובה לעדכן כל ישות בנפרד.

3. **Evaluate Condition**
   - ידני (כפתור Evaluate Now) → `/api/plan-conditions/<id>/evaluate`.
   - משימת רקע (ConditionEvaluationTask) → כותבת Alerts + mapping.

4. **Alerts**
   - נוצרות בטבלה `alerts` עם `plan_condition_id` או `trade_condition_id`.
   - `AlertService.get_condition_alert_stats` מחזיר סיכום עבור הטבלה UI (פיתוח נדרש בשלב 4).

---

## 7. API Quick Reference
| Endpoint | Method | Description | Notes |
| --- | --- | --- | --- |
| `/api/plan-conditions/trade-plans/<plan_id>/conditions` | GET/POST | Fetch / create plan conditions | מחזיר רשימה מתורגמת; להוסיף סטטיסטיקות alerts. |
| `/api/plan-conditions/<id>` | GET/PUT/DELETE | Manage single condition | PUT מקבל dict params או string JSON. |
| `/api/plan-conditions/<id>/evaluate` | POST | Evaluate single condition | מחזיר payload `met`, `evaluation_time`, `details`. |
| `/api/plan-conditions/<id>/alert/toggle` | POST | Enable/disable auto alert | מחזיר מצב עדכני. |
| `/api/plan-conditions/<id>/alerts` | DELETE | Remove alerts | לשימוש בעת מחיקת תנאי. |
| `/api/trade-conditions/*` | … | זהה ל-plan אך עם `trade_id`. |
| `/api/alerts` | POST | יצירת התראה ידנית (במקרה הצורך) | להשתמש ב־`AlertService` validations. |

*Tip*: עבור בקשות GET/POST מרובות, להשתמש ב־`window.fetchJson` או wrapper אחר כדי לשמור על טיפול שגיאות מרכזי.

---

## 8. Testing & QA Checklist
1. **Unit (Frontend)**
   - `conditions-ui-manager`: verify post-save prompt, delete flow, event dispatch.
   - `conditions-crud-manager`: cache invalidation, error handling (`silent`/`forceRefresh`).
   - `conditions-form-generator`: validations, method explanation, ButtonSystem hydration.

2. **Unit (Backend)**
   - `test_conditions_master_data.py`
   - `test_condition_evaluation_task.py`
   - CRUD tests for plan/trade conditions (create/update/delete/evaluate/toggle).

3. **Manual Scenarios (Phase 6 spec)**
   - לכל שיטת מסחר: create → evaluate → verify.
   - Bulk evaluate (יותר מ-5 תנאים).
   - `auto_generate_alerts` off → וידוא שלא נוצרת התראה.
   - Missing market data → הצגת הודעת שגיאה ולא כשל silent.
   - Stale data → logs + fallback.
   - Performance: 100+ תנאים בתוכנית אחת → זמן תגובה < 30 שניות.
   - Full workflow: Plan → Activate → Trade → Alerts linking.

4. **Regression**
   - EntityDetails modal מציג תנאים מעודכנים.
   - Linked items חווים refresh כאשר אירוע `tradePlanConditionsUpdated` משוגר.

---

## 9. Troubleshooting & Gotchas
| Symptom | Root Cause | Fix |
| --- | --- | --- |
| הטופס נסגר מיד אחרי Save | כפתור `type="submit"` או reload חיצוני | השתמש ב־`type="button"` + `event.preventDefault`, ודא ש-`ConditionsReloadBypass` פעיל. |
| Evaluate Now מבצע קריאות כפולות | טבלה נטענת פעמיים (cache + fetch) | נעל cache (`tradePlanConditionsSummaryCache`) לפני תליית ה־Promise. |
| אין סטטוס בטבלה | לא מעדכנים `tradePlanConditionEvaluations` או חסרה קריאה ל־`loadTradePlanConditionsSummary` אחרי evaluate. | העבר Map כ-reference והפעל טבלה מחדש. |
| שדות `trigger_action`/`action_notes` ריקים אחרי copy | שכחת לכלול בשכבת ההעתקה או ב־CRUD payload. | ודא שכל השדות מועברים ב־`prepareConditionData`. |
| Modal מקונן לא נסגר נכון | ModalNavigationService לא קיבל `parentModalId` | בעת פתיחת Conditions modal, יש להעביר `parentModalId` ולטפל באירוע `modal-navigation:restore`. |

---

## 10. Implementation Checklist (Phase 5–7)
1. [ ] Outline מאושר (מסמך זה).  
2. [ ] Playbook מעודכן עם פרטי Phase 5.  
3. [ ] Trade Plans UI – Evaluate per row, toggles, alert stats.  
4. [ ] Trades UI – summary + evaluate + inheritance.  
5. [ ] Backend alert stats endpoint (plan & trade) + toggle wiring.  
6. [ ] Documentation updates (system + user guide + index).  
7. [ ] QA suite (10 סנריו + פריסה לוגים).  
8. [ ] Version bump + Git backup + deployment notes.

---

**Last Updated:** November 15, 2025  
**Maintainer:** TikTrack Engineering (Conditions Squad)  
Feedback/updates → פתחו issue ב-`documentation` או ציינו Pull Request עם קישורים למדדים רלוונטיים.

