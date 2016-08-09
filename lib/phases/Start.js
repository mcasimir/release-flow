'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _desc, _value, _class;

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _Phase2 = require('../Phase');

var _Phase3 = _interopRequireDefault(_Phase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var Start = (_dec = (0, _Phase2.Step)(), _dec2 = (0, _Phase2.Step)(), _dec3 = (0, _Phase2.Step)(), _dec4 = (0, _Phase2.Step)(), _dec5 = (0, _Phase2.Step)(), _dec6 = (0, _Phase2.Step)(), _dec7 = (0, _Phase2.Step)(), (_class = function (_Phase) {
  _inherits(Start, _Phase);

  function Start() {
    _classCallCheck(this, Start);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Start).apply(this, arguments));
  }

  _createClass(Start, [{
    key: 'fetch',
    value: function fetch(release) {
      release.logger.debug('fetching tags and heads');
      try {
        release.git.fetchHeadsAndTags();
      } catch (e) {
        throw release.error('Unable to fetch tags and heads');
      }
    }
  }, {
    key: 'getPreviousVersion',
    value: function getPreviousVersion(release) {
      release.logger.debug('finding previous version');
      var lastTagName = release.git.getLastLocalTagName();
      if (lastTagName) {
        var versionMatch = lastTagName.match(/\d+\.\d+\.\d+.*/);
        release.previousVersion = versionMatch && versionMatch[0];
        release.previousReleaseName = '' + release.options.tagPrefix + release.previousVersion;
      } else {
        release.previousVersion = null;
        release.previousReleaseName = null;
      }
      release.logger.debug('previous version was ' + release.previousVersion);
    }
  }, {
    key: 'getCommits',
    value: function getCommits(release) {
      var sha = release.git.getLastLocalTagSha();
      release.logger.debug('getting commits from ' + sha);
      release.commits = release.git.conventionalCommits(sha);
      release.logger.debug(release.commits.length + ' commits found');
      if (!release.commits.length) {
        throw release.error('Nothing to release');
      }
    }
  }, {
    key: 'getNextVersion',
    value: function getNextVersion(release) {
      release.logger.debug('getting next version');

      if (release.previousVersion) {
        release.bump = release.options.getBump(release.commits);
        release.logger.debug('bumping ' + release.bump + ' based on convetions');
        release.nextVersion = _semver2.default.inc(release.previousVersion, release.bump);
      } else {
        release.logger.debug('no previousVersion, assuming initialVersion');
        release.nextVersion = release.options.initialVersion;
      }

      release.name = '' + release.options.tagPrefix + release.nextVersion;

      release.logger.debug('next version will be ' + release.nextVersion);
    }
  }, {
    key: 'validate',
    value: function validate(release) {
      if (!release.git.isCurrentBranch(release.options.developmentBranch)) {
        throw release.error('Current branch should be ' + release.options.developmentBranch);
      }

      if (release.git.hasUntrackedChanges()) {
        throw release.error('You have untracked changes');
      }

      if (release.git.hasUnpushedCommits(release.options.developmentBranch)) {
        throw release.error('You have unpushed changes');
      }

      if (release.git.hasLocalTag(release.name)) {
        throw release.error('Tag ' + release.name + ' already exists');
      }
    }
  }, {
    key: 'openReleaseBranch',
    value: function openReleaseBranch(release) {
      release.git.openBranch('' + release.options.releaseBranchPrefix + release.nextVersion);
    }
  }, {
    key: 'commit',
    value: function commit(release) {
      release.git.commitAll('Release ' + release.name);
    }
  }]);

  return Start;
}(_Phase3.default), (_applyDecoratedDescriptor(_class.prototype, 'fetch', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'fetch'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getPreviousVersion', [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, 'getPreviousVersion'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getCommits', [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, 'getCommits'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getNextVersion', [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, 'getNextVersion'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'validate', [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, 'validate'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'openReleaseBranch', [_dec6], Object.getOwnPropertyDescriptor(_class.prototype, 'openReleaseBranch'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'commit', [_dec7], Object.getOwnPropertyDescriptor(_class.prototype, 'commit'), _class.prototype)), _class));
exports.default = Start;