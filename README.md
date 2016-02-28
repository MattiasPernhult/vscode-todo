# TODO extension for Visual Studio Code

This extension adds functionality to list TODO:s in the project:

- Choosing language
- Show TODO:s

## Features

![Imgur](http://i.imgur.com/p25rHeS.gif)


## Usage

### Settings
To exclude files from the search for TODO's, create the variable todoIgnore in your workspace or user settings:

``` json
{ 
  "todoIgnore":   ["**/test/**"]
}
```

It should contain an array of glob-patterns.

#### Marketplace
The extension is published on Visual Studio Codes marketplace at:
https://marketplace.visualstudio.com/items/MattiasPernhult.vscode-todo

Download the extension with Visual Studio Code by open the command palette and run
```bash
  ext install vscode-todo
```

#### Local usage
First you need to clone the project, I strongly recommend you to clone it directly to the extension folder under the .vscode folder, or you can clone it and then copy the project into this location.

The .vscode folder is located under:
* **Windows:** %USERPROFILE%\.vscode\extensions
* **Mac:** $HOME/.vscode/extensions
* **Linux:** $HOME/.vscode/extensions

## Contributing
If you like to contribute with new features or fixing issues just set up a development environment and make a pull request and I will look into that as soon as possible.

#### Development environment
You can set up a development environment for debugging the extension during extension development.

First make sure you do **not** have the extension installed in `~/.vscode/extensions`. Then clone the repo somewhere else on your machine, run `npm install` and open a development instance by pressing **F5**.

```bash
rm -rf ~/.vscode/extensions/vscode-todo
cd ~
git clone https://github.com/MattiasPernhult/vscode-todo
cd vscode-todo
npm install
code . 
```

## Changelog
#### v0.4.0
* Support for ignoring files and folders through use of todoIgnore in configuration
* Now scrolls to the selected TODO's line, instead of just highlighting it

#### v0.3.0
* Improved the appearance of the TODO:s
* Showing the actual TODO instead of only showing file path
* Removed the root path from the file path
* Will cut of characters if the actual TODO excess 60 characters
* The same with the file path

#### v0.2.0
* No need to choose a language, the extension will look through all files if no language is choosen.
* Activate on start up.
* It's possible to choose either all languages or a specific language.
* This feature was proposed by marlass in issue #4

#### v0.1.3
* Fixed bug with php files
* No new feature was added in this release

#### v0.1.2
* The extension will detect .js.coffee files in this release

#### v0.1.1
* Fixed bug with coffee files
* No new feature was added in this release

#### 0.1.0
* Initial release
* Possibility to choose a language
* Get all the TODO:s for the choosen language

## License
[MIT](LICENSE)
