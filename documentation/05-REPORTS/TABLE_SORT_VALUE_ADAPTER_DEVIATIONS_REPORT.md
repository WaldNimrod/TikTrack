# דוח סטיות - Table Sort Value Adapter
## Table Sort Value Adapter Deviations Report

**תאריך יצירה:** 26.11.2025  
**סה"כ עמודים נסרקו:** 25  
**עמודים עם בעיות:** 13

---

## סיכום

### סוגי בעיות שנמצאו:

- **directSort**: 7 מופעים
- **manualDateParse**: 26 מופעים
- **directDateEnvelope**: 85 מופעים
- **manualNumber**: 3 מופעים

---

## פירוט לפי עמוד

### index.html

**סקשן:** עמודים מרכזיים

#### directSort (1 מופעים)

- **שורה 336**: `const sorted = [...trades].sort((a, b) => {`

---

### trades.html

**סקשן:** עמודים מרכזיים

#### manualDateParse (2 מופעים)

- **שורה 1074**: `const parsed = Date.parse(rawDate);`
- **שורה 1102**: `const parsed = Date.parse(rawDate);`

#### directDateEnvelope (5 מופעים)

- **שורה 1076**: `} else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {`
- **שורה 1077**: `epoch = rawDate.epochMs;`
- **שורה 1083**: `: rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || r...`
- **שורה 1095**: `if (envelope && typeof envelope.epochMs === 'number') {`
- **שורה 1096**: `return envelope.epochMs;`

---

### trade_plans.html

**סקשן:** עמודים מרכזיים

#### manualDateParse (1 מופעים)

- **שורה 2024**: `const parsed = Date.parse(rawDate);`

#### manualNumber (2 מופעים)

- **שורה 1887**: `if (Number(design.id) === Number(window._lastCancelledTradePlanId)) {`
- **שורה 2527**: `return context.entityType === entityType && Number(context.entityId) === Number(...`

#### directDateEnvelope (7 מופעים)

- **שורה 1065**: `if (dateEnvelope && typeof dateEnvelope === 'object' && typeof dateEnvelope.epoc...`
- **שורה 1066**: `dateObj = new Date(dateEnvelope.epochMs);`
- **שורה 2026**: `} else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {`
- **שורה 2027**: `epoch = rawDate.epochMs;`
- **שורה 2033**: `: rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || r...`
- **שורה 2042**: `} else if (envelope.epochMs) {`
- **שורה 2043**: `epoch = envelope.epochMs;`

---

### alerts.html

**סקשן:** עמודים מרכזיים

#### manualDateParse (2 מופעים)

- **שורה 894**: `const parsed = Date.parse(rawDate);`
- **שורה 922**: `const parsed = Date.parse(rawDate);`

#### directDateEnvelope (11 מופעים)

- **שורה 602**: `: (createdEnvelope && typeof createdEnvelope === 'object' && typeof createdEnvel...`
- **שורה 603**: `? new Date(createdEnvelope.epochMs)`
- **שורה 674**: `: (triggeredEnvelope && typeof triggeredEnvelope === 'object' && typeof triggere...`
- **שורה 675**: `? new Date(triggeredEnvelope.epochMs)`
- **שורה 790**: `: (expiryEnvelope && typeof expiryEnvelope === 'object' && typeof expiryEnvelope...`
- **שורה 791**: `? new Date(expiryEnvelope.epochMs)`
- **שורה 896**: `} else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {`
- **שורה 897**: `epoch = rawDate.epochMs;`
- **שורה 903**: `: rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || r...`
- **שורה 915**: `if (envelope && typeof envelope.epochMs === 'number') {`
- **שורה 916**: `return envelope.epochMs;`

---

### tickers.html

**סקשן:** עמודים מרכזיים

#### manualDateParse (1 מופעים)

- **שורה 2132**: `const parsed = Date.parse(rawDate);`

#### directDateEnvelope (4 מופעים)

- **שורה 2134**: `} else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {`
- **שורה 2135**: `epoch = rawDate.epochMs;`
- **שורה 2159**: `if (envelope && typeof envelope.epochMs === 'number') {`
- **שורה 2160**: `return envelope.epochMs;`

---

### trading_accounts.html

