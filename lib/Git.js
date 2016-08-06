'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class;

var _memoizeDecorator = require('memoize-decorator');

var _memoizeDecorator2 = _interopRequireDefault(_memoizeDecorator);

var _conventionalCommitsFilter = require('conventional-commits-filter');

var _conventionalCommitsFilter2 = _interopRequireDefault(_conventionalCommitsFilter);

var _conventionalCommitsParser = require('conventional-commits-parser');

var _conventionalCommitsParser2 = _interopRequireDefault(_conventionalCommitsParser);

var _execCommand = require('./execCommand');

var _execCommand2 = _interopRequireDefault(_execCommand);

var _semver = require('semver');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var COMMIT_SEPARATOR = '[----COMMIT--END----]';
var HASH_DELIMITER = '-hash-';
var GIT_DEFAULT_OPTIONS = {
  remoteName: 'origin',
  repoHttpProtocol: 'http'
};

var TAG_HISTORY_RE = /^([0-9a-f]{5,40})\s+\(tag: refs\/tags\/([^,\)]+)/;

var Git = (_class = function () {
  function Git() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Git);

    this.options = Object.assign(GIT_DEFAULT_OPTIONS, options);
    this.conventionalCommitsFilter = options.conventionalCommitsFilter || _conventionalCommitsFilter2.default;
    this.conventionalCommitsParser = options.conventionalCommitsParser || _conventionalCommitsParser2.default;
    this.execCommand = options.execCommand || _execCommand2.default;
  }

  _createClass(Git, [{
    key: 'getRemoteUrl',
    value: function getRemoteUrl() {
      return this.execCommand('git config --get remote.' + this.options.remoteName + '.url');
    }
  }, {
    key: 'getRepoHttpUrl',
    value: function getRepoHttpUrl() {
      if (this.options.repoHttpUrl) {
        return this.options.repoHttpUrl;
      }

      var protocol = this.options.repoHttpProtocol;
      var remoteUrl = this._remoteUrlToHttpUrl(this.getRemoteUrl());

      return protocol + '://' + remoteUrl;
    }
  }, {
    key: '_remoteUrlToHttpUrl',
    value: function _remoteUrlToHttpUrl(remoteUrl) {
      return remoteUrl.replace(/^[^@]*@/, '').replace(/:/g, '/').replace(/\.git$/, '');
    }
  }, {
    key: 'openBranch',
    value: function openBranch(branchName) {
      this.execCommand('git checkout -b ' + branchName);
    }
  }, {
    key: 'checkout',
    value: function checkout(branchName) {
      this.execCommand('git checkout ' + branchName);
    }
  }, {
    key: 'commitAll',
    value: function commitAll(message) {
      this.execCommand('git add .');
      this.execCommand('git commit -m \'' + message + '\'');
    }
  }, {
    key: 'pushCurrentBranch',
    value: function pushCurrentBranch() {
      this.pushRef(this.getCurrentBranch());
    }
  }, {
    key: 'pushRef',
    value: function pushRef(refName) {
      this.execCommand('git push ' + this.options.remoteName + ' ' + refName);
    }
  }, {
    key: 'tag',
    value: function tag(refName) {
      this.execCommand('git tag ' + refName);
    }
  }, {
    key: 'merge',
    value: function merge(refName) {
      this.execCommand('git merge ' + refName);
    }
  }, {
    key: 'link',
    value: function link(path) {
      path = (path || '').replace(/^\//, '');
      var base = this.getRepoHttpUrl().replace(/\/$/, '');
      return base + '/' + path;
    }
  }, {
    key: 'commitLink',
    value: function commitLink(commit) {
      return this.link('/commits/' + commit);
    }
  }, {
    key: 'compareLink',
    value: function compareLink(from, to) {
      return this.link('/compare/' + from + '...' + to);
    }
  }, {
    key: 'fetchHeadsAndTags',
    value: function fetchHeadsAndTags() {
      return this.execCommand(['git fetch', this.options.remoteName, 'refs/heads/*:refs/remotes/' + this.options.remoteName + '/*', '+refs/tags/*:refs/tags/*'].join(' '));
    }
  }, {
    key: 'getCurrentBranch',
    value: function getCurrentBranch() {
      return this.execCommand('git rev-parse --abbrev-ref HEAD');
    }
  }, {
    key: 'hasUntrackedChanges',
    value: function hasUntrackedChanges() {
      return Boolean(this.execCommand('git status --porcelain').length);
    }
  }, {
    key: 'hasUnpushedCommits',
    value: function hasUnpushedCommits() {
      var refName = this.getCurrentBranch();
      return Boolean(this.execCommand(['git --no-pager cherry -v', this.options.remoteName + '/' + refName + ' ' + refName].join(' ')).length);
    }
  }, {
    key: '_parseTagHistoryLine',
    value: function _parseTagHistoryLine(line) {
      var tagMatch = line.match(TAG_HISTORY_RE);
      if (tagMatch) {
        return {
          sha: tagMatch[1],
          name: tagMatch[2]
        };
      }
    }
  }, {
    key: 'getLocalTags',
    value: function getLocalTags() {
      var _this = this;

      var tagHistory = this.execCommand('git log --no-walk --tags --pretty="%h %d %s" --decorate=full', {
        splitLines: true
      }).map(function (line) {
        return _this._parseTagHistoryLine(line);
      }).filter(function (line) {
        return line;
      }).filter(function (tag) {
        return (0, _semver.valid)(tag.name);
      });

      return tagHistory.sort(function (tag1, tag2) {
        return (0, _semver.gt)(tag1.name, tag2.name);
      });
    }
  }, {
    key: 'hasLocalTags',
    value: function hasLocalTags() {
      return Boolean(this.getLocalTags().length);
    }
  }, {
    key: 'getLastLocalTagSha',
    value: function getLastLocalTagSha() {
      var tags = this.getLocalTags();
      var lastTag = tags[tags.length - 1];
      return lastTag && lastTag.sha;
    }
  }, {
    key: 'getLastLocalTagName',
    value: function getLastLocalTagName() {
      var tags = this.getLocalTags();
      var lastTag = tags[tags.length - 1];
      return lastTag && lastTag.name;
    }
  }, {
    key: 'hasLocalTag',
    value: function hasLocalTag(tagName) {
      var found = this.getLocalTags().find(function (tag) {
        return tag.name === tagName;
      });
      return Boolean(found);
    }
  }, {
    key: 'isCurrentBranch',
    value: function isCurrentBranch(branchName) {
      return this.getCurrentBranch() === branchName;
    }
  }, {
    key: 'getRawCommits',
    value: function getRawCommits(fromSha) {
      var range = fromSha ? fromSha + '..' : '';
      return this.execCommand(['git --no-pager log', '--pretty=\'format:%B%n' + HASH_DELIMITER + '%n%H' + COMMIT_SEPARATOR + '\'', range].join(' ')).split(COMMIT_SEPARATOR).filter(function (line) {
        return line;
      });
    }
  }, {
    key: '_parseRawCommit',
    value: function _parseRawCommit(rawCommit) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var commit = this.conventionalCommitsParser.sync(rawCommit, options);

      if (commit.header && commit.header.match('BREAKING') || commit.footer && commit.footer.match('BREAKING')) {
        commit.breaking = true;
      }

      if (commit.hash) {
        commit.shortHash = commit.hash.slice(0, 7);
      }

      return commit;
    }
  }, {
    key: 'conventionalCommits',
    value: function conventionalCommits(fromSha) {
      var _this2 = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var rawCommits = this.getRawCommits(fromSha);
      var commits = rawCommits.map(function (rawCommit) {
        return _this2._parseRawCommit(rawCommit, options);
      });
      return this.conventionalCommitsFilter(commits);
    }
  }]);

  return Git;
}(), (_applyDecoratedDescriptor(_class.prototype, 'getRemoteUrl', [_memoizeDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'getRemoteUrl'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getRepoHttpUrl', [_memoizeDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'getRepoHttpUrl'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLocalTags', [_memoizeDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'getLocalTags'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLastLocalTagSha', [_memoizeDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'getLastLocalTagSha'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLastLocalTagName', [_memoizeDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'getLastLocalTagName'), _class.prototype)), _class);
exports.default = Git;