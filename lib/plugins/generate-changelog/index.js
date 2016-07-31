'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = installPlugin;

var _prependFile = require('prepend-file');

var _prependFile2 = _interopRequireDefault(_prependFile);

var _ChangelogEntry = require('./ChangelogEntry');

var _ChangelogEntry2 = _interopRequireDefault(_ChangelogEntry);

var _path = require('path');

var _changelogTemplate = require('./changelog-template');

var _changelogTemplate2 = _interopRequireDefault(_changelogTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installPlugin(release) {
  release.options.changelogTemplate = release.options.changelogTemplate || _changelogTemplate2.default;

  release.options.changelogPath = release.options.changelogPath || (0, _path.resolve)(process.cwd(), 'CHANGELOG.md');

  release.phases.start.before('commit', {
    name: 'getChangelogEntries',
    run: function run(release) {
      release.logger.debug('getting changelog entries');
      var commits = release.commits;
      var changes = new _ChangelogEntry2.default(release.name);

      changes.subjectLink = release.previousReleaseName ? release.git.compareLink(release.previousReleaseName, release.name) : release.git.commitLink(release.name);

      var breaking = new _ChangelogEntry2.default('Breaking Changes');
      var features = new _ChangelogEntry2.default('Features');
      var fixes = new _ChangelogEntry2.default('Fixes');

      var headersMap = {};

      commits.forEach(function (commit) {
        if (headersMap[commit.header]) {
          var change = headersMap[commit.header];
          change.addLink(commit.shortHash, release.git.commitLink(commit.hash));
        } else if (commit.type === 'feat' || commit.type === 'fix' || commit.breaking) {
          var _change = new _ChangelogEntry2.default(commit.subject);
          headersMap[commit.header] = _change;

          if (commit.scope) {
            _change.scope = commit.scope;
          }

          _change.addLink(commit.shortHash, release.git.commitLink(commit.hash));

          if (commit.type === 'feat') {
            features.addChild(_change);
          }
          if (commit.type === 'fix') {
            fixes.addChild(_change);
          }
          if (commit.breaking) {
            breaking.addChild(_change);
          }
        }
      });

      if (!breaking.isLeaf()) {
        changes.addChild(breaking);
      }

      if (!features.isLeaf()) {
        changes.addChild(features);
      }

      if (!fixes.isLeaf()) {
        changes.addChild(fixes);
      }

      release.changes = changes;
      release.logger.debug('Changes:', release.changes);
    }
  });

  release.phases.start.before('commit', {
    name: 'generateChangelogContent',
    run: function run(release) {
      release.logger.debug('generating changelog');
      release.changelog = release.options.changelogTemplate({ release: release });
      release.logger.debug('changelog', release.changelog);
    }
  });

  release.phases.start.before('commit', {
    name: 'writeChangelog',
    run: function run(release) {
      release.logger.debug('writing changelog');
      _prependFile2.default.sync(release.options.changelogPath, release.changelog);
    }
  });
}