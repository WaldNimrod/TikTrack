# Unified Log System Guide

## External Data Server Log (external_data)
- Source file: `logs/external_data.log` (Rotating 10MB x5)
- Backend API: `GET /api/logs/raw/external_data?max_lines=...`
- Frontend key: `externalDataLog` in `UnifiedLogManager` with `endpoint: '/api/logs/raw/external_data'`
- Typical lines: `external_data: action=batch_start|batch_fetch|batch_end ...`
- Recommended filters: timeRange = lastHour, itemsPerPage = 50/100
