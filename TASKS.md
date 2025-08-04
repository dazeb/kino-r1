# TASKS.md - Implementation Tasks

*This document breaks down the development work for the Kino AI Extension based on `REQUIREMENTS.md` and `DESIGN.md`. Tasks are organized into logical phases.*

## Task Overview

The project will be developed in three phases:
- **Phase 1: Core Infrastructure & UI Shell:** Set up the project, create the basic UI providers, and implement the file watching and settings services.
- **Phase 2: Feature Implementation (Specs, Hooks, MCP):** Build out the core features of the extension.
- **Phase 3: AI Integration & Polish:** Integrate the DeepSeek API for chat and AI-powered features, and refine the user experience.

---

## Phase 1: Core Infrastructure & UI Shell

*Goal: Establish the foundational architecture and create the empty sidebar panels.*

| ID | Title | Description | Acceptance Criteria | Dependencies | Effort (Days) |
|----|-------|-------------|---------------------|--------------|---------------|
| 1.1| Project Setup | Initialize project with TypeScript, Vitest, and ESLint. Create the basic file structure. | `npm install`, `npm run lint`, and `npm run test` all execute successfully. | - | 1 |
| 1.2| Create Sidebar Providers | Implement the four `TreeDataProvider` classes for SPECS, HOOKS, STEERING, and MCP. They should initially display static placeholder data. | The four sidebar sections are visible in the VS Code activity bar. | 1.1 | 1 |
| 1.3| Implement Settings Service | Create `SettingsService` to read and manage extension configuration from `package.json` and user settings. | The service can retrieve default and user-defined settings. | 1.1 | 0.5 |
| 1.4| Implement File Watcher Service | Create `FileWatcher` to monitor the `.kino/` directory and emit events for changes. | The service correctly detects file changes in the `.kino/` subdirectories and logs events. | 1.1 | 1 |
| 1.5| Connect Providers to Watcher | The sidebar providers should listen to events from the `FileWatcher` and refresh their views. | Creating a file in `.kino/specs/` causes the SPECS panel to refresh. | 1.2, 1.4 | 0.5 |

---

## Phase 2: Feature Implementation (Specs, Hooks, MCP)

*Goal: Build the core, non-AI functionality of the extension.*

| ID | Title | Description | Acceptance Criteria | Dependencies | Effort (Days) |
|----|-------|-------------|---------------------|--------------|---------------|
| 2.1| Implement Specs Provider Logic | The `SpecsProvider` should read the `.kino/specs/` directory and display the actual spec folders and files. | The SPECS panel accurately reflects the contents of the specs directory. | 1.5 | 1 |
| 2.2| Create Specs Designer Webview | Build the webview for the Specs Designer with tabs for `requirements`, `design`, and `tasks`. | The webview opens, displays the content of the markdown files, and saves changes back to disk. | 2.1 | 2 |
| 2.3| Implement Hooks Provider Logic | The `HooksProvider` should read and parse `.kino.hook` files and display them in the sidebar. | The HOOKS panel accurately reflects the contents of the hooks directory. | 1.5 | 1 |
| 2.4| Implement Hook Execution | Implement the `HookExecutionService` to manually trigger hooks. | Clicking the "play" icon on a hook executes its defined prompt in a VS Code task. | 2.3 | 1.5 |
| 2.5| Implement Event-Driven Hooks | Connect the `HookExecutionService` to the `FileWatcher` to trigger hooks on file save/create/delete events. | Saving a file that matches a hook's pattern automatically triggers that hook. | 2.4, 1.4 | 1 |
| 2.6| Implement MCP Service | Create the `MCPService` to read `mcp.json`, spawn server processes, and monitor their status. | The MCP SERVERS panel displays the correct status for each configured server. | 1.3 | 2 |

---

## Phase 3: AI Integration & Polish

*Goal: Integrate LLM capabilities and refine the user experience.*

| ID | Title | Description | Acceptance Criteria | Dependencies | Effort (Days) |
|----|-------|-------------|---------------------|--------------|---------------|
| 3.1| Implement Chat Service | Create `ChatService` to handle communication with the DeepSeek API. Securely store the API key. | The service can send a prompt to the API and receive a response. | 1.3 | 1 |
| 3.2| Create Chat Webview | Build the webview UI for the AI Chat panel. | The user can type a message, send it to the `ChatService`, and see the response displayed in the UI. | 3.1 | 2 |
| 3.3| Add Context to Chat | Integrate file and steering context into the `ChatService`. | The chat can use the active editor's content and selected steering files to answer questions. | 3.2 | 1 |
| 3.4| AI-Powered Spec Generation | Use the `ChatService` to generate the three spec files from a natural language prompt. | The "Create New Spec" command generates meaningful content for all three markdown files. | 3.1, 2.1 | 1 |
| 3.5| AI-Powered Hook Generation | Implement the `HookCreationService` to generate a hook configuration from a natural language prompt. | The "Create Hook" command can generate a valid `.kino.hook` file from a description like "run tests on save". | 3.1, 2.3 | 1 |
| 3.6| Add Final Polish | Write comprehensive JSDoc comments, add user-facing documentation, and perform thorough testing. | All public methods are documented. The `README.md` is updated. Test coverage is >80%. | All | 2 |
