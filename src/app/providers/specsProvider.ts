import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { NodeModel } from '../models/node.model';
import { Spec } from '../models/types';
import { FileWatcherService } from '../services/fileWatcherService';

/**
 * Tree data provider for the SPECS view
 */
export class SpecsProvider implements vscode.TreeDataProvider<NodeModel> {
  private _onDidChangeTreeData: vscode.EventEmitter<NodeModel | undefined | null | void> = new vscode.EventEmitter<NodeModel | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<NodeModel | undefined | null | void> = this._onDidChangeTreeData.event;

  private specs: Spec[] = [];
  private fileWatcher: FileWatcherService;

  constructor(fileWatcher: FileWatcherService) {
    this.fileWatcher = fileWatcher;
    this.loadSpecs();

    // Listen for file changes
    this.fileWatcher.onFileChanged((eventName) => {
      if (eventName === 'specs-changed') {
        this.refresh();
      }
    });
  }

  /**
   * Refresh the tree view
   */
  public refresh(): void {
    this.loadSpecs();
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
      // Root level - return specs
      return Promise.resolve(this.getSpecNodes());
    }

    // Return children if any
    return Promise.resolve(element.children || []);
  }

  /**
   * Load specs from the file system
   */
  private async loadSpecs(): Promise<void> {
    const specsPath = this.fileWatcher.getSubdirectoryPath('specs');

    if (!fs.existsSync(specsPath)) {
      this.specs = [];
      return;
    }

    try {
      const specDirs = await fs.promises.readdir(specsPath, { withFileTypes: true });
      this.specs = [];

      for (const dir of specDirs) {
        if (dir.isDirectory()) {
          const specPath = path.join(specsPath, dir.name);
          const requirementsPath = path.join(specPath, 'requirements.md');
          const designPath = path.join(specPath, 'design.md');
          const tasksPath = path.join(specPath, 'tasks.md');

          const spec: Spec = {
            name: dir.name,
            path: specPath,
            requirementsPath,
            designPath,
            tasksPath
          };

          this.specs.push(spec);
        }
      }
    } catch (error) {
      console.error('Error loading specs:', error);
      this.specs = [];
    }
  }

  /**
   * Convert specs to tree nodes
   */
  private getSpecNodes(): NodeModel[] {
    return this.specs.map(spec => {
      const specNode = new NodeModel(
        spec.name,
        new vscode.ThemeIcon('folder'),
        undefined,
        vscode.Uri.file(spec.path),
        'spec'
      );

      // Add file children
      const children: NodeModel[] = [];

      if (fs.existsSync(spec.requirementsPath)) {
        children.push(new NodeModel(
          'requirements.md',
          new vscode.ThemeIcon('file'),
          {
            command: 'vscode.open',
            title: 'Open Requirements',
            arguments: [vscode.Uri.file(spec.requirementsPath)]
          },
          vscode.Uri.file(spec.requirementsPath),
          'specFile'
        ));
      }

      if (fs.existsSync(spec.designPath)) {
        children.push(new NodeModel(
          'design.md',
          new vscode.ThemeIcon('file'),
          {
            command: 'vscode.open',
            title: 'Open Design',
            arguments: [vscode.Uri.file(spec.designPath)]
          },
          vscode.Uri.file(spec.designPath),
          'specFile'
        ));
      }

      if (fs.existsSync(spec.tasksPath)) {
        children.push(new NodeModel(
          'tasks.md',
          new vscode.ThemeIcon('file'),
          {
            command: 'vscode.open',
            title: 'Open Tasks',
            arguments: [vscode.Uri.file(spec.tasksPath)]
          },
          vscode.Uri.file(spec.tasksPath),
          'specFile'
        ));
      }

      specNode.setChildren(children);
      return specNode;
    });
  }

  /**
   * Get all specs
   */
  public getSpecs(): Spec[] {
    return this.specs;
  }

  /**
   * Get a spec by name
   */
  public getSpec(name: string): Spec | undefined {
    return this.specs.find(spec => spec.name === name);
  }
}
