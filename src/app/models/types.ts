/**
 * Core types for the Kino AI Extension
 */

export interface Spec {
  name: string;
  path: string;
  requirementsPath: string;
  designPath: string;
  tasksPath: string;
}

export interface Hook {
  name: string;
  eventType: 'fileSaved' | 'fileCreated' | 'fileDeleted' | 'manual';
  patterns: string[];
  prompt: string;
  enabled: boolean;
  filePath: string;
}

export interface SteeringFile {
  name: string;
  path: string;
  content?: string;
}

export interface MCPServer {
  name: string;
  command: string;
  args: string[];
  status: 'connected' | 'disconnected' | 'error';
  lastError?: string;
}

export interface MCPConfiguration {
  mcpServers: Record<string, {
    command: string;
    args: string[];
  }>;
}

export interface ExtensionSettings {
  general: {
    autoRefresh: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  llm: {
    defaultProvider: string;
    apiKey: string;
    requestTimeout: number;
  };
  hooks: {
    enabled: boolean;
    autoExecuteOnSave: boolean;
  };
  mcp: {
    autoConnect: boolean;
    retryAttempts: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  created: Date;
  lastUpdated: Date;
}

export interface DeepSeekTask {
  taskType: 'spec' | 'steering' | 'hook' | 'task';
  description: string;
  priority: 'low' | 'medium' | 'high';
  created: Date;
  completed: boolean;
}

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: 'deepseek-chat' | 'deepseek-reasoner';
  systemPrompt: string;
}
