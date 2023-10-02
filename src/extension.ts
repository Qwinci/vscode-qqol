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

	const newSelections = selections.map(selection => {
		if (!selection.isEmpty) {
			return selection;
		}

		const start = selection.start;
		if (start.line === 0) {
			const newStart = start.character === 0 ?
				new vscode.Position(0, 0) :
				new vscode.Position(start.line, start.character - 1);
			selection = new vscode.Selection(newStart, selection.end);
			return selection;
		}

		const line = document.lineAt(start);
		const prevLine = document.lineAt(start.line - 1);
		
		const newStart = start.character === 0 ?
			new vscode.Position(start.line - 1, prevLine.text.length) :
			new vscode.Position(start.line, start.character - 1);
		selection = new vscode.Selection(newStart, selection.end);
		
		const prevFirstNonWhitespace = prevLine.firstNonWhitespaceCharacterIndex;
		if (line.firstNonWhitespaceCharacterIndex < start.character) {
			return selection;
		} else if (prevFirstNonWhitespace !== 0 && start.character > prevFirstNonWhitespace) {
			const anchor = new vscode.Position(start.line, prevFirstNonWhitespace);
			return new vscode.Selection(anchor, start);
		}
		
		const text = line.text.substring(0, start.character);
		const match = /^[\t ]+$/.exec(text);
		if (match) {
			const anchor = prevLine.range.end;
			return new vscode.Selection(anchor, start);
		}

		return selection;
	});
	
	const returned = editor.edit(editorBuilder => {
		newSelections.forEach(deletion => {
			editorBuilder.delete(deletion);
		});
	});

	return returned;
}

// This method is called when your extension is deactivated
export function deactivate() {}
