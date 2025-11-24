# Cursor Agent Instructions

## 🎯 Primary Goal: Optimize Quota Usage

### Model Selection

- **Always use Gemini 2.5 Flash** (most cost-effective)

- Don't use Auto model selection

- Only suggest other models if explicitly requested

### Agent Review Policy

**Use Agent Review ONLY for:**

- Changes affecting 5+ files

- Security-sensitive code (auth, payments, encryption)

- Database migrations

- Breaking changes

**Do NOT use for:**

- Small fixes (1-2 files)

- UI changes

- Documentation

- Minor refactors

Alternative: Manual review in Git

### Tab Completions First

- Tab completions are unlimited - use them!

- For simple code, suggest I start typing and Tab-complete

- Use Agent only for complex logic or multi-file changes

### Context Management

- Include only necessary files

- Use @symbols for specific functions

- Avoid attaching full files or directories

- Keep context minimal and focused

### Max Mode

- **Do NOT use** unless working with very large files (10k+ lines)

- Standard context (200k tokens) is enough for most tasks

### Response Style

- Be concise

- Get to the point quickly

- Avoid unnecessary explanations

- Remember: shorter responses = less quota usage

## 💡 Workflow Tips

1. Start with Tab completions for simple patterns

2. Use Agent for complex logic

3. Manual review for small changes

4. Agent Review only for critical/large changes

5. Keep context minimal

6. Monitor quota usage regularly

