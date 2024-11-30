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

    const provider: vscode.InlineCompletionItemProvider = {
        async provideInlineCompletionItems(document, position) {
            const documentText = document.getText();
            const prefixCode = documentText.substring(0, document.offsetAt(position));
            const suffixCode = documentText.substring(document.offsetAt(position));
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
                console.error("Error fetching completion:", error);
                vscode.window.showErrorMessage(
                    "Error communicating with Ollama. Ensure it is running on http://localhost:11434"
                );
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
