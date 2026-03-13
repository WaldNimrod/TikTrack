/**
 * Phoenix Rich-Text Toolbar Config — SSOT (SOP-012)
 * --------------------------------------------------
 * סקואופ מדויק: אילו אופציות יש למשתמש — קוד אחד לכל המערכת.
 * אייקונים במקום טקסט | קיבוצים עם מפריד אנכי
 *
 * @description SSOT לכפתורי עורך טקסט עשיר | Tooltips חובה
 */

/** @typedef {{ cmd: string, label: string, title: string, icon?: string, cssClass?: string, sepBefore?: boolean }} ToolbarButton */

/** אייקוני SVG 18×18 — Heroicons-style */
const ICONS = {
  bold: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
  italic:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
  underline:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',
  success:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  warning:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  danger:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  highlight:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  h3: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 12l3-2v8"/></svg>',
  h4: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 10v4h4"/></svg>',
  alignLeft:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>',
  alignCenter:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  alignRight:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>',
  alignJustify:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  ltr: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/><path d="M18 10l4 4-4 4"/></svg>',
  rtl: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="6" y1="18" x2="20" y2="18"/><path d="M6 10L2 14l4 4"/></svg>',
  bulletList:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>',
  orderedList:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><path d="M5 6V4h2v2M5 12h2M4 17h1.5a1 1 0 0 1 1 1v.5"/></svg>',
};

const ICON_MAP = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  'phx-success': 'success',
  'phx-warning': 'warning',
  'phx-danger': 'danger',
  'phx-highlight': 'highlight',
  heading3: 'h3',
  heading4: 'h4',
  alignLeft: 'alignLeft',
  alignCenter: 'alignCenter',
  alignRight: 'alignRight',
  alignJustify: 'alignJustify',
  dirLtr: 'ltr',
  dirRtl: 'rtl',
  bulletList: 'bulletList',
  orderedList: 'orderedList',
};

/**
 * סקואופ מאושר — SOP-012
 * שורה 1: סגנונות | שורה 2: יישור, כיוון, רשימות
 */
const ROW1_STYLES = [
  { cmd: 'bold', title: 'Bold', icon: 'bold' },
  { cmd: 'italic', title: 'Italic', icon: 'italic' },
  { cmd: 'underline', title: 'Underline', icon: 'underline' },
  { sepBefore: true },
  {
    cmd: 'phx-success',
    title: 'Success',
    icon: 'success',
    cssClass: 'phx-rt--success',
  },
  {
    cmd: 'phx-warning',
    title: 'Warning',
    icon: 'warning',
    cssClass: 'phx-rt--warning',
  },
  {
    cmd: 'phx-danger',
    title: 'Danger',
    icon: 'danger',
    cssClass: 'phx-rt--danger',
  },
  {
    cmd: 'phx-highlight',
    title: 'Highlight',
    icon: 'highlight',
    cssClass: 'phx-rt--highlight',
  },
  { sepBefore: true },
  { cmd: 'heading3', title: 'Heading 3', icon: 'h3' },
  { cmd: 'heading4', title: 'Heading 4', icon: 'h4' },
];

const ROW2_ALIGN_LISTS = [
  { cmd: 'alignLeft', title: 'Align Left', icon: 'alignLeft' },
  { cmd: 'alignCenter', title: 'Align Center', icon: 'alignCenter' },
  { cmd: 'alignRight', title: 'Align Right', icon: 'alignRight' },
  { cmd: 'alignJustify', title: 'Justify', icon: 'alignJustify' },
  { sepBefore: true },
  { cmd: 'dirLtr', title: 'Left-to-right', icon: 'ltr' },
  { cmd: 'dirRtl', title: 'Right-to-left', icon: 'rtl' },
  { sepBefore: true },
  { cmd: 'bulletList', title: 'Bullet list', icon: 'bulletList' },
  { cmd: 'orderedList', title: 'Ordered list', icon: 'orderedList' },
];

export const PHOENIX_RT_TOOLBAR_BUTTONS = Object.freeze([
  ...ROW1_STYLES,
  ...ROW2_ALIGN_LISTS,
]);

export function getIconForCommand(cmd) {
  const key = ICON_MAP[cmd] || cmd;
  return ICONS[key] || '';
}

function renderToolbarRow(items) {
  let html = '';
  for (const item of items) {
    if (item.sepBefore) {
      html += '<span class="phoenix-rt-toolbar-sep" aria-hidden="true"></span>';
      continue;
    }
    const cls = item.cssClass ? ` ${item.cssClass}` : '';
    const title = (item.title || '').replace(/"/g, '&quot;');
    const iconHtml = item.icon ? getIconForCommand(item.cmd) : '';
    html += `<button type="button" data-rt-cmd="${item.cmd}" class="phoenix-rt-toolbar-btn${cls}" title="${title}" aria-label="${title}">${iconHtml}</button>`;
  }
  return html;
}

/**
 * Render toolbar HTML — שורה 1: סגנונות | שורה 2: יישור ורשימות
 * @param {string} toolbarId - מזהה אלמנט הטולבר
 * @returns {string} HTML
 */
export function getPhoenixRichTextToolbarHTML(toolbarId) {
  return `<div id="${toolbarId}" class="phoenix-rt-toolbar" data-rt-toolbar>
  <div class="phoenix-rt-toolbar-row">${renderToolbarRow(ROW1_STYLES)}</div>
  <div class="phoenix-rt-toolbar-row">${renderToolbarRow(ROW2_ALIGN_LISTS)}</div>
</div>`;
}
