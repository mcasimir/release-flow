import memoize from 'memoize-decorator';
import conventionalCommitsFilter from 'conventional-commits-filter';
import conventionalCommitsParser from 'conventional-commits-parser';
import execCommand from './execCommand';
import {gt as semverGt, valid as semverValid} from 'semver';

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
  get remoteUrl() {
    return this.execCommand(
      `git config --get remote.${this.options.remoteName}.url`
    );
  }

  @memoize
  get repoHttpUrl() {
    if (this.options.repoHttpUrl) {
      return this.options.repoHttpUrl;
    }

    let protocol = this.options.repoHttpProtocol;
    let remoteUrl = this._remoteUrlToHttpUrl(this.remoteUrl);

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

  commitAll(message) {
    this.execCommand('git add .');
    this.execCommand(`git commit -m '${message}'`);
  }

  pushCurrentBranch() {
    this.pushRef(this.currentBranch());
  }

  pushRef(refName) {
    this.execCommand(`git push ${this.options.remoteName} ${refName}`);
  }

  link(path) {
    path = (path || '').replace(/^\//, '');
    let base = this.repoHttpUrl.replace(/\/$/, '');
    return base + '/' + path;
  }

  commitLink(commit) {
    return this.link(`/commits/${commit}`);
  }

  compareLink(from, to) {
    return this.link(`/compare/${from}..${to}`);
  }

  fetchHeadsAndTags() {
    return this.execCommand([
      'git fetch',
      this.options.remoteName,
      `refs/heads/*:refs/remotes/${this.options.remoteName}/*`,
      '+refs/tags/*:refs/tags/*'
    ].join(' '));
  }

  currentBranch() {
    return this.execCommand('git rev-parse --abbrev-ref HEAD');
  }

  hasUntrackedChanges() {
    return Boolean(this.execCommand('git status --porcelain').length);
  }

  hasUnpushedCommits() {
    return Boolean(this.execCommand('git --no-pager cherry -v').length);
  }

  parseTagHistoryLine(line) {
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
        return this.parseTagHistoryLine(line);
      })
      .filter(line => line)
      .filter(tag => {
        return semverValid(tag.name);
      });

    return tagHistory.sort((tag1, tag2) => {
      return semverGt(tag1.name, tag2.name);
    });
  }

  hasLocalTags() {
    return Boolean(this.getLocalTags().length);
  }

  lastLocalTagSha() {
    return this.hasLocalTags() &&
      this.execCommand(
        'git --no-pager log --no-walk --tags --pretty="%h" --decorate=short -1'
      ) || null;
  }

  @memoize
  lastTagName() {
    let tags = this.getLocalTags();
    let lastTag = tags[tags.length];
    return lastTag && lastTag.name;
  }

  hasLocalTag(tagName) {
    let found = this.getLocalTags().find(tag => {
      return tag.name === tagName;
    });
    return Boolean(found);
  }

  isCurrentBranch(branchName) {
    return this.currentBranch() === branchName;
  }

  commits(fromSha, options) {
    let range = fromSha ? `${fromSha}..` : '';
    let rawCommits = this.execCommand([
      'git --no-pager log',
      `--pretty='format:%B%n${HASH_DELIMITER}%n%H${COMMIT_SEPARATOR}'`,
      range
    ].join(' '))
      .split(COMMIT_SEPARATOR)
      .filter(line => {
        return line;
      });

    let commits = rawCommits.map(rawCommit => {
      let commit = this.conventionalCommitsParser.sync(rawCommit, options);

      if (commit.header && commit.header.match('BREAKING') ||
        commit.footer && commit.footer.match('BREAKING')) {
        commit.breaking = true;
      }

      if (commit.hash) {
        commit.shortHash = commit.hash.slice(0, 7);
      }

      return commit;
    });

    return this.conventionalCommitsFilter(commits);
  }
}
