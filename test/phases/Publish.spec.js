import assert, {throws, doesNotThrow} from 'assert';
import {stub} from 'sinon';
import Publish from '../../src/phases/Publish';
import Release from '../../src/Release';

describe('Publish', function() {
  beforeEach(function() {
    this.release = new Release();
    stub(this.release.logger, 'debug');
  });

  describe('validate', function() {
    it('throws if currentBranch is not release branch', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';

      stub(this.release.git, 'getCurrentBranch').returns('foo');

      let phase = new Publish();

      throws(() => {
        phase.validate(this.release);
      }, /You can only publish a release from a release branch$/);
    });

    it('does not throw if currentBranch is a release branch', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';
      stub(this.release.git, 'getCurrentBranch').returns('xyz~1.0.0');
      stub(this.release.git, 'hasUntrackedChanges').returns(false);

      let phase = new Publish();

      doesNotThrow(() => {
        phase.validate(this.release);
      }, /You can only publish a release from a release branch$/);
    });

    it('throws if hasUntrackedChanges', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';
      stub(this.release.git, 'getCurrentBranch').returns('xyz~1.0.0');
      stub(this.release.git, 'hasUntrackedChanges').returns(true);

      let phase = new Publish();

      throws(() => {
        phase.validate(this.release);
      }, /You have untracked changes$/);
    });

    it('does not throw if has not hasUntrackedChanges', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';
      stub(this.release.git, 'getCurrentBranch').returns('xyz~1.0.0');
      stub(this.release.git, 'hasUntrackedChanges').returns(false);

      let phase = new Publish();

      doesNotThrow(() => {
        phase.validate(this.release);
      }, /You have untracked changes$/);
    });
  });

  describe('push', function() {
    it('pushes the currentBranch', function() {
      stub(this.release.git, 'getCurrentBranch').returns('foo');
      stub(this.release.git, 'pushRef');
      let phase = new Publish();

      phase.push(this.release);

      assert(this.release.git.pushRef.calledWith('foo'));
    });
  });
});
