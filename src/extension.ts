// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand("qqol.backspaceLeft", backspace));

	const config = vscode.workspace.getConfiguration("qqol");
	if (config.get("trimIndentOnlyLinesOnSave")) {
		context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(trimSpaceOnEmptyLines));
	}
}

function trimSpaceOnEmptyLines(event: vscode.TextDocumentWillSaveEvent) {
	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.document !== event.document) {
		return;
	}

	const document = editor.document;
	const edits = [];

	const reg = /^\s+$/;

	for (let i = 0; i < document.lineCount; ++i) {
		const line = document.lineAt(i);
		if (reg.test(line.text)) {
			edits.push(vscode.TextEdit.delete(line.range));
		}
	}

	if (edits.length !== 0) {
		event.waitUntil(Promise.resolve(edits));
	}
}

async function backspace() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}

	const selections = [...editor.selections].sort((a, b) => b.active.line - a.active.line);
	const document = editor.document;

	const removedRanges = [];

	for (const selection of selections) {
		if (!selection.isEmpty) {
			continue;
		}

		const pos = selection.active;
		if (pos.line === 0) {
			continue;
		}

		const line = document.lineAt(pos.line);
		const indentEnd = line.firstNonWhitespaceCharacterIndex;

		if (pos.character <= indentEnd) {
			const prevLine = document.lineAt(pos.line - 1);
			removedRanges.push(new vscode.Range(prevLine.range.end, pos));
		}
	}

	if (removedRanges.length === 0) {
		await vscode.commands.executeCommand("deleteLeft");
		return;
	}

	removedRanges.sort((a, b) => b.start.line - a.start.line);
	const filteredRanges: vscode.Range[] = [];
	let lastRangeStart = Infinity;
	for (const removed of removedRanges) {
		if (removed.end.line < lastRangeStart) {
			filteredRanges.push(removed);
			lastRangeStart = removed.start.line;
		}
	}

	await editor.edit(editBuilder => {
		for (const filtered of filteredRanges) {
			editBuilder.delete(filtered);
		}
	},
	{ undoStopBefore: true, undoStopAfter: false });

	await vscode.commands.executeCommand("editor.action.reindentlines");

	const newSelections: vscode.Selection[] = [];
	const set = new Set();

	for (const selection of selections) {
		const oldLine = selection.active.line;
		const numRemovedBefore = filteredRanges.filter(range => range.start.line <= oldLine).length;
		const newLine = Math.max(oldLine - numRemovedBefore, 0);
		const actual = Math.min(newLine, document.lineCount - 1);
		const line = document.lineAt(actual);
		const newPos = new vscode.Position(actual, line.range.end.character);
		const key = `${newPos.line}:${newPos.character}`;
		if (!set.has(key)) {
			set.add(key);
			newSelections.push(new vscode.Selection(newPos, newPos));
		}
	}

	editor.selections = newSelections;
}

// This method is called when your extension is deactivated
export function deactivate() {}
