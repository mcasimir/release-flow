import assert, {fail, equal, throws, doesNotThrow} from 'assert';
import {stub} from 'sinon';
import Finish from '../../src/phases/Finish';
import Release from '../../src/Release';

describe('Finish', function() {
  beforeEach(function() {
    this.release = new Release();
    stub(this.release.logger, 'debug');
  });

  describe('fetch', function() {
    it('fetches heads and tags', function() {
      stub(this.release.git, 'fetchHeadsAndTags');

      let phase = new Finish();
      phase.fetch(this.release);

      assert(this.release.git.fetchHeadsAndTags.called);
    });

    it('breaks in case of error', function() {
      stub(this.release.git, 'fetchHeadsAndTags').throws();

      let phase = new Finish();
      try {
        phase.fetch(this.release);
        fail('Should not get here');
      } catch (e) {
        equal(e.message, 'Unable to fetch tags and heads');
      }
    });
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

    it('throws if hasUntrackedChanges', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';

      stub(this.release.git, 'getCurrentBranch').returns('xyz~1.0.0');
      stub(this.release.git, 'hasUntrackedChanges').returns(true);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);

      let phase = new Finish();

      throws(() => {
        phase.validateReleaseBranch(this.release);
      }, /You have untracked changes$/);
    });

    it('does not throw if has not hasUntrackedChanges', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';

      stub(this.release.git, 'getCurrentBranch').returns('xyz~1.0.0');
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);

      let phase = new Finish();

      doesNotThrow(() => {
        phase.validateReleaseBranch(this.release);
      }, /You have untracked changes$/);
    });

    it('throws if hasUnpushedCommits', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';

      stub(this.release.git, 'getCurrentBranch').returns('xyz~1.0.0');
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(true);

      let phase = new Finish();

      throws(() => {
        phase.validateReleaseBranch(this.release);
      }, /You have unpushed changes$/);
    });

    it('does not throw if has not hasUnpushedCommits', function() {
      this.release.options.releaseBranchPrefix = 'xyz~';

      stub(this.release.git, 'getCurrentBranch').returns('xyz~1.0.0');
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);

      let phase = new Finish();

      doesNotThrow(() => {
        phase.validateReleaseBranch(this.release);
      }, /You have unpushed changes$/);
    });

  });

  describe('checkoutProduction', function() {
    it('calls checkout on production branch', function() {
      this.release.options.productionBranch = 'prod';

      stub(this.release.git, 'checkout');

      let phase = new Finish();
      phase.checkoutProduction(this.release);

      assert(this.release.git.checkout.calledWith('prod'));
    });
  });

  describe('validateProductionBranch', function() {
    it('throws if hasUntrackedChanges', function() {
      stub(this.release.git, 'hasUntrackedChanges').returns(true);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);

      let phase = new Finish();

      throws(() => {
        phase.validateProductionBranch(this.release);
      }, /You have untracked changes$/);
    });

    it('does not throw if has not hasUntrackedChanges', function() {
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);

      let phase = new Finish();

      doesNotThrow(() => {
        phase.validateProductionBranch(this.release);
      }, /You have untracked changes$/);
    });

    it('throws if hasUnpushedCommits', function() {
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(true);

      let phase = new Finish();

      throws(() => {
        phase.validateProductionBranch(this.release);
      }, /You have unpushed changes$/);
    });

    it('does not throw if has not hasUnpushedCommits', function() {
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);

      let phase = new Finish();

      doesNotThrow(() => {
        phase.validateProductionBranch(this.release);
      }, /You have unpushed changes$/);
    });
  });

  describe('mergeToProduction', function() {
    it('merges from derived branchName', function() {
      stub(this.release.git, 'merge');
      stub(this.release.git, 'pushRef');
      this.release.branchName = 'xyz';

      let phase = new Finish();
      phase.mergeToProduction(this.release);

      assert(this.release.git.merge.calledWith('xyz'));
    });

    it('pushes productionBranch', function() {
      stub(this.release.git, 'merge');
      stub(this.release.git, 'pushRef');
      this.release.options.productionBranch = 'prod123';

      let phase = new Finish();
      phase.mergeToProduction(this.release);

      assert(this.release.git.pushRef.calledWith('prod123'));
    });
  });

  describe('tagProduction', function() {
    it('tags productionBranch with tagName', function() {
      stub(this.release.git, 'tag');
      stub(this.release.git, 'pushRef');
      this.release.tagName = 'tag123';

      let phase = new Finish();
      phase.tagProduction(this.release);

      assert(this.release.git.tag.calledWith('tag123'));
    });

    it('pushes tagName', function() {
      stub(this.release.git, 'tag');
      stub(this.release.git, 'pushRef');
      this.release.tagName = 'tag123';

      let phase = new Finish();
      phase.tagProduction(this.release);

      assert(this.release.git.pushRef.calledWith('tag123'));
    });
  });

  describe('mergeBackToDevelopment', function() {
    it('checks out developmentBranch if dev !== prod', function() {
      stub(this.release.git, 'checkout');
      stub(this.release.git, 'merge');
      stub(this.release.git, 'pushRef');
      this.release.options.developmentBranch = 'devxyz';
      this.release.options.productionBranch = 'prodxyz';

      let phase = new Finish();
      phase.mergeBackToDevelopment(this.release);

      assert(this.release.git.checkout.calledWith('devxyz'));
    });

    it('merges from derived branchName if dev !== prod', function() {
      stub(this.release.git, 'checkout');
      stub(this.release.git, 'merge');
      stub(this.release.git, 'pushRef');
      this.release.options.developmentBranch = 'devxyz';
      this.release.options.productionBranch = 'prodxyz';
      this.release.branchName = 'xyz';

      let phase = new Finish();
      phase.mergeBackToDevelopment(this.release);

      assert(this.release.git.merge.calledWith('xyz'));
    });

    it('pushes developmentBranch if dev !== prod', function() {
      stub(this.release.git, 'checkout');
      stub(this.release.git, 'merge');
      stub(this.release.git, 'pushRef');
      this.release.options.developmentBranch = 'devxyz';
      this.release.options.productionBranch = 'prodxyz';

      let phase = new Finish();
      phase.mergeBackToDevelopment(this.release);

      assert(this.release.git.pushRef.calledWith('devxyz'));
    });

    it('does not run checkout, merge and pushRef if dev == prod', function() {
      stub(this.release.git, 'checkout');
      stub(this.release.git, 'merge');
      stub(this.release.git, 'pushRef');

      this.release.options.developmentBranch = 'abc';
      this.release.options.productionBranch = 'abc';

      let phase = new Finish();
      phase.mergeBackToDevelopment(this.release);

      assert(!this.release.git.checkout.called);
      assert(!this.release.git.merge.called);
      assert(!this.release.git.pushRef.called);
    });
  });
});
