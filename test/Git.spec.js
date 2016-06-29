import {spy, stub} from 'sinon';
import assert, {equal} from 'assert';
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

});