**סקשן:** עמודים מרכזיים

#### manualDateParse (2 מופעים)

- **שורה 784**: `const parsed = Date.parse(rawDate);`
- **שורה 812**: `const parsed = Date.parse(rawDate);`

#### directDateEnvelope (5 מופעים)

- **שורה 786**: `} else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {`
- **שורה 787**: `epoch = rawDate.epochMs;`
- **שורה 793**: `: rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || r...`
- **שורה 805**: `if (envelope && typeof envelope.epochMs === 'number') {`
- **שורה 806**: `return envelope.epochMs;`

---

### executions.html

**סקשן:** עמודים מרכזיים

#### manualDateParse (4 מופעים)

- **שורה 1333**: `const parsed = Date.parse(rawDate);`
- **שורה 1361**: `const parsed = Date.parse(rawDate);`
- **שורה 4887**: `const timestamp = Date.parse(`${datePart}T00:00:00Z`);`
- **שורה 4893**: `const parsed = Date.parse(trimmed);`

#### directDateEnvelope (7 מופעים)

- **שורה 1335**: `} else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {`
- **שורה 1336**: `epoch = rawDate.epochMs;`
- **שורה 1342**: `: rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || r...`
- **שורה 1354**: `if (envelope && typeof envelope.epochMs === 'number') {`
- **שורה 1355**: `return envelope.epochMs;`
- **שורה 4395**: `const tradeSortValue = tradeEnvelope?.epochMs ?? suggestion.trade_created_at_epo...`
- **שורה 4978**: `trade_created_at_epoch: tradeEnvelope?.epochMs ?? null,`

---

### data_import.html

**סקשן:** עמודים מרכזיים

#### directSort (1 מופעים)

- **שורה 263**: `sessions.sort((a, b) => {`

#### manualDateParse (10 מופעים)

- **שורה 136**: `const parsed = Date.parse(value);`
- **שורה 183**: `?? (envelope.utc ? Date.parse(envelope.utc) : null)`
- **שורה 184**: `?? (envelope.local ? Date.parse(envelope.local) : null)`
- **שורה 185**: `?? (typeof envelope === 'string' ? Date.parse(envelope) : null);`
- **שורה 282**: `epochA = Date.parse(dateA);`
- **שורה 290**: `epochB = Date.parse(dateB);`
- **שורה 849**: `const parsed = Date.parse(rawDate);`
- **שורה 864**: `const parsed = Date.parse(rawDate);`
- **שורה 903**: `const parsed = Date.parse(rawDate);`
- **שורה 918**: `const parsed = Date.parse(rawDate);`

#### directDateEnvelope (15 מופעים)

- **שורה 102**: `if (value && typeof value === 'object' && (value.epochMs !== undefined || value....`
- **שורה 106**: `hasEpochMs: value.epochMs !== undefined,`
- **שורה 182**: `const candidate = envelope.epochMs`
- **שורה 277**: `} else if (dateA && typeof dateA === 'object' && dateA.epochMs) {`
- **שורה 278**: `epochA = dateA.epochMs;`
- **שורה 285**: `if (dateB && typeof dateB === 'object' && dateB.epochMs) {`
- **שורה 286**: `epochB = dateB.epochMs;`
- **שורה 519**: `created_at_epochMs: session.created_at && typeof session.created_at === 'object'...`
- **שורה 851**: `} else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {`
- **שורה 852**: `epoch = rawDate.epochMs;`
- **שורה 859**: `epoch = envelope.epochMs || envelope.epoch_ms || null;`
- **שורה 905**: `} else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {`
- **שורה 906**: `epoch = rawDate.epochMs;`
- **שורה 913**: `epoch = envelope.epochMs || envelope.epoch_ms || null;`
- **שורה 1061**: `if (value && typeof value === 'object' && (value.epochMs !== undefined || value....`

---

### cash_flows.html

**סקשן:** עמודים מרכזיים

#### directSort (1 מופעים)

- **שורה 203**: `const sortedData = [...data].sort((a, b) => {`

#### manualDateParse (2 מופעים)

- **שורה 1571**: `const parsed = Date.parse(rawDate);`
- **שורה 1596**: `const parsed = Date.parse(rawDate);`

