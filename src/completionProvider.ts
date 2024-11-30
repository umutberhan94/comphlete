import * as vscode from "vscode";
import { OllamaClient } from "./ollamaClient";
import { debounce } from "./debounce";
import { getDebounceDelay } from "./config";

export function createCompletionProvider(serverUrl: string) {
    const ollamaClient = new OllamaClient(serverUrl);

    let debouncedGetCompletion = debounce(
        ollamaClient.getCompletion.bind(ollamaClient),
        getDebounceDelay()
    );

    // Cache the last cursor position to prevent unnecessary calls
    let lastCursorPosition: vscode.Position | null = null;

    const provider: vscode.InlineCompletionItemProvider = {
        async provideInlineCompletionItems(document, position) {
            // Check if the cursor has actually moved
            if (lastCursorPosition && lastCursorPosition.isEqual(position)) {
                return { items: [] };
            }
            lastCursorPosition = position;

            const prefixCode = document.getText(
                new vscode.Range(new vscode.Position(0, 0), position)
            );
            const suffixCode = document.getText(
                new vscode.Range(position, document.lineAt(document.lineCount - 1).range.end)
            );

            const prompt = `<|fim_prefix|>${prefixCode}<|fim_suffix|>${suffixCode}<|fim_middle|>`;
            const model = "qwen2.5-coder:1.5b";

            try {
                const apiResponse = await debouncedGetCompletion(model, prompt);

                if (!apiResponse?.response?.trim()) {
                    return { items: [] };
                }

                const completionText = apiResponse.response;
                const range = new vscode.Range(position, position);

                return { items: [new vscode.InlineCompletionItem(completionText, range)] };
            } catch (error) {
                if (error) {
                    console.error("Error fetching completion:", error);
                    vscode.window.showErrorMessage("Error communicating with Ollama");
                }
                return { items: [] };
            }

        },
    };

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
