// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var chucknorris = require('./chuck-norris.json');
var resultTodo;

//String.prototype.includes(, position);

vscode.commands.registerCommand('workbench.action.gotoLine', function(response) {
	console.log('INNE I GOTO LINE');
	console.log(response);
});

var openQuickPick = vscode.commands.registerCommand('extension.openQuickPick', function() {
	if (resultTodo === undefined) {
		return;
	}
	var resultTodoName = [];
	for (var index in resultTodo) {
		for (var i = 0; i < resultTodo[index].length; i++) {
			var todo = resultTodo[index][i];
			console.log(todo);
			resultTodoName.push(todo.name);
		}
	}
	vscode.window.showQuickPick(resultTodoName, {}).then(function(response) {
		// vscode.window.showInformationMessage(response);
		console.log('INNE I SHOW QUICK PICK');
		var nameSplit = new String(response).split(' ');
		var file = 'file://' + nameSplit[0];
		console.log(file);
		var fileUri = vscode.Uri.parse(file);
		vscode.workspace.openTextDocument(fileUri).then(function(textDocument) {
			vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One).then(function(textEditor) {
				var line = Number(nameSplit[1].split(':')[0]) - 1;
				console.log(line);
				console.log(typeof line);
				var resultObjects = resultTodo[nameSplit[0]];
				console.log('RESULT OBJECTS');
				console.log(resultObjects);
				var startPos;
				var endPos;
				for (var i = 0; i < resultObjects.length; i++) {
					var object = resultObjects[i];
					console.log('OBJECT');
					console.log(object);
					console.log(typeof object.line);
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

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-chuck-norris" is now active!');

	var statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBarItem.text = 'TODO:s';
	statusBarItem.tooltip = 'Show TODO:s';
	statusBarItem.command = 'extension.openQuickPick';
	statusBarItem.color = '#FFFFFF';
	console.log(statusBarItem);
	statusBarItem.show();

	vscode.commands.getCommands().then(function(response) {
		console.log(response);
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = vscode.commands.registerCommand('extension.chuckNorris', function () {
		// The code you place here will be executed every time your command is executed

		var choice = ["Go", "JavaScript"];

		// var inputBox = {placeHolder: "language", prompt: "Go"};
		//
		// vscode.window.showInputBox(inputBox);

		// vscode.window.showQuickPick(choice, {}).then(function(response) {
		// 	console.log(response);
		// });
		//

		var output = vscode.window.createOutputChannel("TODO:s");
		output.clear();

		vscode.workspace.findFiles('**/*.go', '', 1000).then(function(files) {
			console.log(files);
			doWork(files, function(result) {
				if (result.length == 0) {
					console.log('inga resultat');
					vscode.window.showInformationMessage("No result");
				} else {
					console.log('RESULT!!!');
					console.log(result);
					resultTodo = result;
					// for (var i = 0; i < result.length; i++) {
					// 	//output.appendLine(result[i]);
					// 	//vscode.window.showInformationMessage(result[i]);
					// }
					//vscode.window.setStatusBarMessage('TODO:s');
					// var statusItem = {
					// 	alignment: vscode.StatusBarAlignment.Left,
					// 	color: '#FFFFFF',
					// 	command: '',
					// 	priority: 100,
					// 	text: 'TODO:s',
					// 	tooltip: 'Show TODO:s',
					//
					// };
					//output.show(2);
				}
			});
		});

		console.log("HEKEHEJKRJEKJRE");

		// console.log('message: ' + message);
		// vscode.window.showInformationMessage(message);

		// var jokes = chucknorris.value;
		// var length = jokes.length;
		// var random = Math.floor((Math.random() * length-1) + 1);

		// Display a message box to the user
		//vscode.window.showInformationMessage(jokes[random].joke);
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
