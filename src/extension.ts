import * as vscode from "vscode";
import { OllamaClient } from "./ollamaClient";

export function activate(context: vscode.ExtensionContext) {
	const serverUrl = "http://localhost:11434";
	const ollamaClient = new OllamaClient(serverUrl);

	const provider: vscode.InlineCompletionItemProvider = {
		async provideInlineCompletionItems(document, position, context, token) {
			console.log(position);
			const documentText = document.getText();

			const prefixCode = documentText.substring(0, document.offsetAt(position));
			const suffixCode = documentText.substring(document.offsetAt(position));

			const prompt = `<|fim_prefix|>${prefixCode}<|fim_suffix|>${suffixCode}<|fim_middle|>`;

			const model = "qwen2.5-coder:1.5b";

			try {
				// Send the prompt to the AI
				const apiResponse = await ollamaClient.getCompletion(model, prompt);

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

	// // Supported languages
	// const supportedLanguages = [
	// 	"javascript", "typescript", "python", "java", "csharp", "ruby", "php", "go", "rust", "swift",
	// 	"kotlin", "c", "cpp", "sql", "html", "css", "bash", "dart", "r", "julia"
	// ];

	// // Register the inline completion provider for each language
	// supportedLanguages.forEach((language) => {
	// 	context.subscriptions.push(
	// 		vscode.languages.registerInlineCompletionItemProvider({ language }, provider)
	// 	);
	// });

	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);
}

export function deactivate() { }