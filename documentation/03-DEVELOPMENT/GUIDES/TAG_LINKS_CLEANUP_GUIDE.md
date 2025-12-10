# מדריך מפתחים - מערכת ניקוי Tag Links

## סקירה כללית

מדריך זה מסביר כיצד להשתמש במערכת ניקוי Tag Links וכיצד להוסיף תמיכה ב-entity חדש.

## שימוש בסיסי

### ניקוי tags של entity מסוים

```python
from services.tag_service import TagService
from sqlalchemy.orm import Session

# מוחק את כל ה-tags של cash_flow עם ID 123
count = TagService.remove_all_tags_for_entity(db, 'cash_flow', 123)
print(f"Removed {count} tag links")
```

### ניקוי תקופתי של orphaned links

```python
from services.tag_service import TagService

# מנקה את כל ה-orphaned links
results = TagService.cleanup_orphaned_tag_links(db)
# results = {'cash_flow': 5, 'trade': 2, ...}

# מנקה רק links של cash_flow
results = TagService.cleanup_orphaned_tag_links(db, entity_type='cash_flow')
# results = {'cash_flow': 5}
```

## הוספת תמיכה ב-entity חדש

כדי להוסיף תמיכה ב-entity חדש במערכת ניקוי Tag Links, יש לבצע 3 צעדים:

### שלב 1: הוספת entity type ל-TagService

בקובץ `Backend/services/tag_service.py`, הוסף את ה-entity type ל-`SUPPORTED_ENTITY_TYPES`:

```python
SUPPORTED_ENTITY_TYPES: Set[str] = {
    # ... existing types ...
    "new_entity",  # הוסף כאן
}
```

### שלב 2: הוספת event listener ל-model

בקובץ `Backend/models/new_entity.py`, הוסף event listener:

```python
from sqlalchemy import event
import logging

logger = logging.getLogger(__name__)

# בסוף הקובץ, אחרי class NewEntity:
@event.listens_for(NewEntity, 'after_delete')
def new_entity_deleted(mapper, connection, target):
    """
    Event listener for when a new entity is deleted.
    Automatically removes all associated tag links.
    """
    try:
        from services.tag_service import TagService
        from sqlalchemy.orm import Session
        
        session = Session(bind=connection)
        TagService.remove_all_tags_for_entity(
            session, 'new_entity', target.id
        )
        session.close()
    except Exception as e:
        logger.error(f"Error cleaning up tags for new_entity {target.id}: {e}")
        # Don't raise - allow deletion to proceed even if tag cleanup fails
```

### שלב 3: הוספה ל-cleanup functions

ב-`TagService.cleanup_orphaned_tag_links()`, הוסף את ה-model:

```python
from models.new_entity import NewEntity

ENTITY_MODELS = {
    # ... existing models ...
    'new_entity': NewEntity,
}
```

## שימוש בסקריפט ניקוי

### Dry Run (ללא מחיקה)

```bash
# סריקה כללית
python3 Backend/scripts/cleanup_orphaned_tag_links.py

# סריקה לפי entity type
python3 Backend/scripts/cleanup_orphaned_tag_links.py --entity-type cash_flow

# עם verbose logging
python3 Backend/scripts/cleanup_orphaned_tag_links.py --verbose
```

### מחיקה בפועל

```bash
# מחיקת כל ה-orphaned links
python3 Backend/scripts/cleanup_orphaned_tag_links.py --remove

# מחיקה לפי entity type
python3 Backend/scripts/cleanup_orphaned_tag_links.py --remove --entity-type cash_flow
```

### הרצה תקופתית (cron)

```bash
# עם --schedule flag
python3 Backend/scripts/cleanup_orphaned_tag_links.py --schedule --remove
```

## Troubleshooting

### Event listener לא מופעל

**סימפטומים:**

- Tags לא נוקים בעת מחיקת entity
- Orphaned links נוצרים

**פתרונות:**

1. וודא שה-event listener נרשם (import של הקובץ)
2. בדוק שה-entity type מוגדר ב-`SUPPORTED_ENTITY_TYPES`
3. בדוק את ה-logs לשגיאות בניקוי tags

### שגיאות בניקוי tags לא מונעות מחיקה

**זה התנהגות תקינה!** Event listeners לא אמורים לחסום מחיקה. אם יש שגיאה בניקוי tags:

- השגיאה תירשם ב-log
- המחיקה תתבצע בכל מקרה
- אפשר לנקות tags ידנית אחר כך עם הסקריפט

### Orphaned links עדיין קיימים

אם יש orphaned links קיימים (מהימים לפני המערכת), אפשר לנקות אותם עם:

```bash
python3 Backend/scripts/cleanup_orphaned_tag_links.py --remove
```

## בדיקות

### בדיקה ידנית

1. צור entity עם tags
2. מחק את ה-entity דרך API
3. וודא שה-tags נוקו:

   ```sql
   SELECT * FROM tag_links WHERE entity_type = 'cash_flow' AND entity_id = <deleted_id>;
   ```

### בדיקת event listener

1. מחק entity ישירות דרך DB
2. וודא שה-event listener מופעל וניקה tags

### בדיקת cleanup script

```bash
# Dry run
python3 Backend/scripts/cleanup_orphaned_tag_links.py --verbose

# אם יש orphaned links, מחק אותם
python3 Backend/scripts/cleanup_orphaned_tag_links.py --remove
```

## הערות חשובות

1. **Transaction Safety:** Event listeners עובדים באותו transaction - אם המחיקה נכשלת, גם ניקוי ה-tags יבוטל

2. **Performance:** Event listeners לא מאיטים את המחיקה - הם מופעלים אחרי שהמחיקה הושלמה

3. **Error Handling:** שגיאות בניקוי tags לא מונעות מחיקה - זו החלטה מכוונת כדי לא לחסום תהליכי מחיקה

4. **Backward Compatibility:** המערכת עובדת עם הקוד הקיים - לא נדרש refactor

## תיעוד נוסף

- **ארכיטקטורה:** [TAG_LINKS_CLEANUP_SYSTEM.md](../../02-ARCHITECTURE/BACKEND/TAG_LINKS_CLEANUP_SYSTEM.md)
- **Tag Service:** [TAG_SERVICE_DEVELOPER_GUIDE.md](TAG_SERVICE_DEVELOPER_GUIDE.md)





















