# TEAM 170 — MANDATE: Pipeline Dashboard Hebrew Language Support
## Document: TEAM_170_PIPELINE_DASHBOARD_HEBREW_UI_MANDATE_v1.0.0.md

**From:** Team 100 (Program Manager) on behalf of Team 00 (Chief Architect)
**To:** Team 170 (Governance Spec / Documentation / UI Spec)
**date:** 2026-03-13
**Priority:** Medium
**Type:** UI Enhancement Mandate

---

## Identity Header (mandatory)
```
project_domain: AGENTS_OS
stage: S001
program: P002
work_package: WP001 (pipeline tooling)
document_type: MANDATE
issuing_team: team_100
receiving_team: team_170
```

---

## 1. Task Summary

Add **Hebrew language support** to the PIPELINE_DASHBOARD.html help system. The main UI (pipeline state, commands, gate timeline) remains English-only. Only the **help content** (Help Modal + Progress Check guidance) must support bilingual display with a clean toggle.

**Target file:** `PIPELINE_DASHBOARD.html` at repo root.

---

## 2. Scope — What to Change

### 2.1 Language Toggle Button
- Add a **language toggle button** in the Help Modal (`id="help-modal"`) header area, next to the `✕` close button.
- Toggle between **English (EN)** and **Hebrew (HE)**.
- Store preference in `localStorage` key `pipeline_dashboard_lang` (values: `"en"` or `"he"`).
- On modal open: apply stored preference automatically.
- Default: `"en"` if no preference stored.

**Button design (light mode, matches existing `button.btn` style):**
```html
<button id="lang-toggle-btn" class="btn" onclick="toggleLang()" title="Toggle language / החלף שפה">
  🌐 EN
</button>
```
Placement: inside `.modal-box`, positioned in the top-right area alongside the existing `✕` close button. Use `position: absolute; top: 16px; right: 55px;` (55px = clear of the existing `✕` at right: 16px).

### 2.2 Content Architecture — Dual-Language Sections
For each `<h3>` section and FAQ `<h4>` in the help modal, wrap content in:
```html
<div class="lang-en">... English content ...</div>
<div class="lang-he" dir="rtl" style="display:none">... Hebrew content ...</div>
```

The `toggleLang()` JavaScript function switches visibility:
```javascript
function toggleLang() {
  const current = localStorage.getItem('pipeline_dashboard_lang') || 'en';
  const next = current === 'en' ? 'he' : 'en';
  localStorage.setItem('pipeline_dashboard_lang', next);
  applyLang(next);
}
function applyLang(lang) {
  document.querySelectorAll('.lang-en').forEach(el => el.style.display = lang==='en' ? '' : 'none');
  document.querySelectorAll('.lang-he').forEach(el => el.style.display = lang==='he' ? '' : 'none');
  const btn = document.getElementById('lang-toggle-btn');
  if (btn) btn.textContent = '🌐 ' + (lang==='en' ? 'EN' : 'HE');
}
```
Call `applyLang(localStorage.getItem('pipeline_dashboard_lang') || 'en')` in the help modal `onopen` (or when the `?` button is clicked).

### 2.3 Sections to Translate (Hebrew content)

Translate the following sections. Keep all `<pre>`, `<code>`, bash command strings in **English** — only translate surrounding explanatory text.

| Section | Hebrew title |
|---|---|
| Quick Start (30 seconds) | התחלה מהירה (30 שניות) |
| All pipeline_run.sh Commands | כל פקודות pipeline_run.sh |
| Gate Sequence & Owners | רצף השלבים (Gates) ובעלים |
| How Team Mandates Work | כיצד עובדים מנדטים של צוותים |
| Handling FAIL (G3_5 or GATE_4) | טיפול בכשל (FAIL) |
| FAQ | שאלות נפוצות |
| Additional Tools | כלים נוספים |

**Critical translation notes:**
- `gate` → שלב / gate (use English term on first mention)
- `pipeline` → pipeline (keep in English)
- `prompt` → פרומט (transliteration accepted)
- `mandate` → מנדט (transliteration accepted)
- `work plan` → תוכנית עבודה
- `PASS` / `FAIL` → PASS / FAIL (keep in English — binary status terms)
- All bash commands, file paths, IDs: **keep in English, do not translate**
- `./pipeline_run.sh` → keep exactly as-is

