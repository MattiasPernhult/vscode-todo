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
var findFileExcludes;
var findUsersFileExcludes;
var statusBarItem;
var choosenLanguage;
var workspaceConfig;
var configurationChanged;
var openBrowser = Commands.registerCommand('extension.openBrowser', function () {
    opener(issue);
});

// this method is called when the extension is activated
function activate(context) {

    // this line of code will only be executed once when the extension is activated
    console.log('Congratulations, your extension "vscode-todo" is now active!');

    if (statusBarItem === undefined) {
        createStatusBarItem();
    }

    workspaceConfig = vscode.workspace.getConfiguration();
    vscode.workspace.onDidChangeConfiguration(function (event) {
        workspaceConfig = vscode.workspace.getConfiguration();
        configurationChanged = true;
    });

    choosenLanguage = 'All'; //default value
    configurationChanged = true; //to set findUsersFileExcludes initally
    findUsersFileExcludes = '';
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = Commands.registerCommand('extension.chooseLanguageTodo', function () {
        var languageChoice = ['All', 'Go', 'Javascript', 'PHP', 'Coffeescript', 'C', 'C++', 'C#', 'Objective-C', 'Python', 'Ruby', 'Swift', 'Typescript', 'VisualBasic'];

        Window.showQuickPick(languageChoice, {}).then(function (language) {
            if (language === undefined) {
                return;
            }
            choosenLanguage = language;
            updateFileExtension();
            updateFileExclude();

            if (statusBarItem === undefined) {
                createStatusBarItem();
            }
            if (language === 'All') {
                statusBarItem.text = 'TODO:s';
            } else {
                statusBarItem.text = 'TODO:s for ' + language;
            }
            statusBarItem.tooltip = 'Show TODO:s for ' + language;
        });
    });

    var openQuickPick = Commands.registerCommand('extension.showTodos', function () {
        updateFileExtension();
        updateFileExclude();
        findFiles(function () {
            if (resultTodo === undefined) {
                return;
            }
            var resultTodoName = [];
            for (var index in resultTodo) {
                for (var i = 0; i < resultTodo[index].length; i++) {
                    var todo = resultTodo[index][i];
                    var t = { description: todo.name, label: todo.todoLine, fileName: todo.fileName, line: todo.line };
                    resultTodoName.push(t);
                }
            }
            Window.showQuickPick(resultTodoName, {}).then(function (response) {
                if (!response) return;
                var nameSplit = String(response.fileName);
                var file = 'file://' + nameSplit;
                var fileUri = vscode.Uri.parse(file);
                Workspace.openTextDocument(fileUri).then(function (textDocument) {
                    Window.showTextDocument(textDocument, vscode.ViewColumn.One).then(function (textEditor) {
                        var line = response.line;
                        var resultObjects = resultTodo[nameSplit];
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
                        var newSelection = new vscode.Selection(startPos, endPos);
                        Window.activeTextEditor.selection = newSelection;
                        Window.activeTextEditor.revealRange(newSelection, vscode.TextEditorRevealType.InCenter)
                    });
                });
            });
        });
    });
    context.subscriptions.push(openQuickPick);
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

function findFiles(done) {
    Workspace.findFiles(findFileExtension, findFileExcludes, 1000).then(function (files) {
        doWork(files, function (err, result) {
            if (err) {
                resultTodo = undefined;
            } else {
                resultTodo = result;
            }
            done();
        });
    });
}

function updateFileExclude() {

    findFileExcludes = '{'
    switch (choosenLanguage) {
        case 'All':
        case 'Javascript':
        case 'Coffeescript':
        case 'Typescript':
            findFileExcludes += '**/node_modules/**';
            break;
    }
    if (configurationChanged && workspaceConfig.todoIgnore) {
        findUsersFileExcludes = '';
        for (var i = 0; i < workspaceConfig.todoIgnore.length; i++) {
            findUsersFileExcludes += ',' + workspaceConfig.todoIgnore[i];
        }
        configurationChanged = false;
    }

    findFileExcludes += findUsersFileExcludes + '}'
}

function updateFileExtension() {

    switch (choosenLanguage) {
        case 'All': findFileExtension = '**/*.{php,go,js,coffee,c,cpp,cs,m,py,rb,swift,ts,vb}'; break;
        case 'Go': findFileExtension = '**/*.go'; break;
        case 'Javascript': findFileExtension = '**/*.js'; break;
        case 'PHP': findFileExtension = '**/*.php'; break;
        case 'Coffeescript': findFileExtension = '**/*[.js].coffee'; break;
        case 'C': findFileExtension = '**/*.c'; break;
        case 'C++': findFileExtension = '**/*.cpp'; break;
        case 'C#': findFileExtension = '**/*.cs'; break;
        case 'Objective-C': findFileExtension = '**/*.m'; break;
        case 'Python': findFileExtension = '**/*.py'; break;
        case 'Ruby': findFileExtension = '**/*.rb'; break;
        case 'Swift': findFileExtension = '**/*.swift'; break;
        case 'Typescript': findFileExtension = '**/*.ts'; break;
        case 'VisualBasic': findFileExtension = '**/*.vb'; break;
        default: findFileExtension = '**/*.{php,go,js,coffee,c,cpp,cs,m,py,rb,swift,ts,vb}'; break;
    }
}

function getObject() {
    return { name: undefined, fileName: undefined, line: undefined, lineLength: undefined, todoLine: undefined };
}

function doWork(files, done) {
    var message = {};
    var times = 0;
	
	//Regex pattern
	var regex = new RegExp("^\\W*(TODO\\s*:|TODO|FIXME\\s*:|FIXME)\\s*(.*)$", "i");
    if (files.length === 0) {
        Window.showInformationMessage('**There is no ' + choosenLanguage + ' files in the open project.**');
        done({ message: 'no files' }, message);
    } else {
        for (var i = 0; i < files.length; i++) {
            Workspace.openTextDocument(files[i]).then(function (file) {
                var uriString = String(file._uri);
                var pathWithoutFile = uriString.substring(7, uriString.length);
                for (var line = 0; line < file._lines.length; line++) {
                    var textLine = String(file._lines[line]);
					var match = textLine.match(regex);
                    if (match != null) {
                        if (!message.hasOwnProperty(pathWithoutFile)) {
                            message[pathWithoutFile] = [];
                        }
                        var todoLine = String(file._lines[line]);
                        todoLine = todoLine.substring(todoLine.indexOf(match[1]), todoLine.length);
                        var object = getObject();
                        if (todoLine.length > 60) {
                            todoLine = todoLine.substring(0, 57).trim();
                            todoLine += '...';
                        }
                        object.todoLine = todoLine;
                        var rootPath = Workspace.rootPath + '/';
                        var outputFile = pathWithoutFile.replace(rootPath, '');
                        var todoLocation = outputFile + ' ' + (line + 1) + ':' + (todoLine.indexOf(match[1]) + 1);
                        if (todoLocation.length > 50) {
                            todoLocation = '...' + todoLocation.substring(todoLocation.length - 47, todoLocation.length);
                        }
                        object.name = todoLocation;
                        object.fileName = pathWithoutFile;
                        object.line = line;
                        object.lineLength = textLine.length;
                        message[pathWithoutFile].push(object);
                    }
                }
            }).then(function () {
                times++;
                if (times === files.length) {
                    return done(null, message);
                }
            });
        }
    }
}

exports.activate = activate;
