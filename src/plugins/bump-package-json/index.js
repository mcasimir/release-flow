import {writeFileSync, readFileSync} from 'fs';
import {resolve} from 'path';

export default function installPlugin(release) {
  release.phases.start.before('commit', {
    name: 'bumpPackageJson',
    run(context) {
      let packageJsonPath = resolve(process.cwd(), 'package.json');
      let packageJson = JSON.parse(readFileSync(packageJsonPath));
      packageJson.version = context.nextVersion;

      writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, '  ') + '\n'
      );
    }
  });
}
