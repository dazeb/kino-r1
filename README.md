# Kino AI Extension

[![Version](https://img.shields.io/badge/version-0.0.2-blue.svg)](https://github.com/dazeb/extension-kino-ai)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0+-blue.svg)](https://code.visualstudio.com/)

A comprehensive VS Code extension providing an AI-powered development assistant with dedicated sidebar panels for managing specifications, agent hooks, steering configurations, MCP server connections, and an integrated chat interface.

## 🚀 Overview

Kino AI transforms your VS Code workspace into an intelligent development environment by providing:

- **AI Chat Interface**: Multiple chat styles (Clean, Copilot-style, Kokonut-inspired) with DeepSeek integration
- **Specifications Management**: Structured project documentation with requirements, design, and tasks
- **Agent Hooks**: Automated workflows triggered by file events or manual execution
- **AI Steering**: Context-aware guidance for AI interactions
- **MCP Integration**: Model Context Protocol server management
- **Hook Creation UI**: Visual interface for creating custom automation hooks

## ✨ Key Features

### 🤖 AI Chat Integration
- **Multiple Chat Interfaces**: Choose from Clean, GitHub Copilot-style, or Kokonut-inspired designs
- **DeepSeek Integration**: Support for both chat and reasoning models
- **Steering Context**: AI responses guided by project-specific steering documents
- **File Context**: Include current file content in conversations
- **Session Management**: Persistent chat sessions with history

### 📋 Specifications (SPECS)
- **Structured Documentation**: Organize project specs in `.kino/specs/` directories
- **Three-File System**: `requirements.md`, `design.md`, and `tasks.md` for each spec
- **Visual Designer**: Built-in webview for editing specs with live preview
- **Template Generation**: Auto-generate spec templates from natural language descriptions
- **Context Menu Actions**: Quick access to edit, delete, and view operations

### 🔧 Agent Hooks
- **Event-Driven Automation**: Hooks triggered by file creation, saving, deletion, or manual execution
- **Natural Language Creation**: Describe what you want and AI generates the hook configuration
- **Visual Hook Builder**: Step-by-step UI for creating and configuring hooks
- **File Pattern Matching**: Target specific files or directories with glob patterns
- **Real-time Monitoring**: Live status updates and execution feedback

### 🎯 AI Steering
- **Context Guidance**: Steering documents that influence AI behavior
- **Template System**: Foundation templates for common steering patterns
- **File Watching**: Automatic updates when steering files change
- **Project-Aware**: Context-sensitive steering based on project structure

### 🔌 MCP Servers
- **Connection Monitoring**: Real-time status tracking for MCP servers
- **Configuration Management**: Easy setup and management of server connections
- **Retry Logic**: Automatic reconnection with configurable retry policies
- **Status Indicators**: Visual feedback for server health

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Kino AI"
4. Click Install

### Manual Installation
1. Download the `.vsix` file from releases
2. Open VS Code
3. Run `Extensions: Install from VSIX...` command
4. Select the downloaded file

### Prerequisites
- **VS Code**: Version 1.74.0 or higher
- **Node.js**: 16.x or higher (for development)
- **TypeScript**: Included in dev dependencies

## 🎯 Quick Start

### 1. First Launch
After installation, you'll see two new icons in the VS Code activity bar:
- **Kino AI** (robot icon): Main extension features
- **Kino Chat** (chat icon): AI chat interface

### 2. Initialize Your Project
The extension automatically creates a `.kino/` directory structure:
```
.kino/
├── specs/          # Project specifications
├── hooks/          # Agent hook configurations
├── steering/       # AI steering documents
└── settings/       # Extension configuration
    └── mcp.json    # MCP server settings
```

### 3. Start Using Features
- **Create a Spec**: Click the "+" in SPECS section, describe your feature
- **Set up AI Chat**: Open Kino Chat panel, configure DeepSeek API key in settings
- **Create a Hook**: Use "Create Hook" command, describe the automation you want
- **Add Steering**: Create steering documents to guide AI behavior

## 📖 Usage Guide

### Working with Specifications

#### Creating a New Spec
1. Click the "+" button in the SPECS section header
2. Enter a natural language description of your feature
3. The extension generates a structured spec with:
   - `requirements.md`: Detailed requirements and acceptance criteria
   - `design.md`: Technical design and architecture
   - `tasks.md`: Implementation tasks and milestones

#### Using the Specs Designer
1. Click on any spec to open the visual designer
2. Edit content with syntax highlighting and live preview
3. Switch between Requirements, Design, and Tasks tabs
4. Changes are automatically saved

#### Context Menu Actions
- **Edit Requirements/Design/Tasks**: Open specific files
- **Open All Files**: Open all spec files in tabs
- **Delete Spec**: Remove the entire specification

### Managing Agent Hooks

#### Creating Hooks with Natural Language
1. Use Command Palette: `Kino AI: Create Hook`
2. Describe what you want: "Run tests when TypeScript files are saved"
3. The AI analyzes your description and creates the hook configuration
4. Review and customize the generated hook

#### Hook Configuration Structure
```json
{
  "name": "Run Tests on Save",
  "eventType": "fileSaved",
  "patterns": ["**/*.ts", "**/*.tsx"],
  "prompt": "Run the test suite for the modified TypeScript files",
  "enabled": true
}
```

#### Hook Execution
- **Manual**: Click the play button next to any hook
- **Automatic**: Hooks trigger based on configured events
- **Monitoring**: Real-time status updates in the sidebar

### AI Chat Interface

#### Chat Styles
Choose from multiple interface styles:
- **Clean**: Minimal, professional interface
- **Copilot**: GitHub Copilot-inspired design
- **Kokonut**: Colorful, modern interface

#### DeepSeek Integration
1. Configure API key in extension settings
2. Choose between:
   - **Chat Mode**: Fast responses for general queries
   - **Reasoning Mode**: Deep analysis for complex problems

#### Using Steering Context
1. Create steering documents in `.kino/steering/`
2. Enable steering in chat interface
3. AI responses will be guided by your steering rules

### AI Steering Configuration

#### Creating Steering Documents
1. Click "+" in AGENT STEERING section
2. Enter filename (e.g., `code-style.md`)
3. Write steering rules in markdown format

#### Example Steering Document
```markdown
# Code Style Steering

## TypeScript Guidelines
- Use strict type checking
- Prefer interfaces over types for object shapes
- Use meaningful variable names
- Add JSDoc comments for public APIs

## Testing Requirements
- Write unit tests for all business logic
- Use descriptive test names
- Mock external dependencies
```

### MCP Server Management

#### Configuration
Edit `.kino/settings/mcp.json`:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "uvx",
      "args": ["mcp-server-filesystem", "/path/to/allowed/files"]
    },
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "."]
    }
  }
}
```

#### Monitoring
- **Status Indicators**: Green (connected), Red (error), Gray (disconnected)
- **Auto-Reconnect**: Automatic retry with exponential backoff
- **Manual Actions**: Right-click for reconnect and info options

## 🏗️ Architecture

### Project Structure
```
.kino/                          # Extension workspace directory
├── specs/                      # Project specifications
│   └── [feature-name]/         # Individual spec directories
│       ├── requirements.md     # Feature requirements
│       ├── design.md          # Technical design
│       └── tasks.md           # Implementation tasks
├── hooks/                      # Agent hook configurations
│   └── *.kino.hook            # Hook definition files
├── steering/                   # AI steering documents
│   └── *.md                   # Steering rule files
└── settings/                   # Extension configuration
    ├── mcp.json               # MCP server configuration
    └── extension.json         # Extension settings
