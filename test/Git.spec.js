import sinon from 'sinon';
import assert from 'assert';
import Git from '../src/Git';

describe('Git', function() {
  describe('remoteUrl', function() {
    it('gets remoteUrl based on the remoteName option', function() {
      let git = new Git({
        execCommand: sinon.spy(),
        remoteName: 'abc'
      });

      // eslint-disable-next-line no-unused-expressions
      git.remoteUrl;

      assert(git.execCommand.calledWith('git config --get remote.abc.url'));
    });
  });

  describe('openBranch', function() {
    it('runs git checkout on the passed branch', function() {
      let git = new Git({
        execCommand: sinon.spy()
      });

      git.openBranch('abc');

      assert(git.execCommand.calledWith('git checkout -b abc'));
    });
  });
});
