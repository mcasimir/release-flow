'use strict';

const DEFAULT_REMOTE_NAME = 'origin';
const COMMIT_SEPARATOR = '[----COMMIT--END----]';
const HASH_DELIMITER = '-hash-';

let conventionalCommitsFilter = require('conventional-commits-filter');
let conventionalCommitsParser = require('conventional-commits-parser');
let execCommand = require('./execCommand');

class Git {
  constructor(options) {
    options = options || {};
    this.remoteName = options.remoteName || DEFAULT_REMOTE_NAME;
  }

  fetchHeadsAndTags() {
    return execCommand(`git fetch ${this.remoteName} refs/heads/*:refs/remotes/${this.remoteName}/* +refs/tags/*:refs/tags/*`);
  }

  currentBranch() {
    return execCommand('git rev-parse --abbrev-ref HEAD');
  }

  hasUntrackedChanges() {
    return !!execCommand('git status --porcelain').length;
  }

  hasUnpushedCommits() {
    return !!execCommand('git --no-pager cherry -v').length;
  }

  localTags() {
    return execCommand(`git log --no-walk --tags --pretty="%h %d %s" --decorate=full`, {splitLines: true})
      .filter(function(line) {
        return line.match(/\(tag: refs\/tags\//);
      })
      .map(function(line) {
        return line.match(/\(tag: refs\/tags\/([^,\)]+)/)[1];
      });
  }

  hasLocalTags() {
    return !!this.localTags().length;
  }

  lastLocalTagSha() {
    return this.hasLocalTags() &&
      execCommand('git --no-pager log --no-walk --tags --pretty="%h" --decorate=short -1') ||
        null;
  }

  lastTagName() {
    let tags = this.localTags();
    return tags[tags.length];
  }

  commits(fromSha, options) {
    let range = fromSha ? `${fromSha}..` : '';
    let rawCommits = execCommand(`git --no-pager log --pretty='format:%B%n${HASH_DELIMITER}%n%H${COMMIT_SEPARATOR}' ${range}`)
      .split(COMMIT_SEPARATOR)
      .filter(function(line) {
        return line;
      });

    let commits = rawCommits.map(function(rawCommit) {
      let commit = conventionalCommitsParser.sync(rawCommit, options);

      if (commit.header && commit.header.match('BREAKING') ||
        commit.footer && commit.footer.match('BREAKING')) {
        commit.breaking = true;
      }

      return commit;
    });

    return conventionalCommitsFilter(commits);
  }

  hasLocalTag(tagName) {
    return this.localTags().indexOf(tagName) !== -1;
  }

  isCurrentBranch(branchName) {
    return this.currentBranch() === branchName;
  }
}

module.exports = Git;
