import {resolve} from 'path';
import getBump from './get-bump';
import changelogTemplate from './changelog-template';

export default {
  developmentBranch: 'develop',
  productionBranch: 'master',
  releaseBranchPrefix: 'release/',
  tagPrefix: 'v',
  remoteName: 'origin',
  logLevel: 'info',
  initialVersion: '1.0.0',
  repoHttpUrl: null,
  changelogPath: resolve(process.cwd(), 'CHANGELOG.md'),
  repoHttpProtocol: 'https',
  getBump: getBump,
  changelogTemplate: changelogTemplate,
  plugins: []
};
