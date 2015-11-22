// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var opener = require('opener');
var resultTodo;
var Workspace = vscode.workspace;
var Window = vscode.window;
var Commands = vscode.commands;
var Languages = vscode.languages;
var issue = 'https://github.com/MattiasPernhult/vscode-todo/issues';
var findFileExtension;
var statusBarItem;
var choosenLanguage;

var openBrowser = Commands.registerCommand('extension.openBrowser', function() {
	opener(issue);
});

var openQuickPick = Commands.registerCommand('extension.showTodos', function() {
	if (findFileExtension === undefined) {
		Window.showInformationMessage('**You must choose a language first, use the command palette.**');
		return;
	}
	findFiles(findFileExtension, function() {
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
		Window.showQuickPick(resultTodoName, {}).then(function(response) {
			var nameSplit = new String(response).split(' ');
			var file = 'file://' + nameSplit[0];
			var fileUri = vscode.Uri.parse(file);
			Workspace.openTextDocument(fileUri).then(function(textDocument) {
				Window.showTextDocument(textDocument, vscode.ViewColumn.One).then(function(textEditor) {
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
					Window.activeTextEditor.selection = new vscode.Selection(startPos, endPos);
				});
			});
		});
	});
	
});

// this method is called when the extension is activated
function activate(context) {
	
	// this line of code will only be executed once when the extension is activated
	console.log('Congratulations, your extension "vscode-todo" is now active!');

	if (statusBarItem === undefined) {
		createStatusBarItem();	
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = Commands.registerCommand('extension.chooseLanguageTodo', function () {
		var languageChoice = ['Go', 'Javascript', 'PHP', 'Coffeescript', 'C', 'C++', 'C#', 'Objective-C', 'Python', 'Ruby', 'Swift', 'Typescript', 'VisualBasic'];

		Window.showQuickPick(languageChoice, {}).then(function(language) {
			if (language !== undefined) {
				var findFilesExt = getFileExtension(language);
				if (findFilesExt === null) {
					Window.showErrorMessage('**The choosen language "' + language + '" didn\'t match any file extensions, please create an issue.**', 'Create issue').then(function(choice) {
						if (choice === 'Create issue') {
							Commands.executeCommand('extension.openBrowser', function() {
								
							});
						}
					});
				} else {
					choosenLanguage = language; 
					if (statusBarItem === undefined) {
						createStatusBarItem();
					}
					statusBarItem.text = 'TODO:s for ' + language;
					statusBarItem.tooltip = 'Show TODO:s for ' + language;
					findFileExtension = findFilesExt;
				}
			}
		});
	});

	context.subscriptions.push(disposable);
}

function createStatusBarItem() {
	statusBarItem = Window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBarItem.text = 'TODO:s';
	statusBarItem.tooltip = 'Show TODO:s';
	statusBarItem.command = 'extension.showTodos';
	statusBarItem.color = '#FFFFFF';
	statusBarItem.show();
}

function findFiles(findFilesExtension, done) {
	Workspace.findFiles(findFilesExtension, '', 1000).then(function(files) {
		doWork(files, function(err, result) {
			if (err) {
				resultTodo = undefined;
			} else {
				resultTodo = result;	
			}
			done();
		});
	});
}

function getFileExtension(language) {
	switch (language) {
		case 'Go': return '**/*.go';
		case 'Javascript': return '**/*.js';
		case 'PHP ': return '**/*.php';
		case 'Coffescript': return '**/*.coffee';
		case 'C': return '**/*.c';
		case 'C++': return '**/*.cpp';
		case 'C#': return '**/*.cs';
		case 'Objective-C': return '**/*.m';
		case 'Python': return '**/*.py';
		case 'Ruby': return '**/*.rb';
		case 'Swift': return '**/*.swift';
		case 'Typescript': return '**/*.ts';
		case 'VisualBasic': return '**/*.vb';
		default: return null;
	}
}

function getObject() {
	return {name: undefined, fileName: undefined, line: undefined, lineLength: undefined};
}

function doWork(files, done) {
	var message = {};
	var times = 0;
	if (files.length === 0) {
		Window.showInformationMessage('**There is no ' + choosenLanguage + ' files in the open project.**');
		done({message: 'no files'}, message);
	} else {
		for (var i = 0; i < files.length; i++) {
			Workspace.openTextDocument(files[i]).then(function(file) {
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
				if (times === files.length) {
					return done(null, message);
				}
			});
		}
	}
}

exports.activate = activate;
