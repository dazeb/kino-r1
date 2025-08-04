import * as vscode from 'vscode';
import { EXTENSION_ID } from '../configs';

/**
 * A simple logger class for the extension.
 */
export class Logger {
    private static outputChannel = vscode.window.createOutputChannel(EXTENSION_ID);

    private static log(level: 'INFO' | 'WARN' | 'ERROR', message: string, ...optionalParams: any[]): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        console.log(logMessage, ...optionalParams);
        Logger.outputChannel.appendLine(logMessage);
        if (optionalParams.length > 0) {
            optionalParams.forEach(param => {
                Logger.outputChannel.appendLine(JSON.stringify(param, null, 2));
            });
        }
    }

    static info(message: string, ...optionalParams: any[]): void {
        this.log('INFO', message, ...optionalParams);
    }

    static warn(message: string, ...optionalParams: any[]): void {
        this.log('WARN', message, ...optionalParams);
    }

    static error(message: string, ...optionalParams: any[]): void {
        this.log('ERROR', message, ...optionalParams);
    }
}
