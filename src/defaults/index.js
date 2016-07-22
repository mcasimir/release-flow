import {resolve} from 'path';
import getBump from './get-bump';
import changelogTemplate from './changelog-template';
import DefaultErrorFactory from './DefaultErrorFactory';
import DefaultLogger from './DefaultLogger';

export default {
  developmentBranch: 'develop',
  productionBranch: 'master',
  releaseBranchPrefix: 'release/',
  tagPrefix: 'v',
  remoteName: 'origin',
  logLevel: 'info',
  initialVersion: '1.0.0',
  repoHttpUrl: null,
  ErrorFactory: DefaultErrorFactory,
  Logger: DefaultLogger,
  changelogPath: resolve(process.cwd(), 'CHANGELOG.md'),
  repoHttpProtocol: 'https',
  getBump: getBump,
  changelogTemplate: changelogTemplate,
  plugins: []
};
