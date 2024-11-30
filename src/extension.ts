import * as vscode from "vscode";
import { debounce } from "./debounce";
import { createCompletionProvider } from "./completionProvider";
import { isInlineCompletionEnabled } from "./config";

let providerDisposable: vscode.Disposable | undefined;

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
	const debouncedUpdateStatusBar = debounce(updateStatusBar, 1000);
	const debouncedRegisterProvider = debounce(registerProvider, 1000);

	// Command to toggle the setting
	const toggleCommand = vscode.commands.registerCommand("comphlete.toggleInlineCompletion", async () => {
		const config = vscode.workspace.getConfiguration("comphlete");
		const currentValue = isInlineCompletionEnabled();
		await config.update("enableInlineCompletion", !currentValue, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage(
			`Inline Completion is now ${!currentValue ? "enabled" : "disabled"}.`
		);
		debouncedUpdateStatusBar(); // Update the status bar
		debouncedRegisterProvider(); // Re-register provider if needed
	});
	context.subscriptions.push(toggleCommand);

	// Function to register/unregister the provider based on the setting
	function registerProvider() {
		const shouldRegister = isInlineCompletionEnabled();

		if (shouldRegister && !providerDisposable) {
			const provider = createCompletionProvider(serverUrl);
			providerDisposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);
		} else if (!shouldRegister && providerDisposable) {
			providerDisposable.dispose();
			providerDisposable = undefined;
		}
	}

	// Initial setup
	registerProvider();
	updateStatusBar();

	// Watch for configuration changes
	vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration("comphlete.enableInlineCompletion")) {
			debouncedUpdateStatusBar();
			debouncedRegisterProvider();
		}
	});
}

export function deactivate() {
	if (providerDisposable) {
		providerDisposable.dispose();
	}
}
