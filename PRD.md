# PRD.md - Product Requirements Document for Kino AI Extension

## 1. Executive Summary

Kino AI is a comprehensive VS Code extension designed to transform the development environment into an intelligent, AI-powered workspace. It provides developers with an integrated suite of tools, including an AI assistant, structured project management (Specifications), automated workflows (Agent Hooks), context-aware AI guidance (Steering), and robust server integration (MCP). The primary goal is to enhance developer productivity, streamline project documentation, and automate repetitive tasks through a deeply integrated AI experience within VS Code.

## 2. Product Overview

### 2.1. Vision
To create an all-in-one, AI-native development assistant within VS Code that understands project context, automates workflows, and provides intelligent assistance, thereby reducing cognitive load and accelerating the development lifecycle.

### 2.2. Objectives
- **Enhance Productivity:** Provide an AI chat interface and automated tools to speed up coding, debugging, and documentation.
- **Streamline Project Management:** Offer a structured system for managing project specifications (requirements, design, tasks) directly within the IDE.
- **Automate Workflows:** Enable developers to create custom, event-driven automations (hooks) using natural language.
- **Improve AI Interaction:** Allow developers to guide and steer AI behavior with project-specific context.
- **Ensure Robust Integration:** Provide reliable management and monitoring of Model Context Protocol (MCP) servers.

## 3. Target Users

- **Primary:** Individual developers and small teams using VS Code for software development.
- **Secondary:** Project managers and technical leads looking for integrated documentation and task management solutions.

### User Personas & Use Cases
- **Alex, the Full-Stack Developer:** Uses the AI Chat for coding assistance, the Specs system to understand feature requirements, and creates Hooks to automate testing on file saves.
- **Priya, the Technical Lead:** Uses the Specs system to define and share project architecture and tasks with her team. She uses the Steering feature to enforce team-wide coding standards via the AI.
- **Sam, the DevOps Engineer:** Uses the MCP Server Management panel to monitor and manage connections to various development servers and data sources.

## 4. Key Features

### 4.1. AI Chat Interface
- **Description:** An integrated chat panel for interacting with an AI assistant.
- **Core Requirements:**
  - Support for multiple UI styles (Clean, Copilot-style, Kokonut-inspired).
  - Integration with the DeepSeek LLM (chat and reasoning models).
  - Ability to use content from the active file and steering documents as context.
  - Persistent chat sessions and history.

### 4.2. Specifications (SPECS) Management
- **Description:** A sidebar panel for creating and managing structured project documentation.
- **Core Requirements:**
  - Organize specs into a `.kino/specs/` directory.
  - Each spec consists of `requirements.md`, `design.md`, and `tasks.md`.
  - A webview-based visual designer for editing specs.
  - Ability to generate spec templates from natural language descriptions.
  - Context menu actions for quick file operations.

### 4.3. Agent Hooks
- **Description:** A system for creating and managing automated workflows.
- **Core Requirements:**
  - Trigger hooks based on file events (create, save, delete) or manually.
  - A UI and natural language interface for creating hook configurations.
  - Use glob patterns for targeting specific files.
  - Provide real-time status updates and execution feedback.

### 4.4. AI Steering
- **Description:** A mechanism for guiding the AI's behavior and responses.
- **Core Requirements:**
  - Manage steering documents in a `.kino/steering/` directory.
  - Use steering files as context in AI chat interactions.
  - Provide templates for common steering patterns.
  - Automatically update when steering files are modified.

### 4.5. MCP Server Management
- **Description:** A sidebar panel for managing and monitoring MCP server connections.
- **Core Requirements:**
  - Configure server connections in `.kino/settings/mcp.json`.
  - Provide real-time status indicators (connected, error, disconnected).
  - Implement automatic reconnection logic with configurable retries.
  - Allow manual control over server connections (reconnect, view info).

## 5. Success Metrics

- **Adoption:** Number of active daily/monthly users.
- **Engagement:**
  - Frequency of use for each key feature (Chat, Specs, Hooks).
  - Number of specs, hooks, and steering files created per workspace.
- **Retention:** Percentage of users who continue to use the extension 30 days after installation.
- **User Satisfaction:** High ratings and positive reviews on the VS Code Marketplace.

## 6. Assumptions & Constraints

- **Assumptions:**
  - Users have a working knowledge of VS Code.
  - Users are willing to configure an API key for AI features.
  - The `.kino/` directory at the workspace root is acceptable for storing extension-related data.
- **Constraints:**
  - The extension must operate within the VS Code API limitations.
  - Initial AI provider support is limited to DeepSeek.
  - The extension requires VS Code version 1.74.0 or higher.
