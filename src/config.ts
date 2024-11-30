import * as vscode from "vscode";

export function getDebounceDelay(): number {
    const config = vscode.workspace.getConfiguration("complethe");
    return config.get<number>("debounceDelay", 300);
}

export function isInlineCompletionEnabled(): boolean {
    const config = vscode.workspace.getConfiguration("complethe");
    return config.get<boolean>("enableInlineCompletion", true);
}