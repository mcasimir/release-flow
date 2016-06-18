import memoize from 'memoize-decorator';
import conventionalCommitsFilter from 'conventional-commits-filter';
import conventionalCommitsParser from 'conventional-commits-parser';
import execCommand from './execCommand';

const COMMIT_SEPARATOR = '[----COMMIT--END----]';
const HASH_DELIMITER = '-hash-';

export default class Git {
  constructor(options = {}) {
    this.options = options;
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
    let remoteUrl = this.remoteUrl
        .replace(/^[^@]*@/, '')
        .replace(/:/g, '/')
        .replace(/\.git$/, '');

    return `${protocol}://${remoteUrl}`;
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
    return this.repoHttpUrl + '/' + path;
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

  localTags() {
    return this.execCommand(
        'git log --no-walk --tags --pretty="%h %d %s" --decorate=full'
      , {
        splitLines: true
      })
      .filter(line => {
        return line.match(/\(tag: refs\/tags\//);
      })
      .map(line => {
        return line.match(/\(tag: refs\/tags\/([^,\)]+)/)[1];
      });
  }

  hasLocalTags() {
    return Boolean(this.localTags().length);
  }

  lastLocalTagSha() {
    return this.hasLocalTags() &&
      this.execCommand(
        'git --no-pager log --no-walk --tags --pretty="%h" --decorate=short -1'
      ) || null;
  }

  lastTagName() {
    let tags = this.localTags();
    return tags[tags.length];
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

  hasLocalTag(tagName) {
    return this.localTags().indexOf(tagName) !== -1;
  }

  isCurrentBranch(branchName) {
    return this.currentBranch() === branchName;
  }
}
