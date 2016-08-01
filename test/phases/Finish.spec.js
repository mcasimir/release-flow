import {equal, throws, doesNotThrow} from 'assert';
import {stub} from 'sinon';
import Finish from '../../src/phases/Finish';
import Release from '../../src/Release';

describe('Finish', function() {
  beforeEach(function() {
    this.release = new Release();
    stub(this.release.logger, 'debug');
  });

  describe('getReleaseInfo', function() {
    it('derives info from current branch', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';
      this.release.options.tagPrefix = 'vx';

      stub(this.release.git, 'getCurrentBranch').returns('xyz~foo');

      let phase = new Finish();
      phase.getReleaseInfo(this.release);

      equal(this.release.branchName, 'xyz~foo');
      equal(this.release.name, 'foo');
      equal(this.release.tagName, 'vxfoo');
    });
  });

  describe('validateReleaseBranch', function() {
    it('throws if currentBranch is not release branch', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';

      stub(this.release.git, 'getCurrentBranch').returns('foo');
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);

      let phase = new Finish();

      throws(() => {
        phase.validateReleaseBranch(this.release);
      }, /You can only finish a release from a release branch$/);
    });

    it('does not throw if currentBranch is a release branch', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';
      stub(this.release.git, 'getCurrentBranch').returns('xyz~1.0.0');
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);

      let phase = new Finish();

      doesNotThrow(() => {
        phase.validateReleaseBranch(this.release);
      }, /You can only finish a release from a release branch$/);
    });
  });

  describe('checkoutProduction', function() {

  });

  describe('validateProductionBranch', function() {

  });

  describe('mergeToProduction', function() {
    it('checks out the production branch', function() {

    });

    it('merges from derived branchName', function() {

    });

    it('pushes productionBranch', function() {

    });
  });

  describe('tagProduction', function() {
    it('tags productionBranch with tagName', function() {

    });

    it('pushes tagName', function() {

    });
  });
});
