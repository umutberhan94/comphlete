import * as vscode from "vscode";
import { OllamaClient } from "./ollamaClient";
import { debounce } from "./debounce";
import { getDebounceDelay } from "./config";

export function createCompletionProvider(serverUrl: string) {
    const ollamaClient = new OllamaClient(serverUrl);

    // Initialize debounced function
    let debouncedGetCompletion = debounce(
        ollamaClient.getCompletion.bind(ollamaClient),
        getDebounceDelay()
    );

    // Track the last cursor position and document version
    let lastCursorPosition: vscode.Position | null = null;
    let lastDocumentVersion = -1;

    const provider: vscode.InlineCompletionItemProvider = {
        async provideInlineCompletionItems(document, position) {
            // Prevent unnecessary calls if cursor hasn't moved
            const currentVersion = document.version;
            if (
                lastCursorPosition &&
                lastCursorPosition.isEqual(position) &&
                lastDocumentVersion === currentVersion
            ) {
                return { items: [] };
            }
            lastCursorPosition = position;
            lastDocumentVersion = currentVersion;

            // Prepare the prefix and suffix code
            const prefixCode = document.getText(
                new vscode.Range(new vscode.Position(0, 0), position)
            );
            const suffixCode = document.getText(
                new vscode.Range(position, document.lineAt(document.lineCount - 1).range.end)
            );

            const prompt = `<|fim_prefix|>${prefixCode}<|fim_suffix|>${suffixCode}<|fim_middle|>`;
            const model = vscode.workspace.getConfiguration("comphlete").get("model", "qwen2.5-coder:1.5b");

            try {
                const apiResponse = await debouncedGetCompletion(model, prompt, 5000);

                if (!apiResponse?.response?.trim()) {
                    return { items: [] };
                }

                const completionText = apiResponse.response;
                const range = new vscode.Range(position, position);

                return { items: [new vscode.InlineCompletionItem(completionText, range)] };
            } catch (error) {
                console.error("Error fetching completion:", error);
                vscode.window.showErrorMessage("Error communicating with the completion server. Check your configuration or connection.");
                return { items: [] };
            }
        },
    };

    // Update debounce delay on configuration changes
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("comphlete.debounceDelay")) {
            const newDelay = getDebounceDelay();
            debouncedGetCompletion = debounce(
                ollamaClient.getCompletion.bind(ollamaClient),
                newDelay
            );
            console.log(`Debounce delay updated to: ${newDelay}`);
        }
    });

    return provider;
}
