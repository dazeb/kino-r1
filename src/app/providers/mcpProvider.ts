import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { NodeModel } from '../models/node.model';
import { MCPServer, MCPConfiguration } from '../models/types';
import { FileWatcherService } from '../services/fileWatcherService';

/**
 * Tree data provider for the MCP SERVERS view
 */
export class MCPProvider implements vscode.TreeDataProvider<NodeModel> {
  private _onDidChangeTreeData: vscode.EventEmitter<NodeModel | undefined | null | void> = new vscode.EventEmitter<NodeModel | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<NodeModel | undefined | null | void> = this._onDidChangeTreeData.event;

  private mcpServers: MCPServer[] = [];
  private fileWatcher: FileWatcherService;

  constructor(fileWatcher: FileWatcherService) {
    this.fileWatcher = fileWatcher;
    this.loadMCPServers();

    // Listen for file changes
    this.fileWatcher.onFileChanged((eventName) => {
      if (eventName === 'settings-changed') {
        this.refresh();
      }
    });
  }

  /**
   * Refresh the tree view
   */
  public refresh(): void {
    this.loadMCPServers();
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item for a node
   */
  public getTreeItem(element: NodeModel): vscode.TreeItem {
    return element;
  }

  /**
   * Get children of a node
   */
  public getChildren(element?: NodeModel): Thenable<NodeModel[]> {
    if (!element) {
      // Root level - return MCP servers
      return Promise.resolve(this.getMCPServerNodes());
    }

    return Promise.resolve([]);
  }

  /**
   * Load MCP servers from configuration
   */
  private async loadMCPServers(): Promise<void> {
    try {
      const mcpConfigPath = path.join(this.fileWatcher.getSubdirectoryPath('settings'), 'mcp.json');

      if (!fs.existsSync(mcpConfigPath)) {
        this.mcpServers = [];
        return;
      }

      const configContent = await fs.promises.readFile(mcpConfigPath, 'utf8');
      const config: MCPConfiguration = JSON.parse(configContent);

      this.mcpServers = Object.entries(config.mcpServers || {}).map(([name, serverConfig]) => ({
        name,
        command: serverConfig.command,
        args: serverConfig.args,
        status: 'disconnected' // Default status, will be updated by MCP service
      }));
    } catch (error) {
      console.error('Error loading MCP servers:', error);
      this.mcpServers = [];
    }
  }

  /**
   * Convert MCP servers to tree nodes
   */
  private getMCPServerNodes(): NodeModel[] {
    return this.mcpServers.map(server => {
      let iconName: string;
      let iconColor: vscode.ThemeColor | undefined;

      switch (server.status) {
        case 'connected':
          iconName = 'circle-filled';
          iconColor = new vscode.ThemeColor('charts.green');
          break;
        case 'error':
          iconName = 'error';
          iconColor = new vscode.ThemeColor('charts.red');
          break;
        default:
          iconName = 'circle-outline';
          iconColor = new vscode.ThemeColor('charts.gray');
      }

      const tooltip = `${server.name}\nCommand: ${server.command}\nArgs: ${server.args.join(' ')}\nStatus: ${server.status}`;
      if (server.lastError) {
        tooltip + `\nError: ${server.lastError}`;
      }

      const serverNode = new NodeModel(
        server.name,
        new vscode.ThemeIcon(iconName, iconColor),
        undefined,
        undefined,
        'mcpServer'
      );

      serverNode.tooltip = tooltip;
      serverNode.description = server.status;

      return serverNode;
    });
  }

  /**
   * Get all MCP servers
   */
  public getMCPServers(): MCPServer[] {
    return this.mcpServers;
  }

  /**
   * Update server status
   */
  public updateServerStatus(serverName: string, status: MCPServer['status'], error?: string): void {
    const server = this.mcpServers.find(s => s.name === serverName);
    if (server) {
      server.status = status;
      if (error) {
        server.lastError = error;
      } else {
        delete server.lastError;
      }
      this._onDidChangeTreeData.fire();
    }
  }

  /**
   * Get server by name
   */
  public getServer(name: string): MCPServer | undefined {
    return this.mcpServers.find(server => server.name === name);
  }

  /**
   * Get MCP configuration
   */
  public async getMCPConfiguration(): Promise<MCPConfiguration | null> {
    try {
      const mcpConfigPath = path.join(this.fileWatcher.getSubdirectoryPath('settings'), 'mcp.json');

      if (!fs.existsSync(mcpConfigPath)) {
        return null;
      }

      const configContent = await fs.promises.readFile(mcpConfigPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      console.error('Error reading MCP configuration:', error);
      return null;
    }
  }
}
