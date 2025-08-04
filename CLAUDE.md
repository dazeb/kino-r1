# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Management
- Use PNPM as the package manager (`pnpm install`, `pnpm add`, etc.)

## Development Commands

### Building and Development
- `pnpm run compile` - Compile TypeScript files to JavaScript in `/out` directory
- `pnpm run watch` - Watch mode for development with auto-compilation
- `pnpm run build:production` - Production build (runs lint + compile)
- `pnpm run vscode:prepublish` - Prepare for publishing (production build)

### Testing and Quality
- `pnpm run test:unit` - Run Vitest unit tests (all `*.test.ts` files in src/)
- `pnpm run test` - Run full test suite including integration tests
- `pnpm run pretest` - Compile and lint before testing
- `pnpm run lint` - Run ESLint on TypeScript files
- `pnpm run validate:package` - Validate package.json structure

### Packaging
- `pnpm run package` - Create VSIX package for distribution

## Architecture Overview

This is a VSCode extension that provides an AI development sidebar with four main panels:

### Core Architecture
- **Extension Entry Point**: `src/extension.ts` - Initializes all services and providers
- **Tree Data Providers**: Manage sidebar UI for SPECS, AGENT HOOKS, AGENT STEERING, and MCP SERVERS
- **Service Layer**: Business logic for file management, hook execution, and MCP monitoring
- **Command System**: VSCode command handlers with context menu integration

### Key Components

#### Providers (`src/providers/`)
- `SpecsProvider` - Manages project specifications in `.kino/specs/`
- `HooksProvider` - Handles agent hooks with file watching and execution
- `SteeringProvider` - Manages AI steering configurations in `.kino/steering/`
- `MCPProvider` - Monitors Model Context Protocol server connections
- `ChatWebviewProvider` - AI chat interface integration
- `SettingsWebviewProvider` - Extension settings management

#### Services (`src/services/`)
- `FileWatcher` - Monitors `.kino/` directory for changes
- `MCPService` - MCP server connection management
- `HookExecutionService` - Executes hooks based on file events
- `HookEventService` - Monitors file system events for hook triggers
- `SteeringService` - Manages AI steering document templates and refinement
- `SettingsService` - Extension configuration management

#### Models (`src/models/`)
- `types.ts` - Core extension types and interfaces
- `hookTypes.ts` - Hook configuration and execution types
- `steeringTypes.ts` - AI steering document types
- `chatTypes.ts` - Chat integration types

### File Structure Conventions
The extension works with this directory structure:
```
.kino/
├── specs/
│   └── [feature-name]/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
├── steering/
│   └── *.md files
└── settings/
    └── mcp.json
```

## Testing Strategy

### Framework: Vitest
- Configuration: `vitest.config.ts`
- Test files: `*.test.ts` in any `src/` subdirectory
- Setup file: `src/test/setup.ts`
- Run tests: `pnpm run test:unit`

### Testing Patterns
- **Unit Tests**: All major services and providers have dedicated test files
- **Mock VSCode API**: Tests use mocked VSCode APIs for isolation
- **File System Testing**: Use temporary directories for file operations
- **Error Handling**: Comprehensive error scenario testing

## Development Workflow

### Adding New Features
1. Create provider in `src/providers/` if UI component needed
2. Implement service logic in `src/services/`
3. Add command handlers in `src/extension.ts` registerCommands()
4. Update `package.json` contributions for new commands/views
5. Add comprehensive unit tests

### Hook System Integration
- Hooks are defined in `.kino/hooks/` with JSON configuration
- `HookEventService` monitors file changes and triggers hooks
- `HookExecutionService` runs hook scripts with steering context
- Use `HookCreationService` for AI-assisted hook generation

### MCP Server Integration
- MCP servers defined in `.kino/settings/mcp.json`
- `MCPService` monitors connection status
- Real-time status updates in sidebar
- Connection retry and configuration management

## Code Quality Standards
- TypeScript strict mode enabled
- ESLint configuration in `.eslintrc.json`
- All public methods should have JSDoc comments
- Comprehensive error handling with user-friendly messages
- Use dependency injection for testability

## Extension Lifecycle
- Activation: `onStartupFinished` - extension loads with VSCode
- Services initialize in dependency order
- File watchers start monitoring `.kino/` directory
- Hook event monitoring begins automatically
- Cleanup handled via VSCode subscription system