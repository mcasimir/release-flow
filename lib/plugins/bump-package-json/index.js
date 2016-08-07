'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = installPlugin;

var _fs = require('fs');

var _path = require('path');

function installPlugin(release) {
  release.phases.start.before('commit', {
    name: 'bumpPackageJson',
    run: function run(context) {
      var packageJsonPath = (0, _path.resolve)(process.cwd(), 'package.json');
      var packageJson = JSON.parse((0, _fs.readFileSync)(packageJsonPath));
      packageJson.version = context.nextVersion;

      (0, _fs.writeFileSync)(packageJsonPath, JSON.stringify(packageJson, null, '  ') + '\n');
    }
  });
}