import memoize from 'memoize-decorator';
import conventionalCommitsFilter from 'conventional-commits-filter';
import conventionalCommitsParser from 'conventional-commits-parser';
import execCommand from './execCommand';
import {valid as semverValid, compare as semverCompare} from 'semver';

const COMMIT_SEPARATOR = '[----COMMIT--END----]';
const HASH_DELIMITER = '-hash-';
const GIT_DEFAULT_OPTIONS = {
  remoteName: 'origin',
  repoHttpProtocol: 'http'
};

const TAG_HISTORY_RE = /^([0-9a-f]{5,40})\s+\(tag: refs\/tags\/([^,\)]+)/;

export default class Git {

  constructor(options = {}) {
    this.options = Object.assign(GIT_DEFAULT_OPTIONS, options);
    this.conventionalCommitsFilter = options.conventionalCommitsFilter ||
      conventionalCommitsFilter;
    this.conventionalCommitsParser = options.conventionalCommitsParser ||
      conventionalCommitsParser;
    this.execCommand = options.execCommand ||
      execCommand;
  }

  @memoize
  getRemoteUrl() {
    return this.execCommand(
      `git config --get remote.${this.options.remoteName}.url`
    );
  }

  @memoize
  getRepoHttpUrl() {
    if (this.options.repoHttpUrl) {
      return this.options.repoHttpUrl;
    }

    let protocol = this.options.repoHttpProtocol;
    let remoteUrl = this._remoteUrlToHttpUrl(this.getRemoteUrl());

    return `${protocol}://${remoteUrl}`;
  }

  _remoteUrlToHttpUrl(remoteUrl) {
    return remoteUrl
      .replace(/^[^@]*@/, '')
      .replace(/:/g, '/')
      .replace(/\.git$/, '');
  }

  openBranch(branchName) {
    this.execCommand(`git checkout -b ${branchName}`);
  }

  checkout(branchName) {
    this.execCommand(`git checkout ${branchName}`);
  }

  commitAll(message) {
    this.execCommand('git add .');
    this.execCommand(`git commit -m '${message}'`);
  }

  pushCurrentBranch() {
    this.pushRef(this.getCurrentBranch());
  }

  pushRef(refName) {
    this.execCommand(`git push ${this.options.remoteName} ${refName}`);
  }

  tag(refName) {
    this.execCommand(`git tag ${refName}`);
  }

  merge(refName) {
    this.execCommand(`git merge ${refName}`);
  }

  link(path) {
    path = (path || '').replace(/^\//, '');
    let base = this.getRepoHttpUrl().replace(/\/$/, '');
    return base + '/' + path;
  }

  commitLink(commit) {
    return this.link(`/commits/${commit}`);
  }

  compareLink(from, to) {
    return this.link(`/compare/${from}...${to}`);
  }

  fetchHeadsAndTags() {
    return this.execCommand([
      'git fetch',
      this.options.remoteName,
      `refs/heads/*:refs/remotes/${this.options.remoteName}/*`,
      '+refs/tags/*:refs/tags/*'
    ].join(' '));
  }

  getCurrentBranch() {
    return this.execCommand('git rev-parse --abbrev-ref HEAD');
  }

  hasUntrackedChanges() {
    return Boolean(this.execCommand('git status --porcelain').length);
  }

  hasUnpushedCommits() {
    let refName = this.getCurrentBranch();
    return Boolean(this.execCommand([
      'git --no-pager cherry -v',
      `${this.options.remoteName}/${refName} ${refName}`
    ].join(' ')).length);
  }

  _parseTagHistoryLine(line) {
    let tagMatch = line.match(TAG_HISTORY_RE);
    if (tagMatch) {
      return {
        sha: tagMatch[1],
        name: tagMatch[2]
      };
    }
  }

  @memoize
  getLocalTags() {
    let tagHistory = this.execCommand(
        'git log --no-walk --tags --pretty="%h %d %s" --decorate=full'
      , {
        splitLines: true
      })
      .map(line => {
        return this._parseTagHistoryLine(line);
      })
      .filter(line => line)
      .filter(tag => {
        return semverValid(tag.name);
      });

    return tagHistory.sort((tag1, tag2) => {
      return semverCompare(tag1.name, tag2.name);
    });
  }

  hasLocalTags() {
    return Boolean(this.getLocalTags().length);
  }

  @memoize
  getLastLocalTagSha() {
    let tags = this.getLocalTags();
    let lastTag = tags[tags.length - 1];
    return lastTag && lastTag.sha;
  }

  @memoize
  getLastLocalTagName() {
    let tags = this.getLocalTags();
    let lastTag = tags[tags.length - 1];
    return lastTag && lastTag.name;
  }

  hasLocalTag(tagName) {
    let found = this.getLocalTags().find(tag => {
      return tag.name === tagName;
    });
    return Boolean(found);
  }

  isCurrentBranch(branchName) {
    return this.getCurrentBranch() === branchName;
  }

  getRawCommits(fromSha) {
    let range = fromSha ? `${fromSha}..` : '';
    return this.execCommand([
      'git --no-pager log',
      `--pretty='format:%B%n${HASH_DELIMITER}%n%H${COMMIT_SEPARATOR}'`,
      range
    ].join(' '))
      .split(COMMIT_SEPARATOR)
      .filter(line => line);
  }

  _parseRawCommit(rawCommit, options = {}) {
    let commit = this.conventionalCommitsParser.sync(rawCommit, options);

    if (commit.header && commit.header.match('BREAKING') ||
      commit.footer && commit.footer.match('BREAKING')) {
      commit.breaking = true;
    }

    if (commit.hash) {
      commit.shortHash = commit.hash.slice(0, 7);
    }

    return commit;
  }

  conventionalCommits(fromSha, options = {}) {
    let rawCommits = this.getRawCommits(fromSha);
    let commits = rawCommits.map(
      rawCommit => this._parseRawCommit(rawCommit, options)
    );
    return this.conventionalCommitsFilter(commits);
  }
}
