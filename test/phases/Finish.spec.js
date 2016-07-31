import {throws, doesNotThrow} from 'assert';
import {stub} from 'sinon';
import Finish from '../../src/phases/Finish';
import Release from '../../src/Release';

describe('Finish', function() {
  beforeEach(function() {
    this.release = new Release();
    stub(this.release.logger, 'debug');
  });

  describe('validate', function() {
    it('throws if currentBranch is not release branch', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';

      stub(this.release.git, 'getCurrentBranch').returns('foo');

      let phase = new Finish();

      throws(() => {
        phase.validate(this.release);
      }, /You can only finish a release from a release branch$/);
    });

    it('does not throw if currentBranch is a release branch', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';
      stub(this.release.git, 'getCurrentBranch').returns('xyz~1.0.0');
      stub(this.release.git, 'hasUntrackedChanges').returns(false);

      let phase = new Finish();

      doesNotThrow(() => {
        phase.validate(this.release);
      }, /You can only finish a release from a release branch$/);
    });
  });
});
