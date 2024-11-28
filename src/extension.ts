import * as vscode from "vscode";
import { OllamaClient } from "./ollamaClient";

function debounce<T extends (...args: any[]) => any>(func: T, delay: number) {
	let timer: NodeJS.Timeout;
	return (...args: Parameters<T>): Promise<ReturnType<T>> =>
		new Promise((resolve) => {
			clearTimeout(timer);
			timer = setTimeout(() => resolve(func(...args)), delay);
		});
}

export function activate(context: vscode.ExtensionContext) {
	const serverUrl = "http://localhost:11434";
	const ollamaClient = new OllamaClient(serverUrl);

	const debouncedGetCompletion = debounce(ollamaClient.getCompletion.bind(ollamaClient), 300);

	const provider: vscode.InlineCompletionItemProvider = {
		async provideInlineCompletionItems(document, position, context, token) {
			const documentText = document.getText();

			const prefixCode = documentText.substring(0, document.offsetAt(position));
			const suffixCode = documentText.substring(document.offsetAt(position));

			const prompt = `<|fim_prefix|>${prefixCode}<|fim_suffix|>${suffixCode}<|fim_middle|>`;

			const model = "qwen2.5-coder:1.5b";

			try {
				// Send the prompt to the AI
				const apiResponse = await debouncedGetCompletion(model, prompt);

				// Ensure a valid response
				if (!apiResponse?.response?.trim()) {
					return { items: [] };
				}

				let completionText = apiResponse.response.trim();

				// Define the range for the completion at the cursor position
				const range = new vscode.Range(position, position);

				// Return the inline completion item
				return { items: [new vscode.InlineCompletionItem(completionText, range)] };
			} catch (error) {
				// Log errors and display a message to the user
				console.error("Error fetching completion:", error);
				vscode.window.showErrorMessage("Error communicating with Ollama. Ensure it is running on http://localhost:11434");
				return { items: [] };
			}
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);
}

export function deactivate() { }