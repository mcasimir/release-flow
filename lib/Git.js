'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _conventionalCommitsFilter = require('conventional-commits-filter');

var _conventionalCommitsFilter2 = _interopRequireDefault(_conventionalCommitsFilter);

var _conventionalCommitsParser = require('conventional-commits-parser');

var _conventionalCommitsParser2 = _interopRequireDefault(_conventionalCommitsParser);

var _execCommand = require('./execCommand');

var _execCommand2 = _interopRequireDefault(_execCommand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var COMMIT_SEPARATOR = '[----COMMIT--END----]';
var HASH_DELIMITER = '-hash-';

var Git = function () {
  function Git() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Git);

    this.options = options;
    this.remoteName = options.remoteName;
    if (this.options.repoHttpUrl) {
      this.repoHttpUrl = this.options.repoHttpUrl;
    } else {
      var protocol = this.options.repoHttpProtocol;
      var remoteUrl = this.remoteUrl();
      remoteUrl = remoteUrl.replace(/^[^@]*@/, '').replace(/:/g, '/').replace(/\.git$/, '');
      this.repoHttpUrl = protocol + '://' + remoteUrl;
    }

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
      this.execCommand('git push ' + this.remoteName + ' ' + refName);
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
    key: 'remoteUrl',
    value: function remoteUrl() {
      return this.execCommand('git config --get remote.' + this.remoteName + '.url');
    }
  }, {
    key: 'fetchHeadsAndTags',
    value: function fetchHeadsAndTags() {
      return this.execCommand(['git fetch', this.remoteName, 'refs/heads/*:refs/remotes/' + this.remoteName + '/*', '+refs/tags/*:refs/tags/*'].join(' '));
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
  }]);

  return Git;
}();

exports.default = Git;