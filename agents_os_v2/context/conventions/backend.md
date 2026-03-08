# Backend Conventions — TikTrack Phoenix

## Structure
- Models: `api/models/<entity>.py` — SQLAlchemy ORM with `Base` from `api/models/base.py`
- Schemas: `api/schemas/<entity>.py` — Pydantic BaseModel
- Services: `api/services/<entity>_service.py` — Business logic, singleton pattern
- Routers: `api/routers/<entity>.py` — FastAPI APIRouter

## Naming
- Table names: plural (users, trading_accounts, cash_flows)
- Schemas: `user_data.*` or `market_data.*`
- External IDs: ULID strings (`uuid_to_ulid()` / `ulid_to_uuid()` from `api/utils/identity`)
- Endpoints: underscore naming (`/trading_accounts`, `/cash_flows`)

## Types
- Money: `Decimal(20,8)` — NUMERIC(20,8) in DB
- Market cap: `Decimal(24,4)` — NUMERIC(24,4) in DB
- IDs: UUID internally, ULID externally
- Timestamps: TIMESTAMPTZ (timezone-aware)

## Patterns
- Soft delete: `deleted_at` field (filter with `.where(Model.deleted_at.is_(None))`)
- Audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`, `version`
- Error handling: `HTTPExceptionWithCode` with `ErrorCodes` enum
- Auth: JWT via `get_current_user` dependency
- Rich text: sanitize via `sanitize_rich_text()` before save (SOP-012)

## Database
- Async: `asyncpg` + `SQLAlchemy AsyncSession`
- Connection: `DATABASE_URL` in `api/.env` (postgresql:// — code adds +asyncpg)
- No Alembic — manual SQL migrations in `scripts/migrations/`
