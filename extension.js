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
var statusBarItem;
var usersChoosenLanguage;
var usersWorkspaceConfig;
var configurationChanged;
var openBrowser = Commands.registerCommand('extension.openBrowser', function() {
    opener(issue);
});

var language = require('./language');
var helper = require('./helper');

function activate(context) {

    if (statusBarItem === undefined) {
        helper.createStatusBarItem();
    }

    usersWorkspaceConfig = helper.getUsersWorkspaceConfigurations();
    
    // need to register listener for when workspace configurations is changed because
    // it may change which file to exclude when searching for todo:s
    Workspace.onDidChangeConfiguration(function(event) {
        workspaceConfig = helper.getUsersWorkspaceConfigurations();
        configurationChanged = true;
    });
    
    setDefaultValues();
    
    var disposable = Commands.registerCommand('extension.chooseLanguageTodo', function() {
        var availableLanguages = language.allName;

        Window.showQuickPick(availableLanguages, {}).then(function(userLanguage) {
            if (userLanguage === undefined) {
                return;
            }
            usersChoosenLanguage = userLanguage;
            if (statusBarItem === undefined) {
                statusBarItem = helper.createStatusBarItem();
            }
            if (language === 'All') {
                statusBarItem.text = 'TODO:s';
            } else {
                statusBarItem.text = 'TODO:s for ' + usersChoosenLanguage;
            }
            statusBarItem.tooltip = 'Show TODO:s for ' + usersChoosenLanguage;
        });  
    });

    var openQuickPick = Commands.registerCommand('extension.showTodos', function() {
        var fileExtensionForLanguage = helper.getFileExtensionForLanguage(usersChoosenLanguage);
        var fileExcludeForLanguage = helper.getFileExludeForLanguage(usersChoosenLanguage, configurationChanged, usersWorkspaceConfig);
        configurationChanged = false;
        helper.findFiles(fileExtensionForLanguage, fileExcludeForLanguage, usersChoosenLanguage, foundFiles);
    });
    context.subscriptions.push(openQuickPick);
    context.subscriptions.push(disposable);
}

var foundFiles = function(err, todos, todosList) {
    if (err) {
        console.log(err);
        return;
    }
    Window.showQuickPick(todosList, {}).then(function(response) {
        if (!response) return;
        var nameSplit = String(response.fileName);
        var file = 'file://' + nameSplit;
        var fileUri = vscode.Uri.parse(file);
        Workspace.openTextDocument(fileUri).then(function(textDocument) {
            Window.showTextDocument(textDocument, vscode.ViewColumn.One).then(function(textEditor) {
                var line = response.line;
                var resultObjects = todos[nameSplit];
                var startPos;
                var endPos;
                for (var i = 0; i < resultObjects.length; i++) {
                    var object = resultObjects[i];
                    if (object.line === line) {
                        startPos = new vscode.Position(object.line, 0);
                        endPos = new vscode.Position(object.line, 100);
                        break;
                    }
                }
                var newSelection = new vscode.Selection(startPos, endPos);
                Window.activeTextEditor.selection = newSelection;
                Window.activeTextEditor.revealRange(newSelection, vscode.TextEditorRevealType.InCenter);
            });
        });
    });
};

function setDefaultValues() {
    usersChoosenLanguage = 'All';
    configurationChanged = true;
    findUsersFileExcludes = '';
}

exports.activate = activate;