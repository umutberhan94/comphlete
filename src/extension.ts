import * as vscode from "vscode";
import { debounce } from "./debounce";
import { createCompletionProvider } from "./completionProvider";
import { isInlineCompletionEnabled } from "./config";
import supportedLanguages from "./supportedLanguages";

let providerDisposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
	const serverUrl = "http://localhost:11434";

	// Status bar item for toggling inline completion
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = "comphlete.toggleInlineCompletion";
	context.subscriptions.push(statusBarItem);

	// Function to update status bar item text
	function updateStatusBar() {
		const currentStatusText = statusBarItem.text;
		const newStatusText = isInlineCompletionEnabled()
			? "$(check) Comphlete"
			: "$(x) Comphlete";

		if (currentStatusText !== newStatusText) {
			statusBarItem.text = newStatusText;
			statusBarItem.tooltip = isInlineCompletionEnabled()
				? "Click to disable inline completion"
				: "Click to enable inline completion";
			statusBarItem.show();
		}
	}

	// Debounced functions using the reusable debounce utility
	const debouncedUpdateStatusBar = debounce(updateStatusBar, 100);
	const debouncedRegisterProvider = debounce(registerProvider, 100);

	// Command to toggle the setting
	const toggleCommand = vscode.commands.registerCommand("comphlete.toggleInlineCompletion", async () => {
		const config = vscode.workspace.getConfiguration("comphlete");
		const currentValue = isInlineCompletionEnabled();
		await config.update("enableInlineCompletion", !currentValue, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage(
			`Inline Completion is now ${!currentValue ? "enabled" : "disabled"}.`
		);
		debouncedUpdateStatusBar();
		debouncedRegisterProvider();
	});
	context.subscriptions.push(toggleCommand);

	function registerProvider() {
		const shouldRegister = isInlineCompletionEnabled();

		if (shouldRegister) {
			providerDisposables.forEach(disposable => disposable.dispose());
			providerDisposables = [];

			const provider = createCompletionProvider(serverUrl);

			supportedLanguages.forEach(language => {
				const disposable = vscode.languages.registerInlineCompletionItemProvider(
					{ language },
					provider
				);
				providerDisposables.push(disposable);
			});
		} else {
			providerDisposables.forEach(disposable => disposable.dispose());
			providerDisposables = [];
		}
	}

	registerProvider();
	updateStatusBar();

	vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration("comphlete.enableInlineCompletion")) {
			debouncedUpdateStatusBar();
			debouncedRegisterProvider();
		}
		if (event.affectsConfiguration("comphlete.model")) {
			debouncedRegisterProvider();
		}
	});
}

export function deactivate() {
	providerDisposables.forEach(disposable => disposable.dispose());
	providerDisposables = [];
}
