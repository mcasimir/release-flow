import bumpPackageJson from './plugins/bumpPackageJson';
import generateChangelog from './plugins/generateChangelog';

module.exports = {
  logLevel: 'debug',
  developmentBranch: 'master',
  plugins: [
    bumpPackageJson,
    generateChangelog
  ]
};
