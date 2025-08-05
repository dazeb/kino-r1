# Kino Chat - AI-Powered Development Assistant

## Overview

Kino Chat is a modern, feature-rich webview panel integrated into the Kino AI VSCode extension. It provides a dedicated interface for AI-powered development assistance with context-aware conversations, multiple chat modes, and seamless integration with your workspace.

## Features

### 🎯 Multiple Chat Modes
- **Chat Mode**: General development questions and assistance
- **Plan Mode**: Break down problems into steps and create specifications
- **Edit Mode**: Refactor and optimize code with AI assistance
- **Reasoning Mode**: Detailed analysis and debugging support

### 🧠 Context-Aware AI
- **Workspace Integration**: Automatically includes context from your specs, hooks, and active files
- **Smart Context Building**: AI responses are enhanced with relevant project information
- **File Awareness**: Knows which files you're currently working on

### 💬 Modern Chat Interface
- **Clean Design**: VSCode-native styling that matches your theme
- **Rich Messages**: Support for code blocks, markdown, and syntax highlighting
- **Session Management**: Create, save, and manage multiple chat sessions
- **Export Functionality**: Export conversations to markdown files

### ⚙️ Advanced Features
- **Model Selection**: Switch between DeepSeek Chat and DeepSeek Reasoner
- **Persistent Sessions**: Chat history is saved across VSCode restarts
- **Real-time Typing**: Visual feedback when AI is processing
- **Error Handling**: Graceful error messages and recovery

## Getting Started

### Installation
1. Install the Kino AI extension from the VSCode marketplace
2. Open a workspace folder (required for full functionality)
3. Navigate to the "Kino Chat" panel in the activity bar

### Configuration
Set your DeepSeek API key in VSCode settings:
```json
{
  "kino.llm.apiKey": "your-deepseek-api-key-here"
}
```

### Basic Usage
1. **Start a Conversation**: Type your message in the input box and press Enter
2. **Switch Modes**: Use the mode selector to change between Chat, Plan, Edit, and Reasoning modes
3. **Change Models**: Select between DeepSeek Chat and DeepSeek Reasoner models
4. **Manage Sessions**: Create new sessions or switch between existing ones

## Interface Guide

### Chat Header
- **Mode Selector**: Dropdown to switch between chat modes
- **Model Selector**: Choose between different AI models
- **Action Buttons**: New session, clear chat, and export functionality

### Sidebar
- **Sessions List**: Shows all your chat sessions with timestamps
- **Active Session**: Highlighted session currently being viewed

### Main Chat Area
- **Messages**: Displayed in a clean, threaded format
- **User Messages**: Right-aligned with distinct styling
- **AI Messages**: Left-aligned with detailed responses
- **Code Blocks**: Syntax-highlighted code snippets
- **Timestamps**: Shows when each message was sent

## Advanced Usage

### Context Integration
The AI automatically includes context from:
- **Specifications**: Available specs in your `specs/` directory
- **Hooks**: Active hooks in your `hooks/` directory
- **Current File**: The file you have open in the editor

### Session Management
- **New Session**: Click the "+" button to start a fresh conversation
- **Switch Sessions**: Click on any session in the sidebar to load it
- **Clear Session**: Remove all messages from the current session
- **Export Session**: Save the entire conversation as a markdown file

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift+Enter**: New line in input
- **Ctrl/Cmd+Enter**: Force send (even if input is empty)

## Examples

### Plan Mode Example
```
User: "I need to implement user authentication"
AI: "Let's break this down into a specification..."
[Provides detailed plan with requirements, design, and tasks]
```

### Edit Mode Example
```
User: "Refactor this function to use async/await"
AI: "Here's the refactored code..."
[Provides optimized code with explanations]
```

### Reasoning Mode Example
```
User: "Why is this API call failing?"
AI: "Let me analyze the potential causes..."
[Provides detailed debugging steps]
```

## Troubleshooting

### Common Issues

**API Key Not Set**
- Error: "API key not configured"
- Solution: Set `kino.llm.apiKey` in VSCode settings

**No Workspace Open**
- Error: "Kino AI requires an open workspace"
- Solution: Open a folder in VSCode

**Network Issues**
- Error: "API Error"
- Solution: Check internet connection and API key validity

### Debug Mode
Enable debug logging in settings:
```json
{
  "kino.general.logLevel": "debug"
}
```

## Development

### Architecture
- **KinoChatProvider**: Main webview provider class
- **ChatSession**: Manages conversation state and persistence
- **Context Builder**: Gathers workspace context for AI
- **Message Formatter**: Handles markdown and code formatting

### File Structure
```
src/app/providers/kino-chat.provider.ts  # Main provider
assets/kino-chat/
├── main.css                             # Styling
└── main.js                              # Webview frontend
```

## Contributing
Contributions are welcome! Please see the main CONTRIBUTING.md file for guidelines.

## License
MIT License - see LICENSE file for details.
