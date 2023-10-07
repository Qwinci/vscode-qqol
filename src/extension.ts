// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand("qqol.backspaceLeft", backspace));
}

function areMatchingParens(start: string, end: string): boolean {
	return (start === "(" && end === ")") || (start === "{" && end === "}") ||
		(start === "[" && end === "]") || (start === "<" && end === ">") ||
		(start === "\"" && end === "\"") || (start === "'" && end === "'");
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
		const line = document.lineAt(start);
		if (start.line === 0) {
			const newStart = start.character === 0 ?
				new vscode.Position(0, 0) :
				new vscode.Position(start.line, start.character - 1);
			selection = new vscode.Selection(newStart, selection.end);
			
			if (selection.end.character > 0 && selection.end.character < line.text.length &&
				areMatchingParens(line.text[selection.end.character - 1], line.text[selection.end.character])) {
				const newEnd = selection.end.translate(0, 1);
				selection = new vscode.Selection(selection.start, newEnd);
			}
			return selection;
		}

		const prevLine = document.lineAt(start.line - 1);
		
		const newStart = start.character === 0 ?
			new vscode.Position(start.line - 1, prevLine.text.length) :
			new vscode.Position(start.line, start.character - 1);
		selection = new vscode.Selection(newStart, selection.end);
		
		if (selection.end.character > 0 && selection.end.character < line.text.length &&
			areMatchingParens(line.text[selection.end.character - 1], line.text[selection.end.character])) {
			const newEnd = selection.end.translate(0, 1);
			selection = new vscode.Selection(selection.start, newEnd);
		}
		
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
