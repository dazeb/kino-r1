// The module 'vscode' contains the VSCode extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Import our services and providers
import { SettingsService, FileWatcherService } from './app/services';
import {
  SpecsProvider,
  HooksProvider,
  SteeringProvider,
  MCPProvider,
  ChatProvider,
  KinoChatProvider,
} from './app/providers';
import { Logger } from './app/helpers/logger.helper';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  Logger.info('Kino AI extension is activating...');
  console.log('Kino AI extension is now active!');

  // Check if there are workspace folders
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    vscode.window.showErrorMessage(
      'Kino AI requires an open workspace folder to function.',
    );
    return;
  }

  // Get the first workspace folder (we can enhance this later to support multiple folders)
  const workspaceFolder = vscode.workspace.workspaceFolders[0];

  // -----------------------------------------------------------------
  // Initialize Services
  // -----------------------------------------------------------------

  // Initialize settings service
  const settingsService = SettingsService.getInstance(workspaceFolder);

  // Initialize file watcher service
  const fileWatcherService = new FileWatcherService(workspaceFolder);

  // -----------------------------------------------------------------
  // Initialize Providers
  // -----------------------------------------------------------------

  // Create tree data providers
  const specsProvider = new SpecsProvider(fileWatcherService);
  const hooksProvider = new HooksProvider(fileWatcherService);
  const steeringProvider = new SteeringProvider(fileWatcherService);
  const mcpProvider = new MCPProvider(fileWatcherService);

  // -----------------------------------------------------------------
  // Register Tree Views
  // -----------------------------------------------------------------

  // Register the SPECS tree view
  const specsTreeView = vscode.window.createTreeView('kinoAI.specsView', {
    treeDataProvider: specsProvider,
    showCollapseAll: true,
  });

  // Register the AGENT HOOKS tree view
  const hooksTreeView = vscode.window.createTreeView('kinoAI.hooksView', {
    treeDataProvider: hooksProvider,
    showCollapseAll: true,
  });

  // Register the AGENT STEERING tree view
  const steeringTreeView = vscode.window.createTreeView('kinoAI.steeringView', {
    treeDataProvider: steeringProvider,
    showCollapseAll: true,
  });

  // Register the MCP SERVERS tree view
  const mcpTreeView = vscode.window.createTreeView('kinoAI.mcpView', {
    treeDataProvider: mcpProvider,
    showCollapseAll: true,
  });

  // -----------------------------------------------------------------
  // Register Commands
  // -----------------------------------------------------------------

  // CHAT Commands
  const openChatCommand = vscode.commands.registerCommand(
    'kinoAI.openChat',
    async () => {
      // Focus on the chat view
      await vscode.commands.executeCommand('kinoAI.kinoChatView.focus');
    },
  );

  // SPECS Commands
  const createNewSpecCommand = vscode.commands.registerCommand(
    'kinoAI.createNewSpec',
    async () => {
      const specName = await vscode.window.showInputBox({
        prompt: 'Enter the name for the new specification',
        placeHolder: 'e.g., user-authentication',
      });

      if (specName) {
        try {
          // Create spec directory
          const specPath = `specs/${specName}`;
          await fileWatcherService.writeFile(
            `${specPath}/requirements.md`,
            `# ${specName} - Requirements\n\n## Overview\n\nTODO: Add requirements for ${specName}\n`,
          );
          await fileWatcherService.writeFile(
            `${specPath}/design.md`,
            `# ${specName} - Design\n\n## Architecture\n\nTODO: Add design for ${specName}\n`,
          );
          await fileWatcherService.writeFile(
            `${specPath}/tasks.md`,
            `# ${specName} - Tasks\n\n## Implementation Tasks\n\nTODO: Add tasks for ${specName}\n`,
          );

          vscode.window.showInformationMessage(
            `Specification '${specName}' created successfully!`,
          );
        } catch (error) {
          vscode.window.showErrorMessage(
            `Failed to create specification: ${error}`,
          );
        }
      }
    },
  );

  const openSpecRequirementsCommand = vscode.commands.registerCommand(
    'kinoAI.openSpecRequirements',
    async (node) => {
      if (node && node.resourceUri) {
        const specName = node.label;
        const requirementsPath = vscode.Uri.joinPath(
          node.resourceUri,
          'requirements.md',
        );
        await vscode.window.showTextDocument(requirementsPath);
      }
    },
  );

  const openSpecDesignCommand = vscode.commands.registerCommand(
    'kinoAI.openSpecDesign',
    async (node) => {
      if (node && node.resourceUri) {
        const specName = node.label;
        const designPath = vscode.Uri.joinPath(node.resourceUri, 'design.md');
        await vscode.window.showTextDocument(designPath);
      }
    },
  );

  const openSpecTasksCommand = vscode.commands.registerCommand(
    'kinoAI.openSpecTasks',
    async (node) => {
      if (node && node.resourceUri) {
        const specName = node.label;
        const tasksPath = vscode.Uri.joinPath(node.resourceUri, 'tasks.md');
        await vscode.window.showTextDocument(tasksPath);
      }
    },
  );

  const deleteSpecCommand = vscode.commands.registerCommand(
    'kinoAI.deleteSpec',
    async (node) => {
      if (node && node.resourceUri) {
        const specName = node.label;
        const result = await vscode.window.showWarningMessage(
          `Are you sure you want to delete the specification '${specName}'?`,
          { modal: true },
          'Delete',
        );

        if (result === 'Delete') {
          try {
            await vscode.workspace.fs.delete(node.resourceUri, {
              recursive: true,
            });
            vscode.window.showInformationMessage(
              `Specification '${specName}' deleted successfully!`,
            );
          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed to delete specification: ${error}`,
            );
          }
        }
      }
    },
  );

  // HOOKS Commands
  const createHookCommand = vscode.commands.registerCommand(
    'kinoAI.createHook',
    async () => {
      const hookName = await vscode.window.showInputBox({
        prompt: 'Enter the name for the new hook',
        placeHolder: 'e.g., run-tests-on-save',
      });

      if (hookName) {
        try {
          const hookConfig = {
            name: hookName,
            eventType: 'manual',
            patterns: ['**/*'],
            prompt: 'TODO: Define what this hook should do',
            enabled: true,
          };

          await fileWatcherService.writeFile(
            `hooks/${hookName}.kino.hook`,
            JSON.stringify(hookConfig, null, 2),
          );
          vscode.window.showInformationMessage(
            `Hook '${hookName}' created successfully!`,
          );
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create hook: ${error}`);
        }
      }
    },
  );

  const executeHookCommand = vscode.commands.registerCommand(
    'kinoAI.executeHook',
    async (node) => {
      if (node && node.resourceUri) {
        vscode.window.showInformationMessage(
          `Executing hook: ${node.label} (functionality will be implemented in Phase 2)`,
        );
      }
    },
  );

  const editHookCommand = vscode.commands.registerCommand(
    'kinoAI.editHook',
    async (node) => {
      if (node && node.resourceUri) {
        await vscode.window.showTextDocument(node.resourceUri);
      }
    },
  );

  const deleteHookCommand = vscode.commands.registerCommand(
    'kinoAI.deleteHook',
    async (node) => {
      if (node && node.resourceUri) {
        const hookName = node.label;
        const result = await vscode.window.showWarningMessage(
          `Are you sure you want to delete the hook '${hookName}'?`,
          { modal: true },
          'Delete',
        );

        if (result === 'Delete') {
          try {
            await vscode.workspace.fs.delete(node.resourceUri);
            vscode.window.showInformationMessage(
              `Hook '${hookName}' deleted successfully!`,
            );
          } catch (error) {
            vscode.window.showErrorMessage(`Failed to delete hook: ${error}`);
          }
        }
      }
    },
  );

  // STEERING Commands
  const createSteeringFileCommand = vscode.commands.registerCommand(
    'kinoAI.createSteeringFile',
    async () => {
      const fileName = await vscode.window.showInputBox({
        prompt: 'Enter the name for the new steering file',
        placeHolder: 'e.g., code-style',
      });

      if (fileName) {
        try {
          const content = `# ${fileName} Steering\n\n## Guidelines\n\nTODO: Add steering guidelines for ${fileName}\n`;
          await fileWatcherService.writeFile(
            `steering/${fileName}.md`,
            content,
          );
          vscode.window.showInformationMessage(
            `Steering file '${fileName}' created successfully!`,
          );
        } catch (error) {
          vscode.window.showErrorMessage(
            `Failed to create steering file: ${error}`,
          );
        }
      }
    },
  );

  const editSteeringFileCommand = vscode.commands.registerCommand(
    'kinoAI.editSteeringFile',
    async (node) => {
      if (node && node.resourceUri) {
        await vscode.window.showTextDocument(node.resourceUri);
      }
    },
  );

  const deleteSteeringFileCommand = vscode.commands.registerCommand(
    'kinoAI.deleteSteeringFile',
    async (node) => {
      if (node && node.resourceUri) {
        const fileName = node.label;
        const result = await vscode.window.showWarningMessage(
          `Are you sure you want to delete the steering file '${fileName}'?`,
          { modal: true },
          'Delete',
        );

        if (result === 'Delete') {
          try {
            await vscode.workspace.fs.delete(node.resourceUri);
            vscode.window.showInformationMessage(
              `Steering file '${fileName}' deleted successfully!`,
            );
          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed to delete steering file: ${error}`,
            );
          }
        }
      }
    },
  );

  // MCP Commands
  const openMCPConfigurationCommand = vscode.commands.registerCommand(
    'kinoAI.openMCPConfiguration',
    async () => {
      try {
        const mcpConfigPath = vscode.Uri.joinPath(
          workspaceFolder.uri,
          '.kino',
          'settings',
          'mcp.json',
        );
        await vscode.window.showTextDocument(mcpConfigPath);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to open MCP configuration: ${error}`,
        );
      }
    },
  );

  // Refresh Commands
  const refreshSpecsCommand = vscode.commands.registerCommand(
    'kinoAI.refreshSpecs',
    () => {
      specsProvider.refresh();
    },
  );

  const refreshHooksCommand = vscode.commands.registerCommand(
    'kinoAI.refreshHooks',
    () => {
      hooksProvider.refresh();
    },
  );

  const refreshSteeringCommand = vscode.commands.registerCommand(
    'kinoAI.refreshSteering',
    () => {
      steeringProvider.refresh();
    },
  );

  const refreshMCPCommand = vscode.commands.registerCommand(
    'kinoAI.refreshMCP',
    () => {
      mcpProvider.refresh();
    },
  );

  // -----------------------------------------------------------------
  // Add subscriptions to context
  // -----------------------------------------------------------------

  context.subscriptions.push(
    // Tree views
    specsTreeView,
    hooksTreeView,
    steeringTreeView,
    mcpTreeView,
    // Commands
    openChatCommand,
    createNewSpecCommand,
    openSpecRequirementsCommand,
    openSpecDesignCommand,
    openSpecTasksCommand,
    deleteSpecCommand,
    createHookCommand,
    executeHookCommand,
    editHookCommand,
    deleteHookCommand,
    createSteeringFileCommand,
    editSteeringFileCommand,
    deleteSteeringFileCommand,
    openMCPConfigurationCommand,
    refreshSpecsCommand,
    refreshHooksCommand,
    refreshSteeringCommand,
    refreshMCPCommand,
    // Services
    fileWatcherService,
  );

  // Register chat webview
  const kinoChatProvider = new KinoChatProvider(context.extensionUri, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      KinoChatProvider.viewType,
      kinoChatProvider,
    ),
  );
  Logger.info(
    `Chat webview registered with viewType: ${KinoChatProvider.viewType}`,
  );

  // Show welcome message
  vscode.window.showInformationMessage(
    'Kino AI is now active! Check the sidebar for SPECS, AGENT HOOKS, AGENT STEERING, and MCP SERVERS.',
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  Logger.info('Kino AI extension is deactivating.');
  console.log('Kino AI extension is now deactivated!');
}
