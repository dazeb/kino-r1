import {
    CancellationToken,
    Uri,
    Webview,
    WebviewView,
    WebviewViewProvider,
    WebviewViewResolveContext,
    workspace,
} from 'vscode';
import { EXTENSION_ID } from '../configs';
import { getNonce } from '../helpers';
import { Logger } from '../helpers/logger.helper';

/**
 * Interface for DeepSeek API response
 */
interface DeepSeekAPIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

/**
 * Chat provider for the Kino AI extension
 *
 * @class
 * @implements {WebviewViewProvider}
 */
export class ChatProvider implements WebviewViewProvider {
    // -----------------------------------------------------------------
    // Properties
    // -----------------------------------------------------------------

    /**
     * The view type identifier
     */
    public static readonly viewType = `${EXTENSION_ID}.chatView`;

    private _view?: WebviewView;

    // -----------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------

    /**
     * Constructor for the ChatProvider class
     *
     * @param _extensionUri - The extension URI
     */
    constructor(private readonly _extensionUri: Uri) { }

    // -----------------------------------------------------------------
    // Methods
    // -----------------------------------------------------------------

    /**
     * Resolve the webview view
     */
    public resolveWebviewView(
        webviewView: WebviewView,
        _context: WebviewViewResolveContext,
        _token: CancellationToken,
    ) {
        Logger.info('Resolving webview for chat provider.');
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        Logger.info('Webview HTML set.');

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage((data: { type: string; value: string; model: string }) => {
            Logger.info('Received message from webview:', data.type);
            switch (data.type) {
                case 'sendMessage':
                    this._handleMessage(data.value, data.model);
                    break;
                case 'modeChange':
                    Logger.info(`Switched to ${data.value} mode.`);
                    break;
                case 'modelChange':
                    Logger.info(`Switched to ${data.value} model.`);
                    break;
                case 'ready':
                    Logger.info('Webview is ready.');
                    // Webview is ready
                    break;
            }
        });
    }

    /**
     * Handle incoming messages from the webview
     */
    private async _handleMessage(message: string, model: string) {
        Logger.info('Handling message:', message);
        if (!this._view) {
            Logger.warn('View is not available to handle message.');
            return;
        }

        try {
            // Get configuration
            const config = workspace.getConfiguration('kino');
            const apiKey = config.get<string>('llm.apiKey');
            const provider = config.get<string>('llm.defaultProvider', 'deepseek');
            Logger.info(`Using provider: ${provider} with API key: ${apiKey ? 'present' : 'missing'}`);

            if (!apiKey) {
                Logger.error('API key is not configured.');
                this._view.webview.postMessage({
                    type: 'receiveMessage',
                    value: 'Please configure your API key in the extension settings (kino.llm.apiKey)',
                    isError: true
                });
                return;
            }

            // Show typing indicator
            this._view.webview.postMessage({
                type: 'typing',
                value: true
            });

            // Make API call to DeepSeek
            const response = await this._callDeepSeekAPI(message, apiKey, model);
            Logger.info('Received response from DeepSeek API.');

            // Send response back to webview
            this._view.webview.postMessage({
                type: 'receiveMessage',
                value: response,
                isError: false
            });

        } catch (error) {
            Logger.error('Chat error:', error);

            this._view.webview.postMessage({
                type: 'receiveMessage',
                value: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
                isError: true
            });
        } finally {
            // Hide typing indicator
            if (this._view) {
                this._view.webview.postMessage({
                    type: 'typing',
                    value: false
                });
            }
        }
    }

    /**
     * Call the DeepSeek API
     */
    private async _callDeepSeekAPI(message: string, apiKey: string, model: string): Promise<string> {
        Logger.info('Calling DeepSeek API...');
        const config = workspace.getConfiguration('kino');
        const timeout = config.get<number>('llm.requestTimeout', 30000);

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant integrated into VS Code. Provide concise, accurate responses to help with development tasks.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7
            }),
            signal: AbortSignal.timeout(timeout)
        });

        if (!response.ok) {
            const errorText = await response.text();
            Logger.error(`API Error ${response.status}: ${errorText}`);
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json() as DeepSeekAPIResponse;
        Logger.info('Successfully fetched data from DeepSeek API.');

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            Logger.error('Invalid API response format:', data);
            throw new Error('Invalid API response format');
        }

        return data.choices[0].message.content;
    }

    /**
     * Generate HTML for the webview
     */
    private _getHtmlForWebview(webview: Webview): string {
        Logger.info('Generating HTML for webview.');
        // Get resource URIs
        const scriptUri = webview.asWebviewUri(
            Uri.joinPath(this._extensionUri, 'assets', 'chat', 'main.js')
        );
        const styleResetUri = webview.asWebviewUri(
            Uri.joinPath(this._extensionUri, 'assets', 'reset.css')
        );
        const styleVSCodeUri = webview.asWebviewUri(
            Uri.joinPath(this._extensionUri, 'assets', 'vscode.css')
        );
        const styleMainUri = webview.asWebviewUri(
            Uri.joinPath(this._extensionUri, 'assets', 'chat', 'main.css')
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link href="${styleResetUri}" rel="stylesheet">
    <link href="${styleVSCodeUri}" rel="stylesheet">
    <link href="${styleMainUri}" rel="stylesheet">

    <title>Kino AI Chat</title>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <div class="actions">
                <button id="planMode" class="action-btn" title="Plan Mode">
                    <i class="codicon codicon-lightbulb"></i>
                </button>
                <button id="editMode" class="action-btn" title="Edit Mode">
                    <i class="codicon codicon-edit"></i>
                </button>
                <button id="reasoningMode" class="action-btn" title="Reasoning Model">
                    <i class="codicon codicon-circuit-board"></i>
                </button>
                <button id="chatMode" class="action-btn" title="Chat Model">
                    <i class="codicon codicon-comment"></i>
                </button>
            </div>
        </div>
        <div class="messages" id="messages">
            <div class="message assistant">
                <div class="message-content">
                    <strong>Kino AI:</strong> Hello! I'm your AI development assistant. How can I help you today?
                </div>
            </div>
        </div>

        <div class="typing-indicator" id="typingIndicator" style="display: none;">
            <div class="message assistant">
                <div class="message-content">
                    <em>Kino AI is thinking...</em>
                </div>
            </div>
        </div>

        <div class="input-container">
            <div class="input-wrapper">
                <textarea
                    id="messageInput"
                    placeholder="Ask me anything about your code..."
                    rows="1"
                    aria-label="Chat message input"
                ></textarea>
                <button id="sendButton" type="button" aria-label="Send message">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2.72 2.72a.75.75 0 0 1 1.06 0l9.5 9.5a.75.75 0 1 1-1.06 1.06L3.5 4.56V12a.75.75 0 0 1-1.5 0V2.75c0-.41.34-.75.75-.75h9.25a.75.75 0 0 1 0 1.5H4.56l8.72 8.72z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}
