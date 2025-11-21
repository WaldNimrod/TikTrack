# SQLite to PostgreSQL Trigger Conversion

This document contains SQLite triggers and their PostgreSQL equivalents.

**Total Triggers:** 2

---

## `protect_base_currency_delete` on `currencies`

- **Timing:** BEFORE
- **Event:** DELETE

### SQLite Trigger

```sql
CREATE TRIGGER protect_base_currency_delete BEFORE DELETE ON currencies BEGIN SELECT CASE WHEN OLD.id = 1 THEN RAISE(ABORT, 'Cannot delete base currency record (ID=1)') END; END
```

### PostgreSQL Function

```sql
CREATE OR REPLACE FUNCTION protect_base_currency_delete_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT CASE WHEN OLD.id = 1 THEN RAISE EXCEPTION 'Cannot delete base currency record (ID=1)'
    
    -- Return appropriate record based on trigger type
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;
```

### PostgreSQL Trigger

```sql
CREATE TRIGGER protect_base_currency_delete
    BEFORE DELETE
    ON currencies
    FOR EACH ROW
    EXECUTE FUNCTION protect_base_currency_delete_fn();
```

**Note:** Auto-converted from SQLite - review for correctness

---

## `protect_base_currency_update` on `currencies`

- **Timing:** BEFORE
- **Event:** UPDATE

### SQLite Trigger

```sql
CREATE TRIGGER protect_base_currency_update BEFORE UPDATE ON currencies BEGIN SELECT CASE WHEN NEW.id = 1 THEN RAISE(ABORT, 'Cannot update base currency record (ID=1)') END; END
```

### PostgreSQL Function

```sql
CREATE OR REPLACE FUNCTION protect_base_currency_update_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT CASE WHEN NEW.id = 1 THEN RAISE EXCEPTION 'Cannot update base currency record (ID=1)'
    
    -- Return appropriate record based on trigger type
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;
```

### PostgreSQL Trigger

```sql
CREATE TRIGGER protect_base_currency_update
    BEFORE UPDATE
    ON currencies
    FOR EACH ROW
    EXECUTE FUNCTION protect_base_currency_update_fn();
```

**Note:** Auto-converted from SQLite - review for correctness

---

## Summary

| Trigger Name | Table | Timing | Event | Status |
|--------------|-------|--------|-------|--------|
| `protect_base_currency_delete` | `currencies` | BEFORE | DELETE | ✅ Auto-converted |
| `protect_base_currency_update` | `currencies` | BEFORE | UPDATE | ✅ Auto-converted |

---

## Migration Steps

1. Review each converted trigger for correctness
2. Test functions and triggers on development PostgreSQL instance
3. Apply to production after successful testing
