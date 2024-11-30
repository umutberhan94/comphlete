import * as vscode from "vscode";
import { createCompletionProvider } from "./completionProvider";
import { isInlineCompletionEnabled } from "./config";

let providerDisposable: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext) {
	const serverUrl = "http://localhost:11434";

	// Status bar item for toggling inline completion
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = "complethe.toggleInlineCompletion";
	context.subscriptions.push(statusBarItem);

	// Function to update status bar item text
	function updateStatusBar() {
		if (isInlineCompletionEnabled()) {
			statusBarItem.text = "$(check) Complethe: Enabled";
			statusBarItem.tooltip = "Click to disable inline completion";
		} else {
			statusBarItem.text = "$(x) Complethe: Disabled";
			statusBarItem.tooltip = "Click to enable inline completion";
		}
		statusBarItem.show();
	}

	// Command to toggle the setting
	const toggleCommand = vscode.commands.registerCommand("complethe.toggleInlineCompletion", async () => {
		const config = vscode.workspace.getConfiguration("complethe");
		const currentValue = isInlineCompletionEnabled();
		await config.update("enableInlineCompletion", !currentValue, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage(
			`Inline Completion is now ${!currentValue ? "enabled" : "disabled"}.`
		);
		registerProvider(); // Re-register provider if needed
		updateStatusBar(); // Update the status bar
	});
	context.subscriptions.push(toggleCommand);

	// Function to register/unregister the provider based on the setting
	function registerProvider() {
		if (providerDisposable) {
			providerDisposable.dispose(); // Dispose of the old provider
			providerDisposable = undefined;
		}
		if (isInlineCompletionEnabled()) {
			const provider = createCompletionProvider(serverUrl);
			providerDisposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);
		}
	}

	// Initial setup
	registerProvider();
	updateStatusBar();

	// Watch for configuration changes
	vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration("complethe.enableInlineCompletion")) {
			updateStatusBar();
			registerProvider();
		}
	});
}

export function deactivate() {
	if (providerDisposable) {
		providerDisposable.dispose();
	}
}
