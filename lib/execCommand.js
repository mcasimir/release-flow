'use strict';

let execSync = require('child_process').execSync;

module.exports = function execCommand(cmd, options) {
  options = options || {};

  let stdout = execSync(cmd)
    .toString()
    .trim();

  if (options.splitLines) {
    stdout = stdout.split('\n')
    .map(function(line) {
      return line.trim();
    })
    .filter(function(line) {
      return line;
    });
  }

  return stdout;
};
