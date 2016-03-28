var Todo = function(description, fileName, line, label, lineLength) {
  this.description = description;
  this.label = label;
  this.fileName = fileName;
  this.line = line;
  this.lineLength = lineLength;
};

module.exports = {
    Todo: Todo,
};