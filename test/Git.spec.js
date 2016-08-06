import {spy, stub} from 'sinon';
import assert, {equal, deepEqual} from 'assert';
import Git from '../src/Git';

describe('Git', function() {
  describe('getRemoteUrl', function() {
    it('gets remoteUrl based on the remoteName option', function() {
      let git = new Git({
        execCommand: spy(),
        remoteName: 'abc'
      });

      git.getRemoteUrl();

      assert(git.execCommand.calledWith('git config --get remote.abc.url'));
    });
  });

  describe('getRepoHttpUrl', function() {
    it('gets repoHttpUrl based on the remoteUrl', function() {
      let git = new Git({
        execCommand() {
          return 'remoteurl.com';
        },
        remoteName: 'abc'
      });

      equal(git.getRepoHttpUrl(), 'http://remoteurl.com');
    });

    it('returns options.repoHttpUrl if present', function() {
      let git = new Git({
        execCommand() {
          return 'remoteurl.com';
        },
        remoteName: 'abc',
        repoHttpUrl: 'xyz'
      });

      equal(git.getRepoHttpUrl(), 'xyz');
    });
  });

  describe('openBranch', function() {
    it('runs git checkout -b on the passed branch', function() {
      let git = new Git({
        execCommand: spy()
      });

      git.openBranch('abc');

      assert(git.execCommand.calledWith('git checkout -b abc'));
    });
  });

  describe('checkout', function() {
    it('runs git checkout on the passed branch', function() {
      let git = new Git({
        execCommand: spy()
      });

      git.checkout('abc');

      assert(git.execCommand.calledWith('git checkout abc'));
    });
  });

  describe('commitAll', function() {
    it('runs git add', function() {
      let git = new Git({
        execCommand: spy()
      });

      git.commitAll();

      assert(git.execCommand.calledWith('git add .'));
    });

    it('runs git commit with the right message', function() {
      let git = new Git({
        execCommand: spy()
      });

      git.commitAll('xyz');

      assert(git.execCommand.calledWith('git commit -m \'xyz\''));
    });
  });

  describe('pushCurrentBranch', function() {
    it('pushes current branch as ref', function() {
      let git = new Git({
        execCommand: spy()
      });
      spy(git, 'pushRef');
      stub(git, 'getCurrentBranch', () => {
        return 'xyz';
      });

      git.pushCurrentBranch();

      assert(git.pushRef.calledWith('xyz'));
    });
  });

  describe('pushRef', function() {
    it('pushes a reference on the specified remote', function() {

      let git = new Git({
        execCommand: spy(),
        remoteName: 'abc'
      });

      git.pushRef('xyz');

      assert(git.execCommand.calledWith('git push abc xyz'));
    });
  });

  describe('link', function() {
    it('returns link url on repo http for the given path', function() {
      let git = new Git({
        execCommand: spy(),
        repoHttpUrl: 'http://abc.com/'
      });

      equal(git.link('xyz'), 'http://abc.com/xyz');
    });
  });

  describe('commitLink', function() {
    it('returns link for a commit', function() {
      let git = new Git({
        execCommand: spy(),
        repoHttpUrl: 'http://abc.com/'
      });

      equal(git.commitLink('xyz'), 'http://abc.com/commits/xyz');
    });
  });

  describe('compareLink', function() {
    it('returns link for comparison between references', function() {
      let git = new Git({
        execCommand: spy(),
        repoHttpUrl: 'http://abc.com/'
      });

      equal(
        git.compareLink('xyz', 'abc'),
        'http://abc.com/compare/xyz...abc'
      );
    });
  });

  describe('fetchHeadsAndTags', function() {
    it('fetches from specified remote', function() {

      let git = new Git({
        execCommand: spy(),
        remoteName: 'abc'
      });

      git.fetchHeadsAndTags();

      assert(git.execCommand.calledWith(
        'git fetch abc refs/heads/*:refs/remotes/abc/* +refs/tags/*:refs/tags/*'
      ));
    });
  });

  describe('getCurrentBranch', function() {
    it('calls git rev-parse --abbrev-ref HEAD', function() {
      let git = new Git({
        execCommand: spy()
      });

      git.getCurrentBranch();

      assert(git.execCommand.calledWith(
        'git rev-parse --abbrev-ref HEAD'
      ));
    });
  });

  describe('hasUntrackedChanges', function() {
    it('calls git status --porcelain', function() {
      let git = new Git({
        execCommand: stub().returns('')
      });

      git.hasUntrackedChanges();

      assert(git.execCommand.calledWith(
        'git status --porcelain'
      ));
    });

    it('returns true if git status --porcelain is not empty', function() {
      let git = new Git({
        execCommand: stub().withArgs('git status --porcelain').returns('abc')
      });

      equal(git.hasUntrackedChanges(), true);
    });

    it('returns false if git status --porcelain is empty', function() {
      let git = new Git({
        execCommand: stub().withArgs('git status --porcelain').returns('')
      });

      equal(git.hasUntrackedChanges(), false);
    });
  });

  describe('hasUnpushedCommits', function() {
    it('calls git --no-pager cherry -v', function() {
      let git = new Git({
        execCommand: stub().returns('')
      });

      stub(git, 'getCurrentBranch').returns('b1');

      git.options.remoteName = 'a';
      git.hasUnpushedCommits();

      assert(git.execCommand.calledWith(
        'git --no-pager cherry -v a/b1 b1'
      ));
    });

    it('returns true if git --no-pager cherry -v is not empty', function() {
      let git = new Git({
        execCommand: stub().withArgs('git --no-pager cherry -v').returns('abc')
      });

      equal(git.hasUnpushedCommits(), true);
    });

    it('returns false if git --no-pager cherry -v is empty', function() {
      let git = new Git({
        execCommand: stub().withArgs('git --no-pager cherry -v').returns('')
      });

      equal(git.hasUnpushedCommits(), false);
    });
  });

  describe('_parseTagHistoryLine', function() {
    it('returns an object for a valid line', function() {
      let git = new Git();

      deepEqual(git._parseTagHistoryLine(
        'd3963ed  (tag: refs/tags/v1.3.0) abc bcd'
      ), {
        name: 'v1.3.0',
        sha: 'd3963ed'
      });
    });
  });

  describe('getLocalTags', function() {
    it('runs git log', function() {
      let git = new Git({
        execCommand: stub().returns([])
      });

      git.getLocalTags();

      assert(git.execCommand.calledWith(
        'git log --no-walk --tags --pretty="%h %d %s" --decorate=full'
      ));
    });

    it('excludes lines that are not tag refs', function() {
      let git = new Git({
        execCommand: stub()
          .withArgs(
            'git log --no-walk --tags --pretty="%h %d %s" --decorate=full'
          )
          .returns([
            'd3963ed  (tag: refs/heads/v1.3.0) abc bcd'
          ])
      });

      deepEqual(git.getLocalTags(), []);
    });

    it('includes lines that are tag refs', function() {
      let git = new Git({
        execCommand: stub()
          .withArgs(
            'git log --no-walk --tags --pretty="%h %d %s" --decorate=full'
          )
          .returns([
            'd3963ed  (tag: refs/tags/v1.3.0) abc bcd',
            'd3963ed  (tag: refs/tags/v1.3.1) abc bcd'
          ])
      });

      deepEqual(git.getLocalTags(), [
        {name: 'v1.3.0', sha: 'd3963ed'},
        {name: 'v1.3.1', sha: 'd3963ed'}
      ]);
    });

    it('filters non semantic tags', function() {
      let git = new Git({
        execCommand: stub()
          .withArgs(
            'git log --no-walk --tags --pretty="%h %d %s" --decorate=full'
          )
          .returns([
            'd3963ed  (tag: refs/tags/vfoo) abc bcd',
            'd3963ed  (tag: refs/tags/vbar) abc bcd',
            'd3963ed  (tag: refs/tags/v1.2.3) abc bcd',
            'd3963ed  (tag: refs/tags/1.3.3) abc bcd'
          ])
      });

      deepEqual(git.getLocalTags(), [
        {name: 'v1.2.3', sha: 'd3963ed'},
        {name: '1.3.3', sha: 'd3963ed'}
      ]);
    });

    it('sorts by semantic version', function() {
      let git = new Git({
        execCommand: stub()
          .withArgs(
            'git log --no-walk --tags --pretty="%h %d %s" --decorate=full'
          )
          .returns([
            'd3963ed  (tag: refs/tags/v1.3.1) abc bcd',
            'd3963ed  (tag: refs/tags/v1.3.0) abc bcd'
          ])
      });

      deepEqual(git.getLocalTags(), [
        {name: 'v1.3.0', sha: 'd3963ed'},
        {name: 'v1.3.1', sha: 'd3963ed'}
      ]);
    });
  });

  describe('hasLocalTags', function() {
    it('returns true if getLocalTags length > 0', function() {
      let git = new Git();
      stub(git, 'getLocalTags').returns([{name: 'v1.3.1', sha: 'd3963ed'}]);
      equal(git.hasLocalTags(), true);
    });

    it('returns false if getLocalTags length === 0', function() {
      let git = new Git();
      stub(git, 'getLocalTags').returns([]);
      equal(git.hasLocalTags(), false);
    });
  });

  describe('getLastLocalTagSha', function() {
    it('returns the last sha from getLocalTags', function() {
      let git = new Git();
      stub(git, 'getLocalTags').returns([
        {name: 'v1.3.1', sha: '1'},
        {name: 'v1.3.2', sha: '2'}
      ]);
      equal(git.getLastLocalTagSha(), '2');
    });
  });

  describe('getLastLocalTagName', function() {
    it('returns the last tag name from getLocalTags', function() {
      let git = new Git();
      stub(git, 'getLocalTags').returns([
        {name: 'v1.3.1', sha: '1'},
        {name: 'v1.3.2', sha: '2'}
      ]);
      equal(git.getLastLocalTagName(), 'v1.3.2');
    });
  });

  describe('hasLocalTag', function() {
    it('returns true if tag is present', function() {
      let git = new Git();
      stub(git, 'getLocalTags').returns([
        {name: 'v1.3.1', sha: '1'}
      ]);
      equal(git.hasLocalTag('v1.3.1'), true);
    });

    it('returns false if tag is missing', function() {
      let git = new Git();
      stub(git, 'getLocalTags').returns([
        {name: 'v1.3.1', sha: '1'}
      ]);
      equal(git.hasLocalTag('v1.3.2'), false);
    });
  });

  describe('isCurrentBranch', function() {
    it('returns true if branch matches', function() {
      let git = new Git();
      stub(git, 'getCurrentBranch').returns('foo');
      equal(git.isCurrentBranch('foo'), true);
    });

    it('returns false if branch does not match', function() {
      let git = new Git();
      stub(git, 'getCurrentBranch').returns('foo');
      equal(git.isCurrentBranch('bar'), false);
    });
  });

  describe('merge', function() {
    it('merges a local branch', function() {
      let git = new Git({
        execCommand: spy()
      });

      git.merge('xyz');

      assert(git.execCommand.calledWith('git merge xyz'));
    });
  });

  describe('tag', function() {
    it('creates an anonymous tag', function() {
      let git = new Git({
        execCommand: spy()
      });

      git.tag('xyz');

      assert(git.execCommand.calledWith('git tag xyz'));
    });
  });

  describe('getRawCommits', function() {
    it('calls execCommand with right argument', function() {
      let git = new Git({
        execCommand: stub().returns('')
      });

      git.getRawCommits('123');

      assert(git.execCommand.calledWith(
        'git --no-pager log ' +
        '--pretty=\'format:%B%n-hash-%n%H[----COMMIT--END----]\' 123..'
      ));
    });
  });

  describe('_parseRawCommit', function() {
    it('calls parser with raw commit', function() {
      let git = new Git({
        conventionalCommitsParser: {
          sync: stub().returns({})
        }
      });

      let commit = {a: 'xyz'};
      let options = {b: 123};

      git._parseRawCommit(commit, options);

      assert(git.conventionalCommitsParser.sync
        .calledWith(commit, options));
    });

    it('sets breaking if commit header matches BREAKING', function() {
      let git = new Git({
        conventionalCommitsParser: {
          sync: stub().returns({
            header: 'abc BREAKING bcd'
          })
        }
      });

      let commit = git._parseRawCommit({});

      assert(commit.breaking);
    });

    it('sets breaking if commit footer matches BREAKING', function() {
      let git = new Git({
        conventionalCommitsParser: {
          sync: stub().returns({
            footer: 'abc BREAKING bcd'
          })
        }
      });

      let commit = git._parseRawCommit({});

      assert(commit.breaking);
    });

    it('derives shortHash from hash', function() {
      let git = new Git({
        conventionalCommitsParser: {
          sync: stub().returns({
            hash: '1234567891011121314151617181920'
          })
        }
      });

      let commit = git._parseRawCommit({});

      equal(commit.shortHash, '1234567');
    });
  });

  describe('conventionalCommits', function() {
    it('calls get rawCommits with provided sha', function() {
      let git = new Git({
        conventionalCommitsFilter: spy()
      });

      stub(git, 'getRawCommits').returns([]);
      stub(git, '_parseRawCommit').returns({});

      git.conventionalCommits('xyz', {});

      assert(git.getRawCommits.calledWith('xyz'));
    });

    it('parses all the commits', function() {
      let git = new Git({
        conventionalCommitsFilter: spy()
      });

      stub(git, 'getRawCommits').returns([
        {a: 1},
        {b: 2}
      ]);
      stub(git, '_parseRawCommit').returns({});

      git.conventionalCommits('xyz', {});

      assert(git._parseRawCommit.calledWith({a: 1}));
      assert(git._parseRawCommit.calledWith({b: 2}));
    });

    it('filters commits with conventionalCommitsFilter', function() {
      let git = new Git({
        conventionalCommitsFilter: spy()
      });

      stub(git, 'getRawCommits').returns([
        {a: 1},
        {b: 2}
      ]);
      stub(git, '_parseRawCommit').returns({a: 1});

      git.conventionalCommits('xyz', {});

      assert(git.conventionalCommitsFilter.calledWith([{a: 1}, {a: 1}]));
    });

    it('returns anything conventionalCommitsFilter returns', function() {
      let git = new Git({
        conventionalCommitsFilter: stub().returns(123)
      });

      stub(git, 'getRawCommits').returns([]);
      stub(git, '_parseRawCommit');
      equal(git.conventionalCommits(), 123);
    });
  });
});
