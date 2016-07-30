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

var Git = (_class = function () {
  function Git() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Git);

    this.options = options;
    this.conventionalCommitsFilter = options.conventionalCommitsFilter || _conventionalCommitsFilter2.default;
    this.conventionalCommitsParser = options.conventionalCommitsParser || _conventionalCommitsParser2.default;
    this.execCommand = options.execCommand || _execCommand2.default;
  }

  _createClass(Git, [{
    key: 'openBranch',
    value: function openBranch(branchName) {
      this.execCommand('git checkout -b ' + branchName);
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
      this.pushRef(this.currentBranch());
    }
  }, {
    key: 'pushRef',
    value: function pushRef(refName) {
      this.execCommand('git push ' + this.options.remoteName + ' ' + refName);
    }
  }, {
    key: 'link',
    value: function link(path) {
      path = (path || '').replace(/^\//, '');
      return this.repoHttpUrl + '/' + path;
    }
  }, {
    key: 'commitLink',
    value: function commitLink(commit) {
      return this.link('/commits/' + commit);
    }
  }, {
    key: 'compareLink',
    value: function compareLink(from, to) {
      return this.link('/compare/' + from + '..' + to);
    }
  }, {
    key: 'fetchHeadsAndTags',
    value: function fetchHeadsAndTags() {
      return this.execCommand(['git fetch', this.options.remoteName, 'refs/heads/*:refs/remotes/' + this.options.remoteName + '/*', '+refs/tags/*:refs/tags/*'].join(' '));
    }
  }, {
    key: 'currentBranch',
    value: function currentBranch() {
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
      return Boolean(this.execCommand('git --no-pager cherry -v').length);
    }
  }, {
    key: 'localTags',
    value: function localTags() {
      return this.execCommand('git log --no-walk --tags --pretty="%h %d %s" --decorate=full', {
        splitLines: true
      }).filter(function (line) {
        return line.match(/\(tag: refs\/tags\//);
      }).map(function (line) {
        return line.match(/\(tag: refs\/tags\/([^,\)]+)/)[1];
      });
    }
  }, {
    key: 'hasLocalTags',
    value: function hasLocalTags() {
      return Boolean(this.localTags().length);
    }
  }, {
    key: 'lastLocalTagSha',
    value: function lastLocalTagSha() {
      return this.hasLocalTags() && this.execCommand('git --no-pager log --no-walk --tags --pretty="%h" --decorate=short -1') || null;
    }
  }, {
    key: 'lastTagName',
    value: function lastTagName() {
      var tags = this.localTags();
      return tags[tags.length];
    }
  }, {
    key: 'commits',
    value: function commits(fromSha, options) {
      var _this = this;

      var range = fromSha ? fromSha + '..' : '';
      var rawCommits = this.execCommand(['git --no-pager log', '--pretty=\'format:%B%n' + HASH_DELIMITER + '%n%H' + COMMIT_SEPARATOR + '\'', range].join(' ')).split(COMMIT_SEPARATOR).filter(function (line) {
        return line;
      });

      var commits = rawCommits.map(function (rawCommit) {
        var commit = _this.conventionalCommitsParser.sync(rawCommit, options);

        if (commit.header && commit.header.match('BREAKING') || commit.footer && commit.footer.match('BREAKING')) {
          commit.breaking = true;
        }

        if (commit.hash) {
          commit.shortHash = commit.hash.slice(0, 7);
        }

        return commit;
      });

      return this.conventionalCommitsFilter(commits);
    }
  }, {
    key: 'hasLocalTag',
    value: function hasLocalTag(tagName) {
      return this.localTags().indexOf(tagName) !== -1;
    }
  }, {
    key: 'isCurrentBranch',
    value: function isCurrentBranch(branchName) {
      return this.currentBranch() === branchName;
    }
  }, {
    key: 'remoteUrl',
    get: function get() {
      return this.execCommand('git config --get remote.' + this.options.remoteName + '.url');
    }
  }, {
    key: 'repoHttpUrl',
    get: function get() {
      if (this.options.repoHttpUrl) {
        return this.options.repoHttpUrl;
      }

      var protocol = this.options.repoHttpProtocol;
      var remoteUrl = this.remoteUrl.replace(/^[^@]*@/, '').replace(/:/g, '/').replace(/\.git$/, '');

      return protocol + '://' + remoteUrl;
    }
  }]);

  return Git;
}(), (_applyDecoratedDescriptor(_class.prototype, 'remoteUrl', [_memoizeDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'remoteUrl'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'repoHttpUrl', [_memoizeDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'repoHttpUrl'), _class.prototype)), _class);
exports.default = Git;