### 2.4 FAQ Questions to Translate

Translate all FAQ `<h4>` questions and answer text. Example:

```html
<h4 class="lang-en">Q: Team 90 rejected the work plan (G3_5 FAIL). What to do?</h4>
<h4 class="lang-he" dir="rtl" style="display:none">שאלה: Team 90 פסל את תוכנית העבודה (G3_5 FAIL). מה עושים?</h4>
<p class="lang-en">...</p>
<p class="lang-he" dir="rtl" style="display:none">...</p>
```

### 2.5 Progress Check Modal (id="progress-modal")
The progress check modal generates its content dynamically via JavaScript (`runProgressCheck()`). For this modal:
- **Phase 1 (this mandate):** Translate only the static title and close button area.
- **Phase 2 (future):** Dynamic content localization — deferred.

Progress check modal header translation:
```html
<!-- current: -->
<h2>🔍 בדוק התקדמות — Progress Diagnostics</h2>
<!-- keep as-is — already bilingual in the heading -->
```
No change needed for progress check in Phase 1.

---

## 3. CSS Requirements

Add these CSS rules (compatible with the existing light-mode theme):
```css
/* Language sections */
.lang-he { direction: rtl; text-align: right; font-family: system-ui, -apple-system, sans-serif; }
.lang-he code, .lang-he pre { direction: ltr; text-align: left; unicode-bidi: embed; }
/* Language toggle button */
#lang-toggle-btn { font-size: 11px; padding: 3px 8px; }
```

---

## 4. HTML Structure Requirements

### 4.1 Modal Header Layout
The help modal currently has:
```html
<div class="modal-box">
  <button class="modal-close" onclick="toggleHelp()">✕</button>
  <h2>⚡ Agents OS — Pipeline System Guide</h2>
  ...
```

Add the language toggle button:
```html
<div class="modal-box">
  <button class="modal-close" onclick="toggleHelp()">✕</button>
  <button id="lang-toggle-btn" class="btn" onclick="toggleLang()" title="Toggle language / החלף שפה" style="position:absolute;top:16px;right:55px;font-size:11px">🌐 EN</button>
  <h2>⚡ Agents OS — Pipeline System Guide</h2>
  ...
```

### 4.2 Apply Language on Modal Open
In the existing `toggleHelp()` function, add an `applyLang` call:
```javascript
function toggleHelp() {
  document.getElementById("help-modal").classList.toggle("open");
  applyLang(localStorage.getItem('pipeline_dashboard_lang') || 'en');
}
```

---

## 5. Validation Criteria (Team 170 must verify before submission)

- [ ] Language toggle button visible in modal header, distinct from close button
- [ ] English content shown by default on first load
- [ ] Clicking toggle switches all `.lang-en`/`.lang-he` sections simultaneously
- [ ] Preference persists on page reload (localStorage)
- [ ] All bash commands / file paths remain in English in Hebrew mode
- [ ] Hebrew text renders RTL correctly (dir="rtl")
- [ ] Code blocks inside Hebrew sections remain LTR
- [ ] No JS errors in browser console
- [ ] Light mode colors unaffected
- [ ] `escHtml` / `escAttr` functions not modified
- [ ] All existing English text preserved exactly

---

## 6. Output Files

Team 170 produces:
1. **Modified:** `PIPELINE_DASHBOARD.html` — with Hebrew support added
2. **Submission file:** `_COMMUNICATION/team_170/TEAM_170_PIPELINE_DASHBOARD_HEBREW_UI_v1.0.0.md` — confirmation with checklist

---

## 7. Constraints

- **Do NOT** modify the main UI outside the help modal (sidebar, main panel, quick action bar)
- **Do NOT** change any JavaScript logic (gate config, copy utilities, progress check generation)
- **Do NOT** add any external dependencies (no i18n libraries)
- **Do NOT** change the progress check modal dynamic content (Phase 2)
- **Preserve** all `id` attributes on all existing elements
- **Preserve** all existing `escHtml`, `escAttr`, `pcCopy`, `copyCmd` functions exactly

---

**log_entry | TEAM_170 | PIPELINE_DASHBOARD_HEBREW_UI_MANDATE | ISSUED | 2026-03-13**