#### manualNumber (1 מופעים)

- **שורה 2149**: `? window.cashFlowsData.find(flow => Number(flow.id) === numericId)`

#### directDateEnvelope (15 מופעים)

- **שורה 212**: `if (dateValue && typeof dateValue === 'object' && typeof dateValue.epochMs === '...`
- **שורה 213**: `return dateValue.epochMs;`
- **שורה 843**: `if (envelope && envelope.epochMs) {`
- **שורה 844**: `date = new Date(envelope.epochMs);`
- **שורה 848**: `} else if (value && typeof value === 'object' && typeof value.epochMs === 'numbe...`
- **שורה 849**: `date = new Date(value.epochMs);`
- **שורה 990**: `if (envelope && envelope.epochMs) {`
- **שורה 991**: `dateObj = new Date(envelope.epochMs);`
- **שורה 995**: `} else if (dateValue && typeof dateValue === 'object' && typeof dateValue.epochM...`
- **שורה 996**: `dateObj = new Date(dateValue.epochMs);`
- **שורה 1573**: `} else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {`
- **שורה 1574**: `epoch = rawDate.epochMs;`
- **שורה 1580**: `: rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || r...`
- **שורה 1589**: `if (envelope && typeof envelope.epochMs === 'number') {`
- **שורה 1590**: `return envelope.epochMs;`

---

### notes.html

**סקשן:** עמודים מרכזיים

#### manualDateParse (2 מופעים)

- **שורה 984**: `const parsed = Date.parse(rawDate);`
- **שורה 1012**: `const parsed = Date.parse(rawDate);`

#### directDateEnvelope (14 מופעים)

- **שורה 471**: `if (envelope && envelope.epochMs) {`
- **שורה 472**: `parsed = new Date(envelope.epochMs);`
- **שורה 476**: `} else if (value && typeof value === 'object' && typeof value.epochMs === 'numbe...`
- **שורה 477**: `parsed = new Date(value.epochMs);`
- **שורה 709**: `if (envelope && envelope.epochMs) {`
- **שורה 710**: `parsed = new Date(envelope.epochMs);`
- **שורה 714**: `} else if (dateValue && typeof dateValue === 'object' && typeof dateValue.epochM...`
- **שורה 715**: `parsed = new Date(dateValue.epochMs);`
- **שורה 738**: `: (createdEnvelope?.epochMs || createdEnvelope?.utc || createdEnvelope?.local ||...`
- **שורה 986**: `} else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {`
- **שורה 987**: `epoch = rawDate.epochMs;`
- **שורה 993**: `: rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || r...`
- **שורה 1005**: `if (envelope && typeof envelope.epochMs === 'number') {`
- **שורה 1006**: `return envelope.epochMs;`

---

### constraints.html

**סקשן:** עמודים טכניים

#### directSort (1 מופעים)

- **שורה 491**: `return constraints.sort((a, b) => {`

---

### notifications-center.html

**סקשן:** עמודים טכניים

#### directSort (3 מופעים)

- **שורה 1013**: `uniquePages.sort().forEach(page => {`
- **שורה 1057**: `return merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));`
- **שורה 1125**: `return Array.from(historyMap.values()).sort((a, b) => b.timestamp - a.timestamp)...`

---

### external-data-dashboard.html

**סקשן:** עמודים חיצוניים

#### directDateEnvelope (2 מופעים)

- **שורה 314**: `if (Number.isFinite(Number(value.epochMs))) {`
- **שורה 315**: `components.push(`epochMs: ${value.epochMs}`);`

---

## המלצות

1. **החלפת שימושים ישירים ב-.sort()** - להחליף ב-`sortTableData()` או `UnifiedTableSystem.sortByChain()`
2. **החלפת פונקציות מקומיות למיון** - להחליף במערכת המרכזית (`sortTableData`, `compareTableRows`)
3. **החלפת המרת ערכים מקומית** - להחליף ב-`TableSortValueAdapter.getSortValue()`
4. **עדכון TABLE_COLUMN_SORT_TYPES** - להוסיף הגדרות חסרות
5. **החלפת לוגיקת מיון מותאמת אישית** - להעביר ל-`getCustomSortValue()` ב-`tables.js`
