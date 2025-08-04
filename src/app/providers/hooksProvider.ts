import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { NodeModel } from '../models/node.model';
import { Hook } from '../models/types';
import { FileWatcherService } from '../services/fileWatcherService';

/**
 * Tree data provider for the AGENT HOOKS view
 */
export class HooksProvider implements vscode.TreeDataProvider<NodeModel> {
  private _onDidChangeTreeData: vscode.EventEmitter<NodeModel | undefined | null | void> = new vscode.EventEmitter<NodeModel | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<NodeModel | undefined | null | void> = this._onDidChangeTreeData.event;

  private hooks: Hook[] = [];
  private fileWatcher: FileWatcherService;

  constructor(fileWatcher: FileWatcherService) {
    this.fileWatcher = fileWatcher;
    this.loadHooks();

    // Listen for file changes
    this.fileWatcher.onFileChanged((eventName) => {
      if (eventName === 'hooks-changed') {
        this.refresh();
      }
    });
  }

  /**
   * Refresh the tree view
   */
  public refresh(): void {
    this.loadHooks();
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
      // Root level - return hooks
      return Promise.resolve(this.getHookNodes());
    }

    return Promise.resolve([]);
  }

  /**
   * Load hooks from the file system
   */
  private async loadHooks(): Promise<void> {
    const hooksPath = this.fileWatcher.getSubdirectoryPath('hooks');

    if (!fs.existsSync(hooksPath)) {
      this.hooks = [];
      return;
    }

    try {
      const hookFiles = await fs.promises.readdir(hooksPath);
      this.hooks = [];

      for (const fileName of hookFiles) {
        if (fileName.endsWith('.kino.hook')) {
          const filePath = path.join(hooksPath, fileName);
          try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const hookData = JSON.parse(content);

            const hook: Hook = {
              name: hookData.name || path.basename(fileName, '.kino.hook'),
              eventType: hookData.eventType || 'manual',
              patterns: hookData.patterns || [],
              prompt: hookData.prompt || '',
              enabled: hookData.enabled !== false,
              filePath
            };

            this.hooks.push(hook);
          } catch (error) {
            console.error(`Error parsing hook file ${fileName}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading hooks:', error);
      this.hooks = [];
    }
  }

  /**
   * Convert hooks to tree nodes
   */
  private getHookNodes(): NodeModel[] {
    return this.hooks.map(hook => {
      const iconName = hook.enabled ? 'play-circle' : 'circle-slash';
      const tooltip = `${hook.name}\nEvent: ${hook.eventType}\nEnabled: ${hook.enabled}\nPatterns: ${hook.patterns.join(', ')}`;

      const hookNode = new NodeModel(
        {
          label: hook.name,
          highlights: hook.enabled ? undefined : [[0, hook.name.length]]
        },
        new vscode.ThemeIcon(iconName, hook.enabled ? undefined : new vscode.ThemeColor('disabledForeground')),
        undefined,
        vscode.Uri.file(hook.filePath),
        'hook'
      );

      hookNode.tooltip = tooltip;
      hookNode.description = hook.eventType;

      return hookNode;
    });
  }

  /**
   * Get all hooks
   */
  public getHooks(): Hook[] {
    return this.hooks;
  }

  /**
   * Get a hook by name
   */
  public getHook(name: string): Hook | undefined {
    return this.hooks.find(hook => hook.name === name);
  }

  /**
   * Get enabled hooks
   */
  public getEnabledHooks(): Hook[] {
    return this.hooks.filter(hook => hook.enabled);
  }

  /**
   * Get hooks that match a specific event type
   */
  public getHooksByEventType(eventType: Hook['eventType']): Hook[] {
    return this.hooks.filter(hook => hook.enabled && hook.eventType === eventType);
  }
}
