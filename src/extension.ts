import * as vscode from "vscode";
import { debounce } from "./debounce";
import { createCompletionProvider } from "./completionProvider";
import { isInlineCompletionEnabled } from "./config";

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
		debouncedUpdateStatusBar(); // Update the status bar
		debouncedRegisterProvider(); // Re-register provider if needed
	});
	context.subscriptions.push(toggleCommand);

	// Function to register/unregister the provider based on the setting
	function registerProvider() {
		const shouldRegister = isInlineCompletionEnabled();

		if (shouldRegister) {
			// Dispose of existing providers before registering new ones
			providerDisposables.forEach(disposable => disposable.dispose());
			providerDisposables = [];

			const provider = createCompletionProvider(serverUrl);
			const supportedLanguages = [
				'ada', 'agda', 'alloy', 'antlr', 'applescript', 'assembly', 'augeas', 'awk',
				'batchfile', 'bluespec', 'c', 'c#', 'c++', 'clojure', 'cmake', 'coffeescript',
				'common-lisp', 'css', 'cuda', 'dart', 'dockerfile', 'elixir', 'elm', 'emacs-lisp',
				'erlang', 'f#', 'fortran', 'glsl', 'go', 'groovy', 'haskell', 'html', 'idris', 'isabelle',
				'java', 'java-server-pages', 'javascript', 'json', 'julia', 'jupyter-notebook', 'kotlin',
				'lean', 'literate-agda', 'literate-coffeescript', 'literate-haskell', 'lua', 'makefile',
				'maple', 'markdown', 'mathematica', 'matlab', 'objectc++', 'ocaml', 'pascal', 'perl', 'php',
				'powershell', 'prolog', 'protocol-buffer', 'python', 'r', 'racket', 'restructuredtext',
				'rmarkdown', 'ruby', 'rust', 'sas', 'scala', 'scheme', 'shell', 'smalltalk', 'solidity',
				'sparql', 'sql', 'stan', 'standard-ml', 'stata', 'swift', 'systemverilog', 'tcl', 'tcsh',
				'tex', 'thrift', 'typescript', 'verilog', 'vhdl', 'visual-basic', 'vue', 'xslt', 'yacc',
				'yaml', 'zig'
			];

			supportedLanguages.forEach(language => {
				const disposable = vscode.languages.registerInlineCompletionItemProvider(
					{ language },
					provider
				);
				providerDisposables.push(disposable);
			});
		} else {
			// Dispose of all existing providers
			providerDisposables.forEach(disposable => disposable.dispose());
			providerDisposables = [];
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
	providerDisposables.forEach(disposable => disposable.dispose());
	providerDisposables = [];
}
