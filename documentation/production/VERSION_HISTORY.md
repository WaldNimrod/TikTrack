# TikTrack Production Version History

This log records every production version update, including manual major/minor adjustments performed by Nimrod. Entries are appended automatically by the versioning helper script.

| Date (UTC) | Version | Previous Version | Commit | Previous Commit | Bump Type | Notes |
|------------|---------|------------------|--------|------------------|-----------|-------|


| 2025-11-10T19:16:37+00:00 | 1.0.0.0 | 0.0.0.0 | da1dc88875f8804f9805700e2f444ba56fb5bd72 | - | set | Initial alignment (prod commit da1dc88875f8804f9805700e2f444ba56fb5bd72, main commit d7169b3f225184f9d6c1ccbb1826135e045cb335) |
| 2025-11-10T22:34:00+00:00 | 1.0.1.0 | 1.0.0.0 | 8b3f1d8af5fc366fd9af36470254b25be42700d4 | da1dc88875f8804f9805700e2f444ba56fb5bd72 | patch | Enhance import metadata and UI cleanup |
| 2025-11-10T22:38:05+00:00 | 1.0.2.0 | 1.0.1.0 | 8b3f1d8af5fc366fd9af36470254b25be42700d4 | 8b3f1d8af5fc366fd9af36470254b25be42700d4 | patch | Add data import page and history dashboard |
| 2025-11-11T00:54:31+00:00 | 1.0.3.0 | 1.0.2.0 | 01c735221df88555af989a0a718215c6a618ae70 | 8b3f1d8af5fc366fd9af36470254b25be42700d4 | patch | Resync preferences page assets |
| 2025-11-11T00:58:14+00:00 | 1.0.4.0 | 1.0.3.0 | fad1251215d82f64a73ff9e267d86fc75e98a8d1 | 01c735221df88555af989a0a718215c6a618ae70 | patch | Standardize button system across user pages |
| 2025-11-11T02:26:15+00:00 | 1.0.5.0 | 1.0.4.0 | 43c635fb02951bd9d8391cc43b030fe974957226 | fad1251215d82f64a73ff9e267d86fc75e98a8d1 | patch | External data dashboard updates and backup |
| 2025-11-11T11:07:36+00:00 | 1.0.6.0 | 1.0.5.0 | 71acdafb71ffef4c7680a6c8805c2f969686748b | 43c635fb02951bd9d8391cc43b030fe974957226 | patch | Link homepage execution widgets to executions page |
| 2025-11-14T20:45:34+00:00 | 1.0.7.0 | 1.0.6.0 | 5a7c30d00ebb0f8bc9397e5cd13da84d42044a35 | 71acdafb71ffef4c7680a6c8805c2f969686748b | patch | Sync local updates before release |
| 2025-11-14T22:50:56+00:00 | 1.0.8.0 | 1.0.7.0 | 0d5f54c8d41e340b2105b04a094442ec6f8701f5 | 5a7c30d00ebb0f8bc9397e5cd13da84d42044a35 | patch | Sync workspace changes for production release |
| 2025-11-14T22:52:17+00:00 | 1.1.1.0 | 1.0.8.0 | 87cdd25fd639298da485550f8bd5ee10917c034d | 0d5f54c8d41e340b2105b04a094442ec6f8701f5 | set | Production release 1.1.1 |
| 2025-11-16T21:29:24+00:00 | 1.1.2.0 | 1.1.1.0 | 863d46f578530935c42fbfb4830e991fc9b53f48 | 87cdd25fd639298da485550f8bd5ee10917c034d | patch | תיקון בעיות בעמוד תזרימי מזומנים: טעינת מטבעות, מודול עריכה, תאריכים ועמודת עודכן |
| 2025-11-16T22:02:45+00:00 | 1.1.3.0 | 1.1.2.0 | e93f36fb5392ff630fc891ce2f47ca6efdff2ba9 | 863d46f578530935c42fbfb4830e991fc9b53f48 | patch | Trade Planning Fields - Complete Implementation with Snapshot Pattern, Documentation, and Code Quality Improvements |
| 2025-11-16T22:07:34+00:00 | 1.1.4.0 | 1.1.3.0 | 9676c2c32c1870820abdc3cc2074eee5ae0b3700 | e93f36fb5392ff630fc891ce2f47ca6efdff2ba9 | patch | Cash flows fixes round - Backend API routes and Frontend date handling fixes |
| 2025-11-17T00:21:43+00:00 | 1.1.5.0 | 1.1.4.0 | 76fee7a1d2bf324ac984715e07ead95ca31c1c41 | 9676c2c32c1870820abdc3cc2074eee5ae0b3700 | patch | Complete standardization work - data services, tests, and documentation |
| 2025-11-17T00:52:10+00:00 | 1.1.6.0 | 1.1.5.0 | 09be00218459585316233a911e8eb36ffeca7ac0 | 76fee7a1d2bf324ac984715e07ead95ca31c1c41 | patch | Backup verification and PostgreSQL migration updates |
| 2025-11-18T16:05:49+00:00 | 1.1.7.0 | 1.1.6.0 | 64e500c3670ac27aae13283697b5c0337d2289d2 | 09be00218459585316233a911e8eb36ffeca7ac0 | patch | Complete tooltip system refactoring: static/dynamic support, unique ID generation, default mechanism |
| 2025-11-18T20:36:04+00:00 | 1.1.8.0 | 1.1.7.0 | b9156b35f3c138a91d2d03dfd08937d2f1d12310 | 64e500c3670ac27aae13283697b5c0337d2289d2 | patch | Add comprehensive tooltip standardization scanning and reporting tools |
| 2025-11-18T21:47:43+00:00 | 1.1.9.0 | 1.1.8.0 | 3e4ca378c2c879d09203620d9db0411a967f4492 | b9156b35f3c138a91d2d03dfd08937d2f1d12310 | patch | Remove unnecessary debug console logs from button system |
| 2025-11-20T08:55:49+00:00 | 1.1.10.0 | 1.1.9.0 | 8626427dbea71a63f8851050f0f88f0921de3727 | 3e4ca378c2c879d09203620d9db0411a967f4492 | patch | תיקון מערכת מיון טבלאות - הוספת מיון ברירת מחדל אוטומטי לכל הטבלאות |
| 2025-11-20T09:02:58+00:00 | 1.1.11.0 | 1.1.10.0 | c92ddc63c10c3816261773a59a53ae19591b2d47 | 8626427dbea71a63f8851050f0f88f0921de3727 | patch | הוספת defaultSort ל-positions table |
| 2025-11-20T11:27:19+00:00 | 1.1.12.0 | 1.1.11.0 | 17dffed56f84f385a90a75686575804c162dc75f | c92ddc63c10c3816261773a59a53ae19591b2d47 | patch | Fix cash flow type filter: restore buttons, add dropdown, fix pagination render callback |
| 2025-11-20T11:31:33+00:00 | 1.1.13.0 | 1.1.12.0 | bc6dff2069ef4449c1b9e5a65564a88f5d29d546 | 17dffed56f84f385a90a75686575804c162dc75f | patch | Remove cash flow filter buttons, keep only dropdown - full project sync |
| 2025-11-20T11:34:46+00:00 | 1.2.0.0 | 1.1.13.0 | 568f18f6ed3ea36ed8a65f961234fd064eb697f4 | bc6dff2069ef4449c1b9e5a65564a88f5d29d546 | set | Update to version 1.2.0.0 |
| 2025-11-22T11:56:35+00:00 | 1.3.0.0 | 1.2.0.0 | 997679b3129b635a7d1c489ca7b9ca9f3d8ce044 | 568f18f6ed3ea36ed8a65f961234fd064eb697f4 | set | Align production version with development - 1.3.0 |
| 2025-11-22T22:49:41+00:00 | 1.3.1.0 | 1.3.0.0 | 6ce17ac3a123d40b815a28c39f7e0b9bedf9b455 | 997679b3129b635a7d1c489ca7b9ca9f3d8ce044 | patch | Fix account linking modal - always show interface for user confirmation |
| 2025-11-23T00:34:13+00:00 | 1.3.2.0 | 1.3.1.0 | f1400d1362076eb88952fbaff62993d861431707 | 6ce17ac3a123d40b815a28c39f7e0b9bedf9b455 | patch | Fix preferences cache version and delete trades with linking issues |
| 2025-11-23T18:07:27+00:00 | 1.3.3.0 | 1.3.2.0 | 0620b022a535f7bcc267800162a33c0088f8b327 | f1400d1362076eb88952fbaff62993d861431707 | patch | Business Logic Phase 2 - הושלם במלואן: תיקון ולידציה, סקריפטי בדיקות, דוחות מקיפים |
| 2025-11-23T18:26:01+00:00 | 1.3.4.0 | 1.3.3.0 | 2a4c11539f56b48122cd4fae643213b9e4006e8f | 0620b022a535f7bcc267800162a33c0088f8b327 | patch | Complete Phase 3.1-3.3 testing: Add test scripts and comprehensive reports |
| 2025-11-23T19:52:04+00:00 | 1.3.5.0 | 1.3.4.0 | 3133a7f076d9d1047fca0c7fed4459add8c7204f | 2a4c11539f56b48122cd4fae643213b9e4006e8f | patch | Phase 3.4.1-3.4.2: Cache and Response Time optimization |
| 2025-11-23T20:20:49+00:00 | 1.3.6.0 | 1.3.5.0 | f8c7cd230304a1991834ede1fbd32f27cf51114b | 3133a7f076d9d1047fca0c7fed4459add8c7204f | patch | Phase 3.4: Performance Optimization - Complete |
| 2025-11-23T21:45:20+00:00 | 1.3.7.0 | 1.3.6.0 | 7d2829d0335fc6e98b52f10424b5059c2e9e6c98 | f8c7cd230304a1991834ede1fbd32f27cf51114b | patch | Complete Business Logic Phase 4: Documentation & Finalization |
| 2025-11-23T22:27:07+00:00 | 1.3.8.0 | 1.3.7.0 | 61c9d24e877c8bd32c7deb0a523f3ca34f28616b | 7d2829d0335fc6e98b52f10424b5059c2e9e6c98 | patch | Update Business Logic Phase 5 Plan: Add comprehensive validation architecture integration details |
