'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (Release) {
  Release.registerPlugin('bump-package-json', function (release) {
    release.phases.start.before('commit', function () {
      var packageJsonPath = (0, _path.resolve)(process.cwd(), 'package.json');
      var packageJson = require(packageJsonPath);
      packageJson.version = release.nextVersion;
      (0, _fs.writeFileSync)(packageJsonPath, JSON.stringify(packageJson, null, '  '));
    });
  });
};

var _fs = require('fs');

var _path = require('path');