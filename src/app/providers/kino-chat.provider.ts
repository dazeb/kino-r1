import * as vscode from 'vscode';
import { Logger } from '../helpers/logger.helper';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  mode?: string;
  model?: string;
  context?: {
    specs?: string[];
    hooks?: string[];
    files?: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  mode: string;
  model: string;
}

export class KinoChatProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'kinoAI.kinoChatView';

  private _view?: vscode.WebviewView;
  private _currentSession?: ChatSession;
  private _sessions: Map<string, ChatSession> = new Map();

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext,
  ) {
    this._loadSessions();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void | Thenable<void> {
    Logger.info('KinoChatProvider.resolveWebviewView called');
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'sendMessage':
          await this._handleSendMessage(data);
          break;
        case 'clearChat':
          await this._clearChat();
          break;
        case 'exportChat':
          await this._exportChat();
          break;
        case 'loadSession':
          await this._loadSession(data.sessionId);
          break;
        case 'newSession':
          await this._createNewSession();
          break;
        case 'deleteSession':
          await this._deleteSession(data.sessionId);
          break;
        case 'getContext':
          await this._provideContext();
          break;
      }
    });

    // Initialize with a new session if none exists
    if (this._sessions.size === 0) {
      this._createNewSession();
    } else {
      const firstSessionId = Array.from(this._sessions.keys())[0];
      this._loadSession(firstSessionId);
    }
  }

  private async _handleSendMessage(data: any) {
    if (!this._currentSession || !this._view) {
      return;
    }

    const message: ChatMessage = {
      id: this._generateId(),
      role: 'user',
      content: data.message,
      timestamp: new Date(),
      mode: data.mode || 'chat',
      model: data.model || 'deepseek-chat',
    };

    this._currentSession.messages.push(message);
    this._currentSession.updatedAt = new Date();

    // Add user message to UI
    this._view.webview.postMessage({
      type: 'addMessage',
      message: message,
    });

    // Show typing indicator
    this._view.webview.postMessage({
      type: 'setTyping',
      typing: true,
    });

    try {
      const response = await this._getAIResponse(message);

      const assistantMessage: ChatMessage = {
        id: this._generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        mode: message.mode,
        model: message.model,
      };

      this._currentSession.messages.push(assistantMessage);
      this._currentSession.updatedAt = new Date();

      // Add AI response to UI
      this._view.webview.postMessage({
        type: 'addMessage',
        message: assistantMessage,
      });

      // Hide typing indicator
      this._view.webview.postMessage({
        type: 'setTyping',
        typing: false,
      });

      this._saveSessions();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._view.webview.postMessage({
        type: 'error',
        message: `Error: ${errorMessage}`,
      });
      this._view.webview.postMessage({
        type: 'setTyping',
        typing: false,
      });
    }
  }

  private async _getAIResponse(message: ChatMessage): Promise<string> {
    const config = vscode.workspace.getConfiguration('kino');
    const apiKey = config.get<string>('llm.apiKey', '');
    if (!apiKey) {
      throw new Error(
        'API key not configured. Please set your DeepSeek API key in settings.',
      );
    }

    const timeout = config.get<number>('llm.requestTimeout', 30000);

    // Build context from workspace
    const context = await this._buildContext(message);

    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: message.model || 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: this._buildSystemPrompt(message.mode || 'chat', context),
            },
            {
              role: 'user',
              content: message.content,
            },
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(timeout),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as any;
    return data.choices[0].message.content;
  }

  private _buildSystemPrompt(mode: string, context: any): string {
    let prompt = `You are Kino AI, an AI-powered development assistant integrated into VS Code. `;

    switch (mode) {
      case 'plan':
        prompt += `You are in PLAN mode. Help the user plan and design solutions. Focus on breaking down problems into steps, creating specifications, and outlining implementation strategies.`;
        break;
      case 'edit':
        prompt += `You are in EDIT mode. Help the user edit and improve code. Focus on refactoring, optimizing, and implementing specific features based on the provided context.`;
        break;
      case 'reasoning':
        prompt += `You are in REASONING mode. Provide detailed analysis and reasoning. Focus on explaining concepts, debugging issues, and providing thorough explanations.`;
        break;
      default:
        prompt += `You are in CHAT mode. Provide helpful responses for general development questions and tasks.`;
    }

    if (context.specs && context.specs.length > 0) {
      prompt += `\n\nAvailable specifications:\n${context.specs.join('\n')}`;
    }

    if (context.hooks && context.hooks.length > 0) {
      prompt += `\n\nAvailable hooks:\n${context.hooks.join('\n')}`;
    }

    if (context.files && context.files.length > 0) {
      prompt += `\n\nRelevant files:\n${context.files.join('\n')}`;
    }

    return prompt;
  }

  private async _buildContext(_message: ChatMessage): Promise<any> {
    const context: any = {};

    // Get active specifications
    const specs = await this._getActiveSpecs();
    if (specs.length > 0) {
      context.specs = specs;
    }

    // Get active hooks
    const hooks = await this._getActiveHooks();
    if (hooks.length > 0) {
      context.hooks = hooks;
    }

    // Get relevant files based on current workspace
    const files = await this._getRelevantFiles();
    if (files.length > 0) {
      context.files = files;
    }

    return context;
  }

  private async _getActiveSpecs(): Promise<string[]> {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) return [];

      const specsUri = vscode.Uri.joinPath(
        workspaceFolder.uri,
        '.kino',
        'specs',
      );
      const specs = await vscode.workspace.fs.readDirectory(specsUri);
      return specs.map(([name]) => name);
    } catch (error) {
      Logger.error('Failed to get active specs', error);
      return [];
    }
  }

  private async _getActiveHooks(): Promise<string[]> {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) return [];

      const hooksUri = vscode.Uri.joinPath(
        workspaceFolder.uri,
        '.kino',
        'hooks',
      );
      const hooks = await vscode.workspace.fs.readDirectory(hooksUri);
      return hooks.map(([name]) => name);
    } catch (error) {
      Logger.error('Failed to get active hooks', error);
      return [];
    }
  }

  private async _getRelevantFiles(): Promise<string[]> {
    try {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) return [];

      return [activeEditor.document.fileName];
    } catch (error) {
      Logger.error('Failed to get relevant files', error);
      return [];
    }
  }

  private _generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private async _loadSessions() {
    // Implementation would load saved sessions from storage
    this._sessions = new Map();
  }

  private async _saveSessions() {
    // Implementation would save sessions to storage
  }

  private async _createNewSession() {
    const sessionId = this._generateId();
    const newSession: ChatSession = {
      id: sessionId,
      title: `Session ${this._sessions.size + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      mode: 'chat',
      model: 'deepseek-chat',
    };
    this._sessions.set(sessionId, newSession);
    this._currentSession = newSession;
  }

  private async _loadSession(sessionId: string) {
    const session = this._sessions.get(sessionId);
    if (session) {
      this._currentSession = session;
    }
  }

  private async _deleteSession(sessionId: string) {
    this._sessions.delete(sessionId);
  }

  private async _clearChat() {
    if (this._currentSession) {
      this._currentSession.messages = [];
    }
  }

  private async _exportChat() {
    // Implementation would export chat to file
  }

  private async _provideContext() {
    // Implementation would provide context to webview
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'assets',
        'kino-chat',
        'main.css',
      ),
    );
    const jsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'assets', 'kino-chat', 'main.js'),
    );

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kino Chat</title>
            <link href="${cssUri}" rel="stylesheet">
        </head>
        <body>
            <div class="chat-container">
                <div class="chat-main">
                    <div class="chat-header">
                        <div class="actions">
                            <button id="newSessionBtn" class="action-btn" title="New Session">📝</button>
                            <button id="clearBtn" class="action-btn" title="Clear Chat">🗑️</button>
                            <button id="exportBtn" class="action-btn" title="Export">💾</button>
                        </div>
                        <div class="chat-modes">
                            <select id="modeSelect" class="mode-select">
                                <option value="chat">Chat</option>
                                <option value="plan">Plan</option>
                                <option value="edit">Edit</option>
                                <option value="reasoning">Reasoning</option>
                            </select>
                            <select id="modelSelect" class="model-select">
                                <option value="deepseek-chat">DeepSeek Chat</option>
                                <option value="deepseek-coder">DeepSeek Coder</option>
                            </select>
                        </div>
                    </div>
                    
                    <div id="messagesContainer" class="messages-container">
                        <div class="welcome-message">
                            <h2>Welcome to Kino Chat</h2>
                            <p>Your AI-powered development assistant. Start by typing a message below.</p>
                        </div>
                    </div>
                    
                    <div id="typingIndicator" class="typing-indicator" style="display: none;">
                        <span>Kino is thinking...</span>
                    </div>
                    
                    <div class="input-container">
                        <div class="input-wrapper">
                            <textarea id="messageInput" placeholder="Ask Kino AI anything..."></textarea>
                            <button id="sendButton" class="send-button">Send</button>
                        </div>
                    </div>
                </div>
            </div>
            <script src="${jsUri}"></script>
        </body>
        </html>`;
  }
}
