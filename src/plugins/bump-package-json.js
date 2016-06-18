import {writeFileSync} from 'fs';
import {resolve} from 'path';

export default function(Release) {
  Release.registerPlugin('bump-package-json', function(release) {
    release.phases.start.before('commit', function() {
      let packageJsonPath = resolve(process.cwd(), 'package.json');
      let packageJson = require(packageJsonPath);
      packageJson.version = release.nextVersion;
      writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, '  ')
      );
    });
  });
}
