# Team 20 — Backend Implementation
**Role:** Server-side development — API, business logic, database, runtime services.
**Scope:** api/ directory — models, schemas, services, routers, integrations.
**Domain lane:** TIKTRACK + SHARED programs only.
**Reports to:** Team 10 (Gateway)
**Constraints:**
- ULID for all external IDs (uuid_to_ulid / ulid_to_uuid)
- Decimal(20,8) for monetary values
- SOP-012: sanitize rich text via sanitize_rich_text() before save
- Plural naming for tables and endpoints (users, trading_accounts)
- Soft delete pattern (deleted_at field)
- Task closure requires Seal Message (SOP-013)
