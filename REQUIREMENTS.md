# REQUIREMENTS.md - Technical Requirements

*This document expands on the high-level product requirements outlined in `PRD.md` and provides detailed technical specifications for the Kino AI Extension.*

## 1. Functional Requirements

### 1.1. AI Chat Interface
- **FR-1.1.1:** The system shall provide a webview-based chat interface within the VS Code sidebar.
- **FR-1.1.2:** The chat UI must be stylable and support at least three themes: 'Clean', 'Copilot', and 'Kokonut', configurable via user settings.
- **FR-1.1.3:** The system shall integrate with the DeepSeek API for LLM-powered responses. This includes support for both their 'chat' and 'reasoning' models, selectable by the user.
- **FR-1.1.4:** The user must be able to configure their DeepSeek API key in the extension settings (`kino.llm.apiKey`). The key must be stored securely using the VS Code `SecretStorage` API.
- **FR-1.1.5:** A mechanism shall exist to include the content of the currently active editor and selected steering documents as context in API requests.
- **FR-1.1.6:** Chat history shall be preserved for each workspace session.

### 1.2. Specifications (SPECS) Management
- **FR-1.2.1:** Upon initialization in a new workspace, the extension must create a `.kino/specs/` directory.
- **FR-1.2.2:** The "Create New Spec" command (`aiSidebar.createNewSpec`) shall prompt the user for a natural language description.
- **FR-1.2.3:** The system shall use an LLM to process the description and generate three files in a new subdirectory: `requirements.md`, `design.md`, and `tasks.md`.
- **FR-1.2.4:** The SPECS sidebar view must display a tree structure of all specs, with each spec being a collapsible node.
- **FR-1.2.5:** A webview-based "Specs Designer" shall open when a spec is clicked, allowing tabbed editing of the three markdown files with a live preview.
- **FR-1.2.6:** Context menu actions must be available for each spec: `Edit Requirements`, `Edit Design`, `Edit Tasks`, `Open All Files`, and `Delete Spec`.

### 1.3. Agent Hooks
- **FR-1.3.1:** The extension must create a `.kino/hooks/` directory on initialization.
- **FR-1.3.2:** The "Create Hook" command (`aiSidebar.createHook`) shall provide a UI for defining a hook's properties (name, eventType, patterns, prompt, enabled).
- **FR-1.3.3:** The system shall support creating hooks from a natural language description, which will be parsed by an LLM to pre-fill the configuration UI.
- **FR-1.3.4:** Hooks must be triggerable by file events (`fileCreated`, `fileSaved`, `fileDeleted`) and manually via a "play" button in the sidebar.
- **FR-1.3.5:** The hook execution service must provide real-time feedback in the sidebar (e.g., "running", "success", "failed").

### 1.4. AI Steering
- **FR-1.4.1:** The extension must create a `.kino/steering/` directory on initialization.
- **FR-1.4.2:** The AGENT STEERING sidebar view shall list all `.md` files in this directory.
- **FR-1.4.3:** The system must provide commands to create, edit, and delete steering files.
- **FR-1.4.4:** The chat interface must allow the user to select one or more steering files to be included as context for AI interactions.

### 1.5. MCP Server Management
- **FR-1.5.1:** The extension must read server configurations from `.kino/settings/mcp.json`.
- **FR-1.5.2:** The MCP SERVERS sidebar view must display each configured server and its real-time connection status.
- **FR-1.5.3:** The system shall monitor server health and display status indicators: Green (connected), Red (error), Gray (disconnected).
- **FR-1.5.4:** The system must implement an automatic reconnection mechanism with exponential backoff, configurable via settings (`kino.mcp.retryAttempts`).

## 2. Non-Functional Requirements

- **NFR-2.1 (Performance):** Sidebar views must load in under 500ms. File watchers should not introduce noticeable latency to file operations.
- **NFR-2.2 (Reliability):** The extension must have an uptime of 99.9%. Errors in one feature (e.g., MCP connection failure) should not crash the entire extension.
- **NFR-2.3 (Usability):** All features must be accessible via both the command palette and the sidebar UI. All user-facing labels and messages must be clear and concise.
- **NFR-2.4 (Security):** API keys and other sensitive data must be stored using VS Code's `SecretStorage`. No sensitive information should be written to logs unless in 'debug' mode.
- **NFR-2.5 (Scalability):** The extension must perform efficiently in workspaces with up to 100 specs and 100 hooks.

## 3. System Requirements

- **SR-3.1:** Visual Studio Code version 1.74.0 or higher.
- **SR-3.2:** An active internet connection is required for AI features.
- **SR-3.3:** Node.js 16.x or higher is required for development.

## 4. API Specifications

### 4.1. DeepSeek API
- **API-4.1.1:** The system will use the `POST /v1/chat/completions` endpoint for chat and reasoning.
- **API-4.1.2:** The `Authorization` header must be set to `Bearer sk-your-api-key-here`.
- **API-4.1.3:** The request body will include `model`, `messages`, and `stream` parameters as per DeepSeek documentation.

## 5. Data Requirements

- **DR-5.1:** All extension-specific data must be stored within the `.kino/` directory at the root of the user's workspace.
- **DR-5.2 (Hook Configuration):** Hooks are stored as JSON files (`*.kino.hook`) with the following schema:
  ```json
  {
    "name": "string",
    "eventType": "fileSaved" | "fileCreated" | "fileDeleted" | "manual",
    "patterns": ["string"],
    "prompt": "string",
    "enabled": "boolean"
  }
  ```
- **DR-5.3 (MCP Configuration):** MCP server settings are stored in `.kino/settings/mcp.json` with the following schema:
  ```json
  {
    "mcpServers": {
      "[serverName]": {
        "command": "string",
        "args": ["string"]
      }
    }
  }
  ```
