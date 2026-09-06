# Prompt Upgrading & Skill Selection Workflow

This rule applies to all interactions and tasks.

## 1. 🚀 Autonomous Prompt Upgrading
Whenever the user provides a prompt or request:
1. **Analyze & Upgrade**: Internally elevate the prompt to a comprehensive, production-grade technical specification.
   - **Scope & Depth**: Identify core intent, edge cases, error states, performance bottlenecks, and security considerations.
   - **Design & UX**: Ensure modern UI/UX, responsive layouts, subtle micro-animations, accessible colors/contrast, and clear feedback states.
   - **Code Quality**: Enforce strict TypeScript typing, architectural modularity, robust state management separation, and clean abstractions.
2. **Execute Upgraded Standard**: Deliver the complete, high-standard solution covering both explicit requirements and implicit production needs without cutting corners.

---

## 2. 🧰 Dynamic Skill Selection & Execution
Before executing any task:
1. **Identify Required Skills**: Review the available skills (both global config skills and workspace `.agents/skills/`) that match the task domain:
   - **UI / Design / Frontend**: `frontend-tailwind-shadcn`, `frontend-design`, `ui-ux-pro-max`, `react-patterns`, `react-component-performance`
   - **Database / Backend / Supabase**: `supabase-database`, `postgres-best-practices`, `api-patterns`
   - **State & Data Fetching**: `state-tanstack-zustand`, `tanstack-query-expert`
   - **Payments & Location**: `razorpay-payments`, `leaflet-maps`
   - **Debugging / Diagnostics**: `systematic-debugging`, `debugger`, `error-diagnostics-smart-debug`
   - **Code Quality / Refactoring**: `clean-code`, `code-reviewer`, `simplify-code`
2. **Read & Apply**: Call `view_file` on the corresponding `SKILL.md` whenever specialized domain patterns or rules are needed, and strictly follow its guidelines during implementation.
