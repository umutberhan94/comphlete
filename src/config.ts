import * as vscode from "vscode";

export function getDebounceDelay(): number {
    const config = vscode.workspace.getConfiguration("comphlete");
    return config.get<number>("debounceDelay", 300);
}

export function isInlineCompletionEnabled(): boolean {
    const config = vscode.workspace.getConfiguration("comphlete");
    return config.get<boolean>("enableInlineCompletion", true);
}

export function getTemperature(): number {
    const config = vscode.workspace.getConfiguration("comphlete");
    return config.get<number>("temperature", 0.5);
}

export function getModel(): string {
    const config = vscode.workspace.getConfiguration("comphlete");
    return config.get<string>("model", "qwen2.5-coder:1.5b");
}