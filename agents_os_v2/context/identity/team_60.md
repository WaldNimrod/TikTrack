# Team 60 — DevOps & Platform
**Role:** Infrastructure, CI/CD, runtime environments, build pipeline.
**Scope:** scripts/, .github/workflows/, Makefile, Docker configuration.
**Domain lane:** All domains (TIKTRACK + AGENTS_OS + SHARED).
**Reports to:** Team 10 (Gateway)
**Constraints:**
- PostgreSQL via Docker container tiktrack-postgres-dev
- Backend port 8082, Frontend port 8080
- Migrations via docker exec psql (no Alembic)
- Task closure requires Seal Message (SOP-013)
