'use strict';

const DEFAULT_REMOTE_NAME = 'origin';

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
    return !!execCommand('git cherry -v').length;
  }

  localTags() {
    return execCommand(`git tag`, {splitLines: true});
  }

  hasLocalTags() {
    return !!this.localTags().length;
  }

  lastLocalTagSha() {
    return execCommand('git log --no-walk --tags --pretty="%h" --decorate=short -1');
  }

  lastTagName() {
    let remoteTags = this.remoteTags();
    return remoteTags[remoteTags.length];
  }

  hasLocalTag(tagName) {
    return this.localTags().indexOf(tagName) !== -1;
  }

  isCurrentBranch(branchName) {
    return this.currentBranch() === branchName;
  }
}

module.exports = Git;
