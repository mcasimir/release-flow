'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getBump = require('./get-bump');

var _getBump2 = _interopRequireDefault(_getBump);

var _DefaultErrorFactory = require('./DefaultErrorFactory');

var _DefaultErrorFactory2 = _interopRequireDefault(_DefaultErrorFactory);

var _DefaultLogger = require('./DefaultLogger');

var _DefaultLogger2 = _interopRequireDefault(_DefaultLogger);

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
  ErrorFactory: _DefaultErrorFactory2.default,
  Logger: _DefaultLogger2.default,
  repoHttpProtocol: 'https',
  getBump: _getBump2.default,
  plugins: []
};