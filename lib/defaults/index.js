'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _getBump = require('./get-bump');

var _getBump2 = _interopRequireDefault(_getBump);

var _changelogTemplate = require('./changelog-template');

var _changelogTemplate2 = _interopRequireDefault(_changelogTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  developmentBranch: 'develop',
  productionBranch: 'master',
  releaseBranchPrefix: 'release/',
  tagPrefix: 'v',
  remoteName: 'origin',
  logLevel: 'info',
  initialVersion: '1.0.0',
  repoHttpUrl: null,
  changelogPath: (0, _path.resolve)(process.cwd(), 'CHANGELOG.md'),
  repoHttpProtocol: 'https',
  getBump: _getBump2.default,
  changelogTemplate: _changelogTemplate2.default,
  plugins: []
};