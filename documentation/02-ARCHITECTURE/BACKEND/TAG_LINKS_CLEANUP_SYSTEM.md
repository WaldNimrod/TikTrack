# מערכת ניקוי Tag Links - ארכיטקטורה

## סקירה כללית

מערכת ניקוי Tag Links מספקת טיפול אוטומטי ומרכזי בניקוי tag links בעת מחיקת entities במערכת TikTrack. המערכת מונעת היווצרות tag links יתומים (orphaned) ומנקה קישורים קיימים בצורה אוטומטית ויציבה.

## בעיה

TagLink הוא polymorphic association - אין foreign key ישיר ל-entities, ולכן אין CASCADE DELETE ברמת DB. לפני היישום, נוצר צורך בניקוי ידני של tag links לאחר מחיקת entities, מה שהוביל ל:

- Tag links יתומים (מצביעים ל-entities שכבר לא קיימים)
- קוד כפול וידני ב-endpoints שונים
- אפשרות לשגיאות והזנחת ניקוי במקומות מסוימים

## פתרון ארכיטקטוני 3-שכבתי

המערכת מיושמת ב-3 שכבות:

### 1. SQLAlchemy Event Listeners (שכבה אוטומטית)

Event listeners על כל ה-entity models (`after_delete`) שמטפלים בניקוי אוטומטי של tag links בעת מחיקה.

**יתרונות:**
- עובד ברמת DB - מטפל גם במחיקות ישירות דרך DB
- אוטומטי לחלוטין - לא נדרש טיפול ידני
- Transaction-safe - עובד באותו transaction כמו המחיקה

**מימוש:**
- Event listeners מוגדרים ב-8 entity models:
  - `cash_flow.py`
  - `trade.py`
  - `trade_plan.py`
  - `execution.py`
  - `trading_account.py`
  - `ticker.py`
  - `alert.py`
  - `note.py`

**דוגמה:**
```python
@event.listens_for(CashFlow, 'after_delete')
def cash_flow_deleted(mapper, connection, target):
    """Event listener for when a cash flow is deleted."""
    try:
        from services.tag_service import TagService
        from sqlalchemy.orm import Session
        
        session = Session(bind=connection)
        TagService.remove_all_tags_for_entity(
            session, 'cash_flow', target.id
        )
        session.close()
    except Exception as e:
        logger.error(f"Error cleaning up tags for cash_flow {target.id}: {e}")
        # Don't raise - allow deletion to proceed even if tag cleanup fails
```

### 2. TagService Helper (שכבה מרכזית)

פונקציות מרכזיות ב-TagService לניקוי tags:

**`remove_all_tags_for_entity(db, entity_type, entity_id)`**
- מוחקת את כל ה-tag links של entity מסוים
- מעדכנת usage_count של ה-tags
- נקראת אוטומטית ע"י event listeners

**`cleanup_orphaned_tag_links(db, entity_type=None)`**
- מנקה tag links יתומים (links ל-entities שלא קיימים)
- שימושי לניקוי תקופתי ותחזוקה
- מחזיר dict עם מספר ה-links שנוקו לפי entity type

**`_decrement_usage(db, tag_id)`**
- Helper function להקטנת usage_count של tag
- נקראת אוטומטית בעת מחיקת tag link

**מיקום:** `Backend/services/tag_service.py`

### 3. API Layer Integration (שכבה יישומית)

**BaseEntityAPI.delete()**
- כולל ניקוי tags לפני מחיקה (גיבוי ל-event listeners)
- מבטיח ניקוי גם אם event listeners לא מופעלים

**API Endpoints**
- Event listeners מטפלים אוטומטית - לא נדרש קוד ידני
- הקריאות הידניות הוסרו מה-endpoints:
  - `trades.py`
  - `executions.py`
  - `tickers.py`
  - `cash_flows.py`

## Error Handling Strategy

1. **Event Listeners:**
   - שגיאות בניקוי tags לא מונעות מחיקת entity
   - שגיאות נרשמות ב-log אבל לא נזרקות (exception)
   - המחיקה ממשיכה גם אם ניקוי tags נכשל

2. **Transaction Safety:**
   - Event listeners עובדים באותו transaction כמו המחיקה
   - אם המחיקה נכשלת, גם ניקוי ה-tags יבוטל (rollback)
   - אם המחיקה מצליחה, גם ניקוי ה-tags מתבצע

3. **Performance:**
   - Event listeners מופעלים אחרי המחיקה (after_delete)
   - לא מאיטים את תהליך המחיקה עצמו
   - עובדים בתוך אותו transaction (לא נדרש commit נוסף)

## Integration Points

1. **Entity Models:**
   - כל entity model עם תמיכה ב-tags כולל event listener
   - Event listeners נרשמים אוטומטית בעת טעינת המודול

2. **TagService:**
   - פונקציות מרכזיות לניקוי tags
   - שימוש חוזר על ידי כל שכבות המערכת

3. **API Endpoints:**
   - BaseEntityAPI כולל ניקוי tags
   - Endpoints ספציפיים לא צריכים טיפול ידני

4. **Cleanup Script:**
   - `Backend/scripts/cleanup_orphaned_tag_links.py`
   - משתמש ב-TagService לניקוי תקופתי
   - תומך ב-dry-run ו-entity type filtering

## יתרונות הפתרון

1. **אוטומטי** - Event listeners מטפלים אוטומטית בכל מחיקה
2. **מרכזי** - כל הלוגיקה ב-TagService, שימוש חוזר
3. **יציב** - עובד גם במחיקות ישירות דרך DB
4. **לא פולשני** - Event listeners לא משנים את הקוד הקיים
5. **תחזוקתי** - קל להוסיף entity חדש (פשוט להוסיף event listener)

## תיעוד נוסף

- **מדריך מפתחים:** [TAG_LINKS_CLEANUP_GUIDE.md](../03-DEVELOPMENT/GUIDES/TAG_LINKS_CLEANUP_GUIDE.md)
- **Tag Service:** [TAG_SERVICE_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/TAG_SERVICE_DEVELOPER_GUIDE.md)








