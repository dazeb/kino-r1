# Copilot AI Coding Agent Instructions

## Project Overview
- This is a VS Code extension (Kino AI) providing an AI-powered development assistant with sidebar panels for specs, agent hooks, steering, MCP server management, and chat.
- Core logic is in `src/` (see `extension.ts`, `providers/`, `services/`, `models/`).
- The extension manages `.kino/` workspace directories for specs, hooks, steering, and settings.

## Architecture & Patterns
- **Entry Point:** `src/extension.ts` initializes services, providers, and command handlers.
- **Providers:** TreeDataProviders in `src/providers/` manage sidebar UI for SPECS, AGENT HOOKS, AGENT STEERING, and MCP SERVERS.
- **Services:** Business logic in `src/services/` (e.g., file watching, hook execution, MCP monitoring, chat integration).
- **Models:** TypeScript interfaces/types in `src/models/` (e.g., `node.model.ts`, `settingsTypes.ts`).
- **Specs:** Each spec is a folder in `.kino/specs/` with `requirements.md`, `design.md`, and `tasks.md`.
- **Hooks:** Defined in `.kino/hooks/` as JSON files, triggered by file events or manually.
- **Steering:** Markdown files in `.kino/steering/` guide AI behavior.
- **Settings:** `.kino/settings/mcp.json` for MCP server config; `.kino/settings/extension.json` for extension settings.

## Developer Workflows
- **Install dependencies:** Use `pnpm install` (or `npm install` if using NPM).
- **Development:**
  - `pnpm run watch` — Watch mode for TypeScript compilation
  - `pnpm run lint` — Lint codebase
  - `pnpm run test` — Run all tests (unit/integration)
  - `pnpm run build:production` — Production build
  - `pnpm run package` — Create VSIX package
- **Debug:** Press `F5` in VS Code to launch Extension Development Host.
- **Testing:**
  - Uses Vitest (`*.test.ts` in `src/`)
  - Mock VSCode APIs for isolation
  - Test file system operations with temp dirs

## Project-Specific Conventions
- **Strict TypeScript:** All code uses strict typing; see `tsconfig.json`.
- **ESLint:** Linting enforced via `.eslintrc.json`.
- **JSDoc:** Public methods should have JSDoc comments.
- **Dependency Injection:** Used for testability in services.
- **Error Handling:** User-friendly error messages throughout.
- **File Watchers:** Services auto-refresh on `.kino/` changes.
- **Command Registration:** All commands registered in `src/extension.ts`.

## Integration Points
- **DeepSeek API:** For AI chat (API key in settings)
- **MCP Servers:** Managed via `.kino/settings/mcp.json` and `MCPService`
- **Hooks:** Created/managed via UI or natural language, executed by `HookExecutionService`

## Examples
- To add a new sidebar feature: create a provider in `src/providers/`, service logic in `src/services/`, register command in `src/extension.ts`, update `package.json`.
- To add a new hook: create a JSON config in `.kino/hooks/`, or use the "Create Hook" UI/command.
- To add a new spec: use the sidebar UI or add a folder with the three markdown files in `.kino/specs/`.

## Key Files/Dirs
- `src/extension.ts` — Main entry/activation
- `src/providers/` — Sidebar providers
- `src/services/` — Business logic
- `src/models/` — Types/interfaces
- `.kino/` — Workspace data (specs, hooks, steering, settings)

---

**For more details, see `README.md` and `CLAUDE.md`.**
