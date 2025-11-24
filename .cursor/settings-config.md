# Cursor Settings Configuration Guide

**This file contains all the settings that need to be configured in Cursor Settings UI.**

## Required Settings

### 1. Model Selection

**Path:** Cursor Settings → Models

**Configuration:**
- ✅ Select **Gemini 2.5 Flash** as default model
- ❌ Turn OFF **Auto model selection**

### 2. Agent Review Settings

**Path:** Cursor Settings → Agent → Review

**Configuration:**
- ❌ Turn OFF **Auto-run on commit**
- ✅ Keep enabled (if needed):
  - Include submodules (only if you have submodules)
  - Include untracked files (only if relevant)

### 3. User Rules

**Path:** Cursor Settings → Rules → New User Rule

**Action:** Copy content from `.cursor/user-rules-template.md` and paste into new User Rule

---

## Verification Checklist

After configuring, verify:

- [ ] Gemini 2.5 Flash is selected as default model
- [ ] Auto model selection is OFF
- [ ] Auto-run on commit is OFF
- [ ] User Rule is created and active
- [ ] Project Rules are loaded (`.cursor/rules/*.mdc`)

---

## Notes

- All project-specific rules are already configured in `.cursor/rules/` and `.cursorrules`
- User Rules need to be set manually through Cursor Settings UI
- These settings are global and apply to all projects