```

### Extension Architecture

#### Core Components
- **Extension Host** (`src/extension.ts`): Main activation and coordination
- **Providers** (`src/providers/`): Tree data providers for sidebar sections
- **Services** (`src/services/`): Business logic and external integrations
- **Webviews** (`src/providers/*WebviewProvider.ts`): UI components for complex interactions
- **Models** (`src/models/`): TypeScript interfaces and type definitions

#### Key Services
- **FileWatcher**: Monitors `.kino/` directory for changes
- **ChatService**: Handles AI chat integration with DeepSeek
- **HookCreationService**: Processes natural language hook descriptions
- **HookExecutionService**: Executes hooks based on file events
- **MCPService**: Manages Model Context Protocol server connections
- **SteeringService**: Manages AI steering document templates

#### Data Flow
1. **File System Events** → FileWatcher → Provider Refresh
2. **User Actions** → Command Handler → Service Layer → UI Update
3. **AI Requests** → Chat Service → DeepSeek API → Response Processing
4. **Hook Triggers** → Event Service → Execution Service → Hook Processing

### Configuration System

#### Extension Settings
The extension uses a comprehensive settings system defined in `src/models/settingsTypes.ts`:

```typescript
interface ExtensionSettings {
  general: GeneralSettings;      // Auto-refresh, logging, theme
  mcp: MCPSettings;             // MCP server configuration
  hooks: HookSettings;          // Hook system settings
  steering: SteeringSettings;   // AI steering configuration
  specs: SpecsSettings;         // Specification management
  llm: LLMSettings;            // AI provider settings
  ui: UISettings;              // Interface preferences
  security: SecuritySettings;  // Security and privacy
}
```

#### Default Configuration
```json
{
  "general": {
    "autoRefresh": true,
    "refreshInterval": 5000,
    "logLevel": "info"
  },
  "hooks": {
    "enabled": true,
    "defaultTimeout": 30000,
    "autoExecuteOnSave": false
  },
  "llm": {
    "defaultProvider": "deepseek",
    "requestTimeout": 30000,
    "enableStreaming": true
  }
}
```

## ⚙️ Configuration

### Extension Settings

Access settings through VS Code preferences or the extension's settings webview:

#### General Settings
- `kino.general.autoRefresh`: Enable automatic refresh of sidebar content
- `kino.general.logLevel`: Set logging level (debug, info, warn, error)
- `kino.general.theme`: UI theme preference (auto, light, dark)

#### AI Chat Settings
- `kino.llm.defaultProvider`: Default AI provider (deepseek)
- `kino.llm.apiKey`: DeepSeek API key for chat functionality
- `kino.llm.requestTimeout`: Request timeout in milliseconds
- `kino.llm.enableStreaming`: Enable streaming responses

#### Hook System Settings
- `kino.hooks.enabled`: Enable/disable hook system
- `kino.hooks.autoExecuteOnSave`: Auto-execute hooks on file save
- `kino.hooks.defaultTimeout`: Default hook execution timeout

#### MCP Settings
- `kino.mcp.autoConnect`: Automatically connect to configured servers
- `kino.mcp.retryAttempts`: Number of connection retry attempts
- `kino.mcp.statusCheckInterval`: Server status check interval

### API Configuration

#### DeepSeek API Setup
1. Get API key from [DeepSeek Platform](https://platform.deepseek.com/)
2. Add to VS Code settings:
   ```json
   {
     "kino.llm.apiKey": "sk-your-api-key-here",
     "kino.llm.defaultProvider": "deepseek"
   }
   ```

#### MCP Server Configuration
Edit `.kino/settings/mcp.json`:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "uvx",
      "args": ["mcp-server-filesystem", "/allowed/path"]
    },
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "."]
    },
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "./database.db"]
    }
  }
}
```

## 🛠️ Development

### Prerequisites
- Node.js 16.x or higher
- VS Code 1.74.0 or higher
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/dazeb/extension-kino-ai.git
cd extension-kino-ai

# Install dependencies
npm install

# Compile TypeScript
npm run compile
```

### Development Workflow
```bash
# Watch mode for development
npm run watch

# Run linting
npm run lint

# Run unit tests
npm run test:unit

# Run integration tests
npm run test

# Build for production
npm run build:production

# Package extension
npm run package
```

### Running in Development
1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test your changes in the new VS Code window

### Testing
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "HookCreationService"
```

### Code Structure
```
src/
├── extension.ts              # Main extension entry point
├── providers/               # Tree data providers and webviews
│   ├── specsProvider.ts     # SPECS section provider
│   ├── hooksProvider.ts     # AGENT HOOKS provider
│   ├── steeringProvider.ts  # AGENT STEERING provider
│   ├── mcpProvider.ts       # MCP SERVERS provider
│   └── *WebviewProvider.ts  # Webview components
├── services/                # Business logic services
│   ├── chatService.ts       # AI chat integration
│   ├── hookCreationService.ts # Hook creation logic
│   ├── mcpService.ts        # MCP server management
│   └── fileWatcher.ts       # File system monitoring
├── models/                  # TypeScript type definitions
├── utils/                   # Utility functions
└── test/                    # Test files
```

### Building and Packaging
```bash
# Validate package configuration
npm run validate:package

# Build production version
npm run build:production

# Create VSIX package
npm run package

# Publish to marketplace (requires publisher access)
npx vsce publish
```

## 📚 API Documentation

### Commands

The extension provides the following VS Code commands:

#### Specification Commands
- `aiSidebar.createNewSpec`: Create a new specification
- `aiSidebar.openSpecRequirements`: Open requirements.md file
- `aiSidebar.openSpecDesign`: Open design.md file
- `aiSidebar.openSpecTasks`: Open tasks.md file
- `aiSidebar.openAllSpecFiles`: Open all spec files
- `aiSidebar.deleteSpec`: Delete a specification

#### Hook Commands
- `aiSidebar.createHook`: Open hook creation interface
- `aiSidebar.editHook`: Edit existing hook
- `aiSidebar.executeHook`: Execute hook manually
- `aiSidebar.toggleHook`: Enable/disable hook
- `aiSidebar.deleteHook`: Delete hook

#### Steering Commands
- `aiSidebar.createSteeringFile`: Create new steering file
- `aiSidebar.editSteeringFile`: Edit steering file
- `aiSidebar.deleteSteeringFile`: Delete steering file
- `aiSidebar.generateFoundationSteering`: Generate foundation steering template

#### MCP Commands
- `aiSidebar.openMCPConfiguration`: Open MCP configuration
- `aiSidebar.reconnectMCPServer`: Reconnect to MCP server
- `aiSidebar.showMCPServerInfo`: Show server information

#### Utility Commands
- `aiSidebar.showLogs`: Show extension logs
- `aiSidebar.clearLogs`: Clear extension logs

### Events

The extension emits the following events:

#### File System Events
- `specs-changed`: Fired when spec files are modified
- `hooks-changed`: Fired when hook files are modified
- `steering-changed`: Fired when steering files are modified
- `refresh-requested`: Manual refresh requested

#### Hook Events
- `hook-executed`: Hook execution completed
- `hook-failed`: Hook execution failed
- `hook-created`: New hook created
- `hook-deleted`: Hook deleted

#### MCP Events
- `statusChanged`: MCP server status changed
- `configurationChanged`: MCP configuration updated

## 🔧 Troubleshooting

### Common Issues

#### Extension Not Loading
1. Check VS Code version (requires 1.74.0+)
2. Verify extension is enabled in Extensions panel
3. Restart VS Code
4. Check Output panel for error messages

#### Chat Not Working
1. Verify DeepSeek API key is configured
2. Check internet connection
3. Ensure API key has sufficient credits
4. Check extension logs for API errors

#### Hooks Not Executing
1. Verify hooks are enabled in settings
2. Check hook file syntax and patterns
3. Ensure file events are being triggered
4. Review hook execution logs

#### MCP Servers Not Connecting
1. Verify server commands are installed
2. Check MCP configuration syntax
3. Ensure server paths are correct
4. Review server logs for errors

#### File Watching Issues
1. Check file system permissions
2. Verify `.kino` directory exists
3. Try manual refresh
4. Restart VS Code if watchers stop working

### Debug Mode

Enable debug logging:
```json
{
  "kino.general.logLevel": "debug"
}
```

View logs:
1. Open Command Palette (Ctrl+Shift+P)
2. Run "Kino AI: Show Logs"
3. Review detailed execution information

### Performance Issues

If experiencing slow performance:
1. Reduce refresh interval in settings
2. Disable auto-refresh for large projects
3. Limit hook execution frequency
4. Check for file system bottlenecks

## 📋 Changelog

### Version 0.0.2 (Current)
- ✅ Added comprehensive AI chat interface with multiple styles
- ✅ Implemented DeepSeek integration with chat and reasoning modes
- ✅ Added visual hook creation interface with natural language processing
- ✅ Enhanced specs designer with live preview and syntax highlighting
- ✅ Improved MCP server management with better status monitoring
- ✅ Added steering context integration for AI guidance
- ✅ Implemented comprehensive settings management
- ✅ Added extensive testing framework with Vitest
- ✅ Enhanced error handling and logging throughout

### Version 0.0.1
- ✅ Initial release with basic sidebar functionality
- ✅ File system monitoring for `.kino` directory
- ✅ Context menu integration
- ✅ Basic MCP server status monitoring
- ✅ Foundation architecture and provider system

### Upcoming Features
- 🔄 Enhanced AI model support (OpenAI, Anthropic, local models)
- 🔄 Advanced hook templates and marketplace
- 🔄 Collaborative features for team workflows
- 🔄 Integration with popular development tools
- 🔄 Advanced analytics and insights

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Document new features and APIs
- Follow existing code style and patterns

### Reporting Issues
Please use our [GitHub Issues](https://github.com/dazeb/extension-kino-ai/issues) to report bugs or request features.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [VS Code Extension API](https://code.visualstudio.com/api) for the excellent documentation
- [DeepSeek](https://platform.deepseek.com/) for AI integration capabilities
- [Model Context Protocol](https://modelcontextprotocol.io/) for standardized AI tool integration
- The VS Code community for inspiration and feedback

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/dazeb/extension-kino-ai/wiki)
- **Issues**: [GitHub Issues](https://github.com/dazeb/extension-kino-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dazeb/extension-kino-ai/discussions)
- **Email**: [daz@dazeb.dev](mailto:daz@dazeb.dev)

---

**Transform your development workflow with AI-powered assistance!** 🚀✨
