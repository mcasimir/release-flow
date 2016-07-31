import getBump from './get-bump';
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
  repoHttpProtocol: 'https',
  getBump: getBump,
  plugins: []
};
