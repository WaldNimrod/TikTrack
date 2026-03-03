# TEAM 00 → TEAM 30 | KB Remediation Activation
**Document ID:** TEAM_00_TO_TEAM_30_KB_REMEDIATION_ACTIVATION_v1.0.0
**Date:** 2026-03-03
**From:** Team 00 (Chief Architect)
**To:** Team 30 (Frontend)
**Authority:** ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0
**Status:** ACTIVE — Execute immediately

---

## YOUR MANDATE

Team 30 has 5 KB items in the npm/frontend domain. Items KB-012 and KB-013 are HIGH severity CVEs — execute first.

---

## TASK 1 — npm Vulnerabilities (KB-012, KB-013) — HIGH PRIORITY

**Directory:** `ui/`

### Step 1: Run audit and attempt auto-fix

```bash
cd ui
npm audit  # View current state
npm audit fix  # Attempt auto-fix
npm audit  # Verify results
```

### Step 2: If auto-fix resolves KB-012 and KB-013

Verify the build still passes:
```bash
npx vite build
```

If build passes → done for this task.

### Step 3: If auto-fix does NOT resolve (breaking change)

For `minimatch` (KB-012): Check which package requires minimatch at vulnerable version. Pin to safe version in `package.json` overrides:
```json
{
  "overrides": {
    "minimatch": "^3.1.2"
  }
}
```

For `rollup` (KB-013): Similarly, check parent. Rollup is used by Vite — may require upgrading Vite itself:
```bash
npm install vite@latest  # If Vite upgrade resolves rollup version
```

Always verify build after changes: `npx vite build`.

**Deliver to Team 10:** `npm audit` output after fix showing zero HIGH+ vulnerabilities (or list of residual issues with mitigation plan if no safe version exists).

---

## TASK 2 — ESLint Fix: Unescaped Quote (KB-008)

**File:** `ui/src/components/HomePage.jsx` — lines 456-457
**Rule:** `react/no-unescaped-entities`

Find occurrences of raw `"` characters in JSX text nodes. Replace with `&quot;` or rewrite with single quotes or template literals.

```jsx
// BEFORE (causes ESLint error)
<p>Use "this" feature</p>

// AFTER (correct)
<p>Use &quot;this&quot; feature</p>
// OR
<p>{'Use "this" feature'}</p>
```

**After fix:** Run `cd ui && ./node_modules/.bin/eslint ui/src/components/HomePage.jsx` — should show zero errors for this file.

---

## TASK 3 — ESLint Fix: Await Outside Async (KB-009)

**File:** `ui/scripts/visual-diff.js` — line 260
**Issue:** `await` expression used outside an `async` function — parse error

Either:
a) Wrap the containing function with `async`:
```javascript
// BEFORE
function myFunction() {
  const result = await someAsyncCall();  // ← parse error
}

// AFTER
async function myFunction() {
  const result = await someAsyncCall();
}
```

Or:
b) If it's a top-level `await` (in a module context), ensure the file uses `"type": "module"` or is processed as ESM.

After fix: `cd ui && ./node_modules/.bin/eslint ui/scripts/visual-diff.js` — should show no parse error.

---

## TASK 4 — ESLint Config Merge Verification (KB-014)

**File:** `ui/.eslintrc.cjs`
**Branch:** `cursor/development-environment-setup-6742`

Verify that the ESLint config file created by Cloud Agent is present in `main` or `develop` (whichever is the base development branch):

```bash
git log --oneline main | head -10  # Check if commit with eslintrc exists
git show main:ui/.eslintrc.cjs 2>/dev/null  # Check if file exists on main
```

If NOT on main/develop:
```bash
git checkout main
git cherry-pick <commit-hash-that-added-eslintrc>  # Or apply manually
```

Confirm with Team 10 once merged.

---

## COMPLETION CRITERIA

Team 30 is complete when:
- [ ] `npm audit` shows zero HIGH+ vulnerabilities in `ui/` (KB-012, KB-013 resolved)
- [ ] `vite build` passes after npm changes
- [ ] KB-008 (unescaped quote) fixed, ESLint clean for `HomePage.jsx`
- [ ] KB-009 (await outside async) fixed, ESLint parse error resolved for `visual-diff.js`
- [ ] KB-014: `ui/.eslintrc.cjs` confirmed present in main/develop

**Report completion to Team 10.** Team 10 closes items in master task list.

---

**log_entry | TEAM_00→TEAM_30 | KB_REMEDIATION_ACTIVATION_v1.0.0 | ACTIVE | 2026-03-03**
