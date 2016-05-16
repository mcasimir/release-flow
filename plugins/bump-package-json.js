'use strict';

let fs = require('fs');
let resolve = require('path').resolve;

module.exports = function(Release) {
  Release.registerPlugin('bump-package-json', function(release) {
    release.phases.start.before('commit', function() {
      let packageJsonPath = resolve(process.cwd(), 'package.json');
      let packageJson = require(packageJsonPath);
      packageJson.version = release.nextVersion;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '  '));
    });
  });
};
