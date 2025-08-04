import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Service for watching file system changes in the .kino directory
 */
export class FileWatcherService {
  private watchers: vscode.FileSystemWatcher[] = [];
  private emitter = new vscode.EventEmitter<string>();
  private workspaceFolder: vscode.WorkspaceFolder;

  constructor(workspaceFolder: vscode.WorkspaceFolder) {
    this.workspaceFolder = workspaceFolder;
    this.initializeWatchers();
    this.ensureKinoDirectoryExists();
  }

  /**
   * Event fired when files change in watched directories
   */
  public readonly onFileChanged = this.emitter.event;

  /**
   * Initialize file watchers for .kino subdirectories
   */
  private initializeWatchers(): void {
    const kinoPath = this.getKinoPath();

    // Watch specs directory
    this.createWatcher(path.join(kinoPath, 'specs', '**'), 'specs-changed');

    // Watch hooks directory
    this.createWatcher(path.join(kinoPath, 'hooks', '**'), 'hooks-changed');

    // Watch steering directory
    this.createWatcher(path.join(kinoPath, 'steering', '**'), 'steering-changed');

    // Watch settings directory
    this.createWatcher(path.join(kinoPath, 'settings', '**'), 'settings-changed');
  }

  /**
   * Create a file watcher for a specific pattern
   */
  private createWatcher(pattern: string, eventName: string): void {
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    watcher.onDidCreate(() => this.emitter.fire(eventName));
    watcher.onDidChange(() => this.emitter.fire(eventName));
    watcher.onDidDelete(() => this.emitter.fire(eventName));

    this.watchers.push(watcher);
  }

  /**
   * Get the path to the .kino directory
   */
  private getKinoPath(): string {
    return path.join(this.workspaceFolder.uri.fsPath, '.kino');
  }

  /**
   * Ensure the .kino directory structure exists
   */
  private ensureKinoDirectoryExists(): void {
    const kinoPath = this.getKinoPath();
    const subdirs = ['specs', 'hooks', 'steering', 'settings'];

    // Create .kino directory if it doesn't exist
    if (!fs.existsSync(kinoPath)) {
      fs.mkdirSync(kinoPath, { recursive: true });
    }

    // Create subdirectories
    subdirs.forEach(subdir => {
      const subdirPath = path.join(kinoPath, subdir);
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true });
      }
    });

    // Create default MCP configuration if it doesn't exist
    const mcpConfigPath = path.join(kinoPath, 'settings', 'mcp.json');
    if (!fs.existsSync(mcpConfigPath)) {
      const defaultMcpConfig = {
        mcpServers: {}
      };
      fs.writeFileSync(mcpConfigPath, JSON.stringify(defaultMcpConfig, null, 2));
    }
  }

  /**
   * Get the path to a specific .kino subdirectory
   */
  public getSubdirectoryPath(subdir: 'specs' | 'hooks' | 'steering' | 'settings'): string {
    return path.join(this.getKinoPath(), subdir);
  }

  /**
   * Check if a file exists in the .kino directory
   */
  public fileExists(relativePath: string): boolean {
    const fullPath = path.join(this.getKinoPath(), relativePath);
    return fs.existsSync(fullPath);
  }

  /**
   * Read a file from the .kino directory
   */
  public async readFile(relativePath: string): Promise<string> {
    const fullPath = path.join(this.getKinoPath(), relativePath);
    return fs.promises.readFile(fullPath, 'utf8');
  }

  /**
   * Write a file to the .kino directory
   */
  public async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.getKinoPath(), relativePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, content, 'utf8');
  }

  /**
   * Delete a file from the .kino directory
   */
  public async deleteFile(relativePath: string): Promise<void> {
    const fullPath = path.join(this.getKinoPath(), relativePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  /**
   * List files in a .kino subdirectory
   */
  public async listFiles(subdir: string): Promise<string[]> {
    const fullPath = path.join(this.getKinoPath(), subdir);
    if (!fs.existsSync(fullPath)) {
      return [];
    }
    return fs.promises.readdir(fullPath);
  }

  /**
   * Dispose of all watchers
   */
  public dispose(): void {
    this.watchers.forEach(watcher => watcher.dispose());
    this.emitter.dispose();
  }
}
