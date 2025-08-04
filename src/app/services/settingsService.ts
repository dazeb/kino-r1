import * as vscode from 'vscode';
import { ExtensionSettings } from '../models/types';

/**
 * Service for managing extension settings
 */
export class SettingsService {
  private static instance: SettingsService;
  private workspaceFolder: vscode.WorkspaceFolder;

  constructor(workspaceFolder: vscode.WorkspaceFolder) {
    this.workspaceFolder = workspaceFolder;
  }

  public static getInstance(workspaceFolder: vscode.WorkspaceFolder): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService(workspaceFolder);
    }
    return SettingsService.instance;
  }

  /**
   * Get the current extension settings
   */
  public getSettings(): ExtensionSettings {
    const config = vscode.workspace.getConfiguration('kino', this.workspaceFolder.uri);

    return {
      general: {
        autoRefresh: config.get('general.autoRefresh', true),
        logLevel: config.get('general.logLevel', 'info')
      },
      llm: {
        defaultProvider: config.get('llm.defaultProvider', 'deepseek'),
        apiKey: config.get('llm.apiKey', ''),
        requestTimeout: config.get('llm.requestTimeout', 30000)
      },
      hooks: {
        enabled: config.get('hooks.enabled', true),
        autoExecuteOnSave: config.get('hooks.autoExecuteOnSave', false)
      },
      mcp: {
        autoConnect: config.get('mcp.autoConnect', true),
        retryAttempts: config.get('mcp.retryAttempts', 3)
      }
    };
  }

  /**
   * Update a specific setting
   */
  public async updateSetting(key: string, value: any): Promise<void> {
    const config = vscode.workspace.getConfiguration('kino', this.workspaceFolder.uri);
    await config.update(key, value, vscode.ConfigurationTarget.Workspace);
  }

  /**
   * Get the API key securely from secret storage
   */
  public async getApiKey(context: vscode.ExtensionContext): Promise<string> {
    const apiKey = await context.secrets.get('kino.llm.apiKey');
    return apiKey || '';
  }

  /**
   * Store the API key securely in secret storage
   */
  public async setApiKey(context: vscode.ExtensionContext, apiKey: string): Promise<void> {
    await context.secrets.store('kino.llm.apiKey', apiKey);
  }

  /**
   * Watch for configuration changes
   */
  public onConfigurationChanged(callback: (settings: ExtensionSettings) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('kino', this.workspaceFolder.uri)) {
        callback(this.getSettings());
      }
    });
  }
}
