# Architectural Constraints — TikTrack Phoenix

## Naming Rules
- Plural table names only (users, transactions)
- External IDs = ULID strings only
- Decimal(20,8) for money
- No field name invention — request GIN if missing

## Domain Isolation
- agents_os_v2/ must not import from api/ or ui/
- TikTrack code must not import from agents_os_v2/
- Shared data only via _COMMUNICATION/ and STATE_SNAPSHOT.json

## Knowledge Promotion
- Only Team 10 (via Team 70) writes to documentation/
- Teams write to _COMMUNICATION/team_[ID]/ only
- Archives go to _COMMUNICATION/99-ARCHIVE/

## Report Dates
- All reports must carry today's exact date
- No inaccurate dates on any team report

## CSS Classes
- Check CSS_CLASSES_INDEX and codebase before creating new classes
- Reference: TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md §1.5
