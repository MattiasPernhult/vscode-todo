// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var chucknorris = require('./chuck-norris.json');
var resultTodo;

var openQuickPick = vscode.commands.registerCommand('extension.openQuickPick', function() {
	if (resultTodo === undefined) {
		return;
	}
	var resultTodoName = [];
	for (var index in resultTodo) {
		for (var i = 0; i < resultTodo[index].length; i++) {
			var todo = resultTodo[index][i];
			resultTodoName.push(todo.name);
		}
	}
	vscode.window.showQuickPick(resultTodoName, {}).then(function(response) {
		var nameSplit = new String(response).split(' ');
		var file = 'file://' + nameSplit[0];
		var fileUri = vscode.Uri.parse(file);
		vscode.workspace.openTextDocument(fileUri).then(function(textDocument) {
			vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One).then(function(textEditor) {
				var line = Number(nameSplit[1].split(':')[0]) - 1;
				var resultObjects = resultTodo[nameSplit[0]];
				var startPos;
				var endPos;
				for (var i = 0; i < resultObjects.length; i++) {
					var object = resultObjects[i];
					if (object.line === line) {
						startPos = new vscode.Position(object.line, 0);
						endPos = new vscode.Position(object.line, object.lineLength);
						break;
					}
				}
				vscode.window.activeTextEditor.selection = new vscode.Selection(startPos, endPos);
			});
		});
	});
});

// this method is called when the extension is activated
function activate(context) {
	
	// this line of code will only be executed once when the extension is activated
	console.log('Congratulations, your extension "vscode-todo" is now active!');

	var statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBarItem.text = 'TODO:s';
	statusBarItem.tooltip = 'Show TODO:s';
	statusBarItem.command = 'extension.openQuickPick';
	statusBarItem.color = '#FFFFFF';
	console.log(statusBarItem);
	statusBarItem.show();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = vscode.commands.registerCommand('extension.chuckNorris', function () {
		var choice = ["Go", "JavaScript"];

		// vscode.window.showQuickPick(choice, {}).then(function(response) {
		// 	console.log(response);
		// });

		vscode.workspace.findFiles('**/*.go', '', 1000).then(function(files) {
			doWork(files, function(result) {
				if (result.length == 0) {
					vscode.window.showInformationMessage("No result");
				} else {
					resultTodo = result;
				}
			});
		});
	});

	context.subscriptions.push(disposable);
}

function getObject() {
	return {name: undefined, fileName: undefined, line: undefined, lineLength: undefined};
}

function doWork(files, done) {
	var message = {};
	var times = 0;
	for (var i = 0; i < files.length; i++) {
		vscode.workspace.openTextDocument(files[i]).then(function(file) {
			var uriString = String(file._uri);
			var pathWithoutFile = uriString.substring(7, uriString.length);
			for (var line = 0; line < file._lines.length; line++) {
				var textLine = String(file._lines[line]);
				if (textLine.includes('TODO:')) {
					if (!message.hasOwnProperty(textLine)) {
						message[pathWithoutFile] = [];
					}
					var object = getObject();
					object.name = pathWithoutFile + ' ' + (line + 1) + ':' + (textLine.indexOf('TODO:') + 1);
					object.fileName = pathWithoutFile;
					object.line = line;
					object.lineLength = textLine.length;
					message[pathWithoutFile].push(object);
				}
			}
		}).then(function() {
			times++;
			if (times == files.length) {
				return done(message);
			}
		});
	}
}

exports.activate = activate;
