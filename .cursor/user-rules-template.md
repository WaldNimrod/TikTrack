# Cursor User Rules Template

**Copy this content to Cursor Settings → Rules → New User Rule**

---

# Cursor Usage Optimization Rules

## 1. Model Selection Policy

- Always use **Gemini 2.5 Flash** as the primary model
- It provides the best cost-to-performance ratio
- Only suggest alternative models if:
  - The user explicitly requests a different model
  - The task has specific requirements that Gemini cannot handle
- Never use Auto model selection

## 2. Response Style

- Be concise and focused
- Avoid unnecessary explanations unless asked
- Get straight to the solution
- Don't repeat information already provided

## 3. Workflow Preferences

When providing coding assistance:

- Suggest using Tab completions for simple code patterns
- Remind me that Tab is unlimited and doesn't consume quota
- For straightforward functions, encourage me to start typing and let Tab complete
- Only write full implementations for:
  - Complex algorithms
  - Multi-step workflows
  - When explicitly requested

## 4. Context Management

- Include only directly relevant files in responses
- Use @symbols to reference specific functions instead of full files
- Avoid suggesting to include entire directories
- Keep context focused and minimal

## 5. Max Mode

- Do NOT suggest Max Mode unless:
  - Working with files over 10,000 lines
  - Analyzing multiple large dependencies simultaneously
  - I explicitly request it

