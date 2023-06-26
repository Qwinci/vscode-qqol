// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand("qqol.backspaceLeft", backspace));
}

function backspace() {
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}

	const tabSize = editor.options.tabSize as number;
	const selections = editor.selections;
	const document = editor.document;

	let hasNewSelections = false;
	const newSelections = selections.map(selection => {
		if (!selection.isEmpty) {
			return selection;
		}

		const start = selection.start;
		if (start.character === 0 || start.line === 0) {
			return selection;
		}

		const line = document.lineAt(start);

		const prevLine = document.lineAt(start.line - 1);
		if (line.firstNonWhitespaceCharacterIndex < start.character) {
			return selection;
		}
		
		const text = line.text.substring(0, start.character);
		const match = /^[\t ]+$/.exec(text);
		if (match) {
			hasNewSelections = true;
			const anchor = prevLine.range.end;
			return new vscode.Selection(anchor, start);
		}

		return selection;
	});

	if (hasNewSelections) {
		editor.selections = newSelections;
	}

	return vscode.commands.executeCommand("deleteLeft");
}

// This method is called when your extension is deactivated
export function deactivate() {}
