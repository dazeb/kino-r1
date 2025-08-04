// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  // Variables
  const messages = document.querySelector(".message-list");
  const btn = document.querySelector(".btn");
  const input = document.querySelector("input");
  const sendButton = document.getElementById("sendButton");
  const typingIndicator = document.getElementById("typingIndicator");
  const planModeBtn = document.getElementById("planMode");
  const editModeBtn = document.getElementById("editMode");
  const reasoningModeBtn = document.getElementById("reasoningMode");
  const chatModeBtn = document.getElementById("chatMode");

  let currentMode = "plan";
  let currentModel = "deepseek-chat";

  // Event Listeners
  /**
   * Handle the message from the extension
   * @param {Object} event The event object
   * @param {Object} event.data The json data that the extension sent
   * @param {String} event.data.type The type of the message
   * @param {String} event.data.value The value of the message
   * @returns {void}
   */
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "receiveMessage": {
        receiveMessage(message.value);
        break;
      }
    }
  });

  /**
   * Handle the button click event
   * @returns {void}
   * @listens btn#click
   * @emits sendMessage
   * @emits onBtnClicked
   */
  btn.addEventListener("click", () => {
    if (!input.value) return;
    onBtnClicked(input.value);
    sendMessage(input.value);
  });

  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add message to the list
    const messageItem = document.createElement("li");
    messageItem.classList.add("message-item", "item-secondary");
    messageItem.innerHTML = `<strong>You:</strong> ${message}`;
    messages.appendChild(messageItem);
    messages.scrollTop = messages.scrollHeight;
    messageInput.value = "";

    // Send to extension
    vscode.postMessage({
      type: "sendMessage",
      value: message,
      mode: currentMode,
      model: currentModel,
    });
  }

  /**
   * Receive a message from the chat
   * @param {String} text The text to receive
   * @returns {void}
   */
  function receiveMessage(text) {
    const message = document.createElement("li");
    message.classList.add("message-item", "item-primary");
    message.innerHTML = `<strong>Bot:</strong> ${text}`;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  planModeBtn.addEventListener("click", () => {
    currentMode = "plan";
    vscode.postMessage({ type: "modeChange", value: "plan" });
  });

  editModeBtn.addEventListener("click", () => {
    currentMode = "edit";
    vscode.postMessage({ type: "modeChange", value: "edit" });
  });

  reasoningModeBtn.addEventListener("click", () => {
    currentModel = "deepseek-reasoner";
    vscode.postMessage({ type: "modelChange", value: "deepseek-reasoner" });
  });

  chatModeBtn.addEventListener("click", () => {
    currentModel = "deepseek-chat";
    vscode.postMessage({ type: "modelChange", value: "deepseek-chat" });
  });

  messageInput.addEventListener("input", autoResize);

  // Listen for messages from extension
})();
