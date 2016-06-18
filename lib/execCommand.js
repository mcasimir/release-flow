'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = execCommand;

var _child_process = require('child_process');

function execCommand(cmd) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var stdout = (0, _child_process.execSync)(cmd).toString().trim();

  if (options.splitLines) {
    stdout = stdout.split('\n').map(function (line) {
      return line.trim();
    }).filter(function (line) {
      return line;
    });
  }

  return stdout;
}