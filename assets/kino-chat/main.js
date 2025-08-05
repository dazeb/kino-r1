(function () {
    const vscode = acquireVsCodeApi();

    // DOM Elements
    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const modeSelect = document.getElementById('modeSelect');
    const modelSelect = document.getElementById('modelSelect');
    const newSessionBtn = document.getElementById('newSessionBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');
    const sessionsList = document.getElementById('sessionsList');

    // State
    let currentSession = null;
    let sessions = [];
    let isTyping = false;

    // Initialize
    function initialize() {
        setupEventListeners();
        loadContext();
    }

    function setupEventListeners() {
        // Send message
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Mode and model changes
        modeSelect.addEventListener('change', (e) => {
            vscode.postMessage({
                type: 'modeChange',
                mode: e.target.value
            });
        });

        modelSelect.addEventListener('change', (e) => {
            vscode.postMessage({
                type: 'modelChange',
                model: e.target.value
            });
        });

        // Action buttons
        newSessionBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'newSession' });
        });

        clearBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'clearChat' });
        });

        exportBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'exportChat' });
        });

        // Handle messages from extension
        window.addEventListener('message', handleMessage);
    }

    function handleMessage(event) {
        const message = event.data;
        
        switch (message.type) {
            case 'loadSession':
                loadSession(message.session);
                break;
            case 'addMessage':
                addMessage(message.message);
                break;
            case 'clearMessages':
                clearMessages();
                break;
            case 'setTyping':
                setTyping(message.typing);
                break;
            case 'error':
                showError(message.message);
                break;
            case 'context':
                updateContext(message.context);
                break;
        }
    }

    function loadSession(session) {
        currentSession = session;
        clearMessages();
        
        // Update mode and model selectors
        modeSelect.value = session.mode || 'chat';
        modelSelect.value = session.model || 'deepseek-chat';
        
        // Load messages
        session.messages.forEach(msg => addMessage(msg));
        
        // Update sessions list
        updateSessionsList();
    }

    function addMessage(message) {
        const messageElement = createMessageElement(message);
        messagesContainer.appendChild(messageElement);
        
        // Remove welcome message if it exists
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;
        
        const time = new Date(message.timestamp).toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">${message.role === 'user' ? 'U' : 'K'}</div>
                <span class="message-role">${message.role === 'user' ? 'You' : 'Kino AI'}</span>
                <span class="message-time">${time}</span>
                ${message.mode ? `<span class="message-mode">${message.mode}</span>` : ''}
            </div>
            <div class="message-content">${formatMessageContent(message.content)}</div>
        `;
        
        return messageDiv;
    }

    function formatMessageContent(content) {
        // Handle code blocks
        content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || ''}">${escapeHtml(code.trim())}</code></pre>`;
        });
        
        // Handle inline code
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Handle bold
        content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Handle italic
        content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Handle line breaks
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function clearMessages() {
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <h2>Welcome to Kino Chat</h2>
                <p>Your AI-powered development assistant. Start by typing a message below.</p>
            </div>
        `;
    }

    function setTyping(typing) {
        isTyping = typing;
        typingIndicator.style.display = typing ? 'block' : 'none';
        sendButton.disabled = typing;
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message || isTyping) return;

        vscode.postMessage({
            type: 'sendMessage',
            message: message,
            mode: modeSelect.value,
            model: modelSelect.value
        });

        messageInput.value = '';
        autoResize();
    }

    function autoResize() {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    }

    function showError(errorMessage) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message assistant';
        errorDiv.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">!</div>
                <span class="message-role">Error</span>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="message-content" style="color: var(--vscode-errorForeground);">
                ${escapeHtml(errorMessage)}
            </div>
        `;
        messagesContainer.appendChild(errorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function updateSessionsList() {
        if (!sessionsList) return;
        
        sessionsList.innerHTML = '';
        sessions.forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = `session-item ${session.id === currentSession?.id ? 'active' : ''}`;
            sessionItem.innerHTML = `
                <div class="session-title">${session.title}</div>
                <div class="session-time">${new Date(session.updatedAt).toLocaleDateString()}</div>
            `;
            
            sessionItem.addEventListener('click', () => {
                vscode.postMessage({
                    type: 'loadSession',
                    sessionId: session.id
                });
            });
            
            sessionsList.appendChild(sessionItem);
        });
    }

    function updateContext(context) {
        // Update UI with context information
        console.log('Context updated:', context);
    }

    function loadContext() {
        vscode.postMessage({ type: 'getContext' });
    }

    // Auto-resize textarea
    messageInput.addEventListener('input', autoResize);

    // Initialize
    initialize();
})();
