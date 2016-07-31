import 'babel-polyfill';
import yargs from 'yargs';
import {resolve} from 'path';
import Release from './Release';
import bumpPackageJson from './plugins/bump-package-json';
import generateChangelog from './plugins/generate-changelog';

Release.registerPlugin('bump-package-json', bumpPackageJson);
Release.registerPlugin('generate-changelog', generateChangelog);

let program = yargs
  .options({
    config: {
      alias: ['c'],
      describe: 'configuration file path (JSON or Javascript)',
      type: 'string',
      normalize: true,
      default: '.releaseflowrc'
    }
  })
  .locale('en')
  .usage('Usage: $0 <command> [options]')
  .command('start', 'Starts a release')
  .demand(1)
  .strict()
  .help()
  .version();

let argv = program.argv;

if (argv._.length > 1) {
  program.showHelp();
  process.exit(1);
}

let options = {};
let configLoadError = null;

if (argv.config) {
  try {
    options = require(resolve(process.cwd(), argv.config));
  } catch (e) {
    configLoadError = e;
  }
}

let release = new Release(options);

if (configLoadError) {
  release.logger.warn(configLoadError.message);
  release.logger.warn('Using default configuration');
}

let command = argv._[0];

release[command](release)
  .catch(function(err) {
    release.logger.error(err.message);
    process.exit(1);
  });
