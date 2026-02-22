# 🖋️ מפרט אדריכלי: Rich-Text & Sanitization (SOP-012)
**project_domain:** TIKTRACK
---
status: LOCKED | Tooling: TipTap

1. **Allowlist:** `p`, `br`, `span`, `strong`, `em`, `u`, `ul`, `ol`, `li`, `a[href]`.
2. **Styles:** תמיכה ב-`phx-rt--` classes בלבד (Success, Warning, Danger, Highlight).
3. **Sanitization:** היברידית. DOMPurify ב-Frontend וסניטייזר ב-Backend לפני שמירה.
4. **Design System:** עמוד `/admin/design-system` ימומש ב-React (Type D).