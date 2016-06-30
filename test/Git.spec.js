import {spy, stub} from 'sinon';
import assert, {equal, deepEqual} from 'assert';
import Git from '../src/Git';

describe('Git', function() {
  describe('remoteUrl', function() {
    it('gets remoteUrl based on the remoteName option', function() {
      let git = new Git({
        execCommand: spy(),
        remoteName: 'abc'
      });

      // eslint-disable-next-line no-unused-expressions
      git.remoteUrl;

      assert(git.execCommand.calledWith('git config --get remote.abc.url'));
    });
  });

  describe('repoHttpUrl', function() {
    it('gets repoHttpUrl based on the remoteUrl', function() {
      let git = new Git({
        execCommand() {
          return 'remoteurl.com';
        },
        remoteName: 'abc'
      });

      equal(git.repoHttpUrl, 'http://remoteurl.com');
    });

    it('returns options.repoHttpUrl if present', function() {
      let git = new Git({
        execCommand() {
          return 'remoteurl.com';
        },
        remoteName: 'abc',
        repoHttpUrl: 'xyz'
      });

      equal(git.repoHttpUrl, 'xyz');
    });
  });

  describe('openBranch', function() {
    it('runs git checkout on the passed branch', function() {
      let git = new Git({
        execCommand: spy()
      });

      git.openBranch('abc');

      assert(git.execCommand.calledWith('git checkout -b abc'));
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
      stub(git, 'currentBranch', () => {
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
        'http://abc.com/compare/xyz..abc'
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

  describe('currentBranch', function() {
    it('calls git rev-parse --abbrev-ref HEAD', function() {
      let git = new Git({
        execCommand: spy()
      });

      git.currentBranch();

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

      git.hasUnpushedCommits();

      assert(git.execCommand.calledWith(
        'git --no-pager cherry -v'
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

  describe('parseTagHistoryLine', function() {
    it('returns an object for a valid line', function() {
      let git = new Git();

      deepEqual(git.parseTagHistoryLine(
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

  describe('lastLocalTagSha', function() {

  });

  describe('lastTagName', function() {

  });

  describe('hasLocalTag', function() {

  });

  describe('isCurrentBranch', function() {

  });

  describe('commits', function() {

  });
});
