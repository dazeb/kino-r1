import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { NodeModel } from '../models/node.model';
import { SteeringFile } from '../models/types';
import { FileWatcherService } from '../services/fileWatcherService';

/**
 * Tree data provider for the AGENT STEERING view
 */
export class SteeringProvider implements vscode.TreeDataProvider<NodeModel> {
  private _onDidChangeTreeData: vscode.EventEmitter<NodeModel | undefined | null | void> = new vscode.EventEmitter<NodeModel | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<NodeModel | undefined | null | void> = this._onDidChangeTreeData.event;

  private steeringFiles: SteeringFile[] = [];
  private fileWatcher: FileWatcherService;

  constructor(fileWatcher: FileWatcherService) {
    this.fileWatcher = fileWatcher;
    this.loadSteeringFiles();

    // Listen for file changes
    this.fileWatcher.onFileChanged((eventName) => {
      if (eventName === 'steering-changed') {
        this.refresh();
      }
    });
  }

  /**
   * Refresh the tree view
   */
  public refresh(): void {
    this.loadSteeringFiles();
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
      // Root level - return steering files
      return Promise.resolve(this.getSteeringFileNodes());
    }

    return Promise.resolve([]);
  }

  /**
   * Load steering files from the file system
   */
  private async loadSteeringFiles(): Promise<void> {
    const steeringPath = this.fileWatcher.getSubdirectoryPath('steering');

    if (!fs.existsSync(steeringPath)) {
      this.steeringFiles = [];
      return;
    }

    try {
      const files = await fs.promises.readdir(steeringPath);
      this.steeringFiles = [];

      for (const fileName of files) {
        if (fileName.endsWith('.md')) {
          const filePath = path.join(steeringPath, fileName);
          const steeringFile: SteeringFile = {
            name: path.basename(fileName, '.md'),
            path: filePath
          };

          this.steeringFiles.push(steeringFile);
        }
      }

      // Sort by name
      this.steeringFiles.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error loading steering files:', error);
      this.steeringFiles = [];
    }
  }

  /**
   * Convert steering files to tree nodes
   */
  private getSteeringFileNodes(): NodeModel[] {
    return this.steeringFiles.map(steeringFile => {
      return new NodeModel(
        steeringFile.name,
        new vscode.ThemeIcon('file'),
        {
          command: 'vscode.open',
          title: 'Open Steering File',
          arguments: [vscode.Uri.file(steeringFile.path)]
        },
        vscode.Uri.file(steeringFile.path),
        'steeringFile'
      );
    });
  }

  /**
   * Get all steering files
   */
  public getSteeringFiles(): SteeringFile[] {
    return this.steeringFiles;
  }

  /**
   * Get a steering file by name
   */
  public getSteeringFile(name: string): SteeringFile | undefined {
    return this.steeringFiles.find(file => file.name === name);
  }

  /**
   * Read content of a steering file
   */
  public async getSteeringFileContent(name: string): Promise<string | undefined> {
    const steeringFile = this.getSteeringFile(name);
    if (!steeringFile) {
      return undefined;
    }

    try {
      return await fs.promises.readFile(steeringFile.path, 'utf8');
    } catch (error) {
      console.error(`Error reading steering file ${name}:`, error);
      return undefined;
    }
  }

  /**
   * Get content of multiple steering files
   */
  public async getMultipleSteeringFileContent(names: string[]): Promise<string> {
    const contents: string[] = [];

    for (const name of names) {
      const content = await this.getSteeringFileContent(name);
      if (content) {
        contents.push(`# ${name}\n\n${content}`);
      }
    }

    return contents.join('\n\n---\n\n');
  }
}
