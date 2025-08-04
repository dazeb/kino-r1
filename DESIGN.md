# DESIGN.md - System Design Document

*This document outlines the technical architecture for the Kino AI Extension, based on the specifications in `PRD.md` and `REQUIREMENTS.md`.*

## 1. Architecture Overview

The Kino AI Extension follows a modular, service-oriented architecture designed for extensibility and maintainability. It operates entirely within the VS Code Extension Host and leverages the standard VS Code API. The architecture is composed of three main layers: the **UI Layer** (Providers and Webviews), the **Service Layer** (Business Logic), and the **Data Layer** (Workspace Files and Settings).

### Text-Based Diagram: System Architecture
```
+-------------------------------------------------+
|              VS Code Extension Host             |
|                                                 |
|  +------------------+      +-----------------+  |
|  |    UI Layer      |      |  Command Bus    |  |
|  |  (Providers,     |----->| (extension.ts)  |  |
|  |   Webviews)      |      +-----------------+  |
|  +------------------+             |             |
|        ^   |                      |             |
|        |   | (Data Binding)       v             |
|        |   |                                    |
|  +------------------+      +-----------------+  |
|  |  Service Layer   |<---->|  Service Layer  |  |
|  |  (ChatService,   |      |  (HookService,  |  |
|  |   FileWatcher)   |      |   MCPService)   |  |
|  +------------------+      +-----------------+  |
|        ^   |                      |             |
|        |   | (File I/O)           | (API Calls) |
|        |   |                      v             |
|  +------------------+      +-----------------+  |
|  |   Data Layer     |      | External APIs   |  |
|  |  (.kino/,         |      | (DeepSeek)      |  |
|  |   VSCode Settings)|      +-----------------+  |
|  +------------------+                           |
|                                                 |
+-------------------------------------------------+
```

## 2. System Components

### 2.1. Entry Point (`src/extension.ts`)
- **Responsibilities:**
  - Activates the extension.
  - Initializes all services in the correct dependency order.
  - Registers all commands, providers, and webviews with VS Code.
  - Manages the lifecycle of disposable resources.

### 2.2. UI Layer (`src/providers/`)
- **`*Provider.ts` (TreeDataProviders):**
  - Manages the state and rendering of the four sidebar sections (SPECS, AGENT HOOKS, AGENT STEERING, MCP SERVERS).
  - Each provider is responsible for reading data from the Data Layer (via services) and exposing it to the VS Code UI.
  - They listen for events from services (e.g., `specs-changed`) to trigger UI refreshes.
- **`*WebviewProvider.ts`:**
  - Provides rich HTML-based UIs for complex interactions like the AI Chat and the Specs Designer.
  - Handles two-way communication between the webview (frontend JavaScript) and the extension host (backend TypeScript).

### 2.3. Service Layer (`src/services/`)
- **`FileWatcher.ts`:**
  - Uses `vscode.workspace.createFileSystemWatcher` to monitor the `.kino/` directory for changes.
  - Emits specific events (e.g., `specs-changed`, `hooks-changed`) that other components can subscribe to. This decouples the file system from the UI providers.
- **`ChatService.ts`:**
  - Encapsulates all logic for interacting with the DeepSeek API.
  - Constructs API requests, including context from the editor and steering files.
  - Manages chat session state and history.
- **`HookExecutionService.ts`:**
  - Contains the logic for running hooks.
  - Listens for trigger events (e.g., `fileSaved`) and executes the corresponding hook's prompt or script.
- **`HookCreationService.ts`:**
  - Implements the natural language-to-hook generation feature by calling the LLM API.
- **`MCPService.ts`:**
  - Manages the lifecycle of MCP server connections.
  - Spawns server processes, monitors their health, and handles the retry logic as specified in `REQUIREMENTS.md`.
- **`SettingsService.ts`:**
  - Provides a centralized way to access and manage extension settings, abstracting the underlying `vscode.workspace.getConfiguration`.

### 2.4. Models (`src/models/`)
- Contains all TypeScript interfaces and type definitions (e.g., `Hook`, `Spec`, `MCPServer`). This ensures type safety and consistency across the application.

## 3. Data Architecture

- **Data Storage:** The primary data store is the file system within the user's workspace, specifically the `.kino/` directory. This makes the project self-contained and portable.
- **Data Flow:**
  1. **User Action:** A user interacts with the UI (e.g., clicks "Create Hook").
  2. **Command:** The command handler in `extension.ts` is invoked.
  3. **Service:** The command calls the relevant service (e.g., `HookCreationService`).
  4. **Data Mutation:** The service performs its logic, which may involve calling an external API (DeepSeek) and then writing a new file to the `.kino/hooks/` directory.
  5. **File Watcher:** The `FileWatcher` service detects the new file.
  6. **Event Emission:** The `FileWatcher` emits a `hooks-changed` event.
  7. **UI Update:** The `HooksProvider` listens for this event and calls `refresh()` to update the sidebar view, displaying the new hook.
- **State Management:** Application state is primarily derived from the file system. There is minimal in-memory state, which improves reliability and ensures the UI is always synchronized with the data on disk.

## 4. Technology Stack

- **Language:** TypeScript
- **Framework:** VS Code Extension API
- **Testing:** Vitest (for unit and integration tests)
- **Linting:** ESLint
- **External Dependencies:**
  - `axios` or similar for HTTP requests to the DeepSeek API.

## 5. Security Design

- **API Key Storage:** The DeepSeek API key will be stored using `vscode.SecretStorage`. This prevents the key from being stored in plaintext in settings files.
- **Command Injection:** All commands executed for MCP servers or hooks will have their arguments carefully sanitized to prevent command injection vulnerabilities.
- **Webview Security:** All webviews will have a strict Content Security Policy (CSP) to prevent cross-site scripting (XSS) attacks. Only scripts and styles from the extension's own directory will be allowed to load.

## 6. Deployment Strategy

- **Packaging:** The extension will be packaged into a `.vsix` file using `vsce package`.
- **Distribution:** The `.vsix` file will be published to the Visual Studio Marketplace.
- **Versioning:** The project will follow Semantic Versioning (SemVer). The version number in `package.json` will be updated for each release.
- **CI/CD:** A GitHub Actions workflow will be set up to automatically run linting and tests on every push and pull request. A separate workflow will handle the packaging and publishing process when a new tag is pushed.
