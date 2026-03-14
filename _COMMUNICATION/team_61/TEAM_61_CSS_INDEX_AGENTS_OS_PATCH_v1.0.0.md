---
id: TEAM_61_CSS_INDEX_AGENTS_OS_PATCH_v1.0.0
from: Team 61 (Cloud Agent / DevOps Automation)
to: Team 10, Team 170 (for CSS_CLASSES_INDEX promotion)
cc: Team 100, Team 190
date: 2026-03-14
status: READY_FOR_PROMOTION
in_response_to: AOUI-IMP-ACT-01, AOUI-F02
---

## Purpose

Ready-to-merge patch for `documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md`.  
**Insert after section "### **10. טבלאות (Tables)**" (before "## 🎨 לוגיקת הגדרת מחלקות")**

---

## Patch Content (copy below)

```markdown
### **11. Agents_OS Pipeline UI** (ITCSS: Components Layer)

**תוקף:** `agents_os/ui/` — Pipeline Dashboard, Roadmap, Teams (domain: AGENTS_OS)  
**קבצים:** `agents_os/ui/css/pipeline-shared.css`, `pipeline-dashboard.css`, `pipeline-roadmap.css`, `pipeline-teams.css`

**הערה:** Pipeline UI משתמש במחסנית CSS נפרדת (לא phoenix-base/phoenix-components). משתני CSS מקומיים ב-`:root`.

#### **מבנה כותרת ולייאאוט (Canonical)**
| Class | קובץ | תיאור |
|-------|------|-------|
| `.agents-header` | pipeline-shared | כותרת עמוד (§5.1) |
| `.agents-header-left`, `.agents-header-right` | pipeline-shared | עמודות כותרת |
| `.agents-header-title` | pipeline-shared | כותרת עמוד |
| `.agents-refresh-label`, `.agents-refresh-btn` | pipeline-shared | תווית רענון וכפתור |
| `.agents-page-layout` | pipeline-shared | גריד ראשי 1fr 300px (§5.2) |
| `.agents-page-main` | pipeline-shared | עמודת תוכן ראשי |
| `.agents-page-sidebar` | pipeline-shared | סיידבר ימין 300px |

#### **נווט ותפריט**
| Class | קובץ | תיאור |
|-------|------|-------|
| `.pipeline-nav` | pipeline-shared | פס ניווט עליון |
| `.nav-link`, `.nav-link.active` | pipeline-shared | קישורי ניווט |
| `.nav-sep` | pipeline-shared | מפריד |

#### **סטטוס ודומיין**
| Class | קובץ | תיאור |
|-------|------|-------|
| `.status-pill` | pipeline-shared | תווית סטטוס בסיס |
| `.pill-pass`, `.pill-fail`, `.pill-current`, `.pill-pending`, `.pill-human` | pipeline-shared | וריאנטים |
| `.legacy-fallback-badge` | pipeline-shared | SPC-02 fallback |
| `.domain-badge`, `.domain-tiktrack`, `.domain-agentsos` | pipeline-shared | תג דומיין |
| `.domain-selector`, `.domain-btn` | pipeline-shared | בחירת דומיין |

#### **כרטיסים וסקשנים**
| Class | קובץ | תיאור |
|-------|------|-------|
| `.section-card`, `.section-title` | pipeline-shared | כרטיס סקשן |
| `.sidebar-section-card`, `.sidebar-section-title` | pipeline-shared | סקשן סיידבר |

#### **כפתורים וכלים**
| Class | קובץ | תיאור |
|-------|------|-------|
| `.btn`, `.btn-primary` | pipeline-shared | כפתורים |
| `.badge`, `.loading`, `.error-msg` | pipeline-shared | כלים כלליים |

#### **Dashboard**
| Class | קובץ | תיאור |
|-------|------|-------|
| `.sidebar-section`, `.sidebar-label` | pipeline-dashboard | סקשני סיידבר |
| `.accordion`, `.accordion-header`, `.accordion-body` | pipeline-dashboard | אקורדיון |
| `.prompt-box`, `.prompt-toolbar` | pipeline-dashboard | אזור פרומפט |
| `.health-warn-item`, `.hw-error`, `.hw-warning`, `.hw-body`, `.hw-copy-btn` | pipeline-dashboard | התראות בריאות |
| `.booster-panel`, `.booster-tab` | pipeline-dashboard | בוסטר ממשל |

#### **Roadmap**
| Class | קובץ | תיאור |
|-------|------|-------|
| `.rm-stage`, `.rm-stage-header`, `.rm-program` | pipeline-roadmap | עץ roadmap |
| `.conflict-banner`, `.state-blocking`, `.state-exception` | pipeline-roadmap | באנר קונפליקט 3-מצבי |
| `.stat-domain-card`, `.gate-seq-table` | pipeline-roadmap | סטטיסטיקות ורצף gates |
| `.prog-detail-panel` | pipeline-roadmap | פרטי תוכנית בסיידבר |

#### **Teams**
| Class | קובץ | תיאור |
|-------|------|-------|
| `.teams-layout` | pipeline-teams | גריד 220px 1fr |
| `.team-list`, `.team-item`, `.team-panel` | pipeline-teams | רשימת צוותים |
| `.prompt-tabs`, `.prompt-output-card` | pipeline-teams | טאבים ופרומפטים |

---
```

---

## Also update: קישורים רלוונטיים section

Add to the links list:

```
- `agents_os/ui/css/pipeline-shared.css` - Agents_OS Pipeline (shared)
- `agents_os/ui/css/pipeline-dashboard.css` - Agents_OS Dashboard
- `agents_os/ui/css/pipeline-roadmap.css` - Agents_OS Roadmap
- `agents_os/ui/css/pipeline-teams.css` - Agents_OS Teams
```

---

**log_entry | TEAM_61 | CSS_INDEX_PATCH | AOUI_F02_READY | 2026-03-15**
