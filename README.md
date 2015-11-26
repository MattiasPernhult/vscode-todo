# TODO extension for Visual Studio Code

This extension adds functionality to list TODO:s in the project:

- Choosing language
- Show TODO:s

## Features

![Imgur](http://i.imgur.com/gGdE7CX.gif?1)

![Imgur](http://i.imgur.com/dLL4K3g.gif?1)

## Usage

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
git clone https://github.com/MattiasPernhut/vscode-todo
cd vscode-todo
npm install
code . 
```

## License
[MIT](LICENSE)
