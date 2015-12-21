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
var findFileExludes;
var statusBarItem;
var choosenLanguage;

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

    // TODO: Hello on you my friend 

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = Commands.registerCommand('extension.chooseLanguageTodo', function () {
        var languageChoice = ['All', 'Go', 'Javascript', 'PHP', 'Coffeescript', 'C', 'C++', 'C#', 'Objective-C', 'Python', 'Ruby', 'Swift', 'Typescript', 'VisualBasic'];

        Window.showQuickPick(languageChoice, {}).then(function (language) {
            if (language === undefined) {
                return;
            }

            var findFilesExt = getFileExtension(language);
            if (findFilesExt === null) {
                Window.showErrorMessage('**The choosen language "' + language + '" didn\'t match any file extensions, please create an issue.**', 'Create issue').then(function (choice) {
                    if (choice === 'Create issue') {
                        Commands.executeCommand('extension.openBrowser', function () {

                        });
                    }
                });
            } else {
                choosenLanguage = language;
                if (statusBarItem === undefined) {
                    createStatusBarItem();
                }
                if (language === 'All') {
                    statusBarItem.text = 'TODO:s';
                } else {
                    statusBarItem.text = 'TODO:s for ' + language;
                }
                statusBarItem.tooltip = 'Show TODO:s for ' + language;
                findFileExtension = findFilesExt;
                findFileExludes = getFileExlude(language);
            }
        });
    });

    var openQuickPick = Commands.registerCommand('extension.showTodos', function () {
        if (findFileExtension === undefined) {
            findFileExtension = getFileExtension('All');
        }
        findFiles(findFileExtension, function () {
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
                console.log(response);
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

function findFiles(findFilesExtension, done) {
    Workspace.findFiles(findFilesExtension, findFileExludes, 1000).then(function (files) {
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

function getFileExlude(language) {
    switch (language) {
        case 'All': return '**/node_modules/**';
        case 'Go': return '';
        case 'Javascript': return '**/node_modules/**';
        case 'PHP': return '';
        case 'Coffeescript': return '';
        case 'C': return '';
        case 'C++': return '';
        case 'C#': return '';
        case 'Objective-C': return '';
        case 'Python': return '';
        case 'Ruby': return '';
        case 'Swift': return '';
        case 'Typescript': return '**/node_modules/**';
        case 'VisualBasic': return '';
    }
}

function getFileExtension(language) {
    switch (language) {
        case 'All': return '**/*.{php,go,js,coffee,c,cpp,cs,m,py,rb,swift,ts,vb}';
        case 'Go': return '**/*.go';
        case 'Javascript': return '**/*.js';
        case 'PHP': return '**/*.php';
        case 'Coffeescript': return '**/*[.js].coffee';
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
    return { name: undefined, fileName: undefined, line: undefined, lineLength: undefined, todoLine: undefined };
}

function doWork(files, done) {
    var message = {};
    var times = 0;
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
                    if (textLine.includes('TODO:')) {
                        if (!message.hasOwnProperty(pathWithoutFile)) {
                            message[pathWithoutFile] = [];
                        }
                        var todoLine = String(file._lines[line]);
                        todoLine = todoLine.substring(todoLine.indexOf('TODO:'), todoLine.length);
                        var object = getObject();
                        if (todoLine.length > 60) {
                            todoLine = todoLine.substring(0, 57).trim();
                            todoLine += '...';
                        }
                        object.todoLine = todoLine;
                        var rootPath = Workspace.rootPath + '/';
                        var outputFile = pathWithoutFile.replace(rootPath, '');
                        var todoLocation = outputFile + ' ' + (line + 1) + ':' + (textLine.indexOf('TODO:') + 1);
                        if (todoLocation.length > 50) {
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